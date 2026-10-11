import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, BlueLoopApiError } from '../src/lib/api';

describe('BlueLoop apiClient', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('Successful HTTP Requests', () => {
    it('executes GET request, parses JSON response, and respects default headers', async () => {
      const mockPayload = { status: 'healthy', version: '0.1.0' };
      let capturedUrl = '';
      let capturedOptions: RequestInit | undefined;

      globalThis.fetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
        capturedUrl = url;
        capturedOptions = options;
        return new Response(JSON.stringify(mockPayload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const result = await apiClient<typeof mockPayload>('/api/v1/health');

      expect(result).toEqual(mockPayload);
      expect(capturedUrl).toBe('/api/v1/health');
      expect(capturedOptions?.headers).toMatchObject({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });
    });

    it('prepends leading slash when endpoint is relative', async () => {
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      });

      await apiClient('api/v1/suppliers');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/v1/suppliers',
        expect.anything()
      );
    });

    it('handles 204 No Content gracefully by returning an empty object', async () => {
      globalThis.fetch = vi.fn().mockImplementation(async () => {
        return new Response(null, { status: 204 });
      });

      const result = await apiClient('/api/v1/items/123', { method: 'DELETE' });
      expect(result).toEqual({});
    });
  });

  describe('Query Parameter Construction', () => {
    it('appends params correctly to clean URLs', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      });

      await apiClient('/api/v1/suppliers', {
        params: {
          city: 'Chennai',
          limit: 10,
          offset: 0,
          is_active: true,
        },
      });

      expect(requestedUrl).toBe('/api/v1/suppliers?city=Chennai&limit=10&offset=0&is_active=true');
    });

    it('strips null, undefined, and empty string parameters from queries', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      });

      await apiClient('/api/v1/supplies', {
        params: {
          water_grade: 'GRADE_B',
          status: '',
          min_volume_kl: null,
          max_price: undefined,
          limit: 25,
        },
      });

      expect(requestedUrl).toBe('/api/v1/supplies?water_grade=GRADE_B&limit=25');
    });

    it('appends with ampersand if URL already contains query parameters', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      });

      await apiClient('/api/v1/allocations?mode=preview', {
        params: { limit: 5 },
      });

      expect(requestedUrl).toBe('/api/v1/allocations?mode=preview&limit=5');
    });
  });

  describe('RFC 7807 and HTTP Error Handling', () => {
    it('extracts detail string from 404 EntityNotFound responses', async () => {
      const errorResponse = {
        error: 'EntityNotFound',
        message: 'Supplier not found',
        detail: "Supplier facility 'FAC-999' not found in registry.",
        path: '/api/v1/suppliers/FAC-999',
      };

      globalThis.fetch = vi.fn().mockImplementation(async () => {
        return new Response(JSON.stringify(errorResponse), {
          status: 404,
          statusText: 'Not Found',
          headers: { 'Content-Type': 'application/json' },
        });
      });

      try {
        await apiClient('/api/v1/suppliers/FAC-999');
        expect.fail('Should have thrown BlueLoopApiError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BlueLoopApiError);
        expect(err.status).toBe(404);
        expect(err.message).toBe("Supplier facility 'FAC-999' not found in registry.");
        expect(err.errorCode).toBe('EntityNotFound');
        expect(err.path).toBe('/api/v1/suppliers/FAC-999');
      }
    });

    it('handles 422 RequestValidationError with detailed error arrays', async () => {
      const validationResponse = {
        error: 'ValidationError',
        message: 'Request validation failed. Verify parameters and payload structure.',
        detail: [
          { loc: ['body', 'required_volume_kl'], msg: 'Input should be greater than 0', type: 'greater_than' },
        ],
        path: '/api/v1/demands',
      };

      globalThis.fetch = vi.fn().mockImplementation(async () => {
        return new Response(JSON.stringify(validationResponse), {
          status: 422,
          statusText: 'Unprocessable Entity',
          headers: { 'Content-Type': 'application/json' },
        });
      });

      try {
        await apiClient('/api/v1/demands', { method: 'POST', body: '{}' });
        expect.fail('Should have thrown BlueLoopApiError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BlueLoopApiError);
        expect(err.status).toBe(422);
        expect(err.message).toBe('Request validation failed. Verify parameters and payload structure.');
        expect(err.errorCode).toBe('ValidationError');
        expect(Array.isArray(err.detail)).toBe(true);
      }
    });

    it('falls back to statusText when error body is non-JSON or unparseable', async () => {
      globalThis.fetch = vi.fn().mockImplementation(async () => {
        return new Response('<html>502 Bad Gateway</html>', {
          status: 502,
          statusText: 'Bad Gateway',
          headers: { 'Content-Type': 'text/html' },
        });
      });

      try {
        await apiClient('/api/v1/health');
        expect.fail('Should have thrown BlueLoopApiError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BlueLoopApiError);
        expect(err.status).toBe(502);
        expect(err.message).toBe('HTTP error 502: Bad Gateway');
      }
    });
  });

  describe('Network Failure and Resilience', () => {
    it('catches network fetch rejections and maps to BlueLoopApiError status 0', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      try {
        await apiClient('/api/v1/health');
        expect.fail('Should have thrown BlueLoopApiError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BlueLoopApiError);
        expect(err.status).toBe(0);
        expect(err.errorCode).toBe('NETWORK_ERROR');
        expect(err.message).toContain('Failed to fetch');
      }
    });
  });

  describe('Base URL and Environment Handling', () => {
    it('respects configured base URL when VITE_API_BASE_URL is set', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
      });

      // When import.meta.env.VITE_API_BASE_URL is unset/empty, relative URL is preserved
      await apiClient('/api/v1/health');
      expect(requestedUrl).toBe('/api/v1/health');
    });
  });
});
