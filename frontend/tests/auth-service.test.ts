import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  signup,
  login,
  logout,
  getMe,
  updateUserStatus,
  listUsers,
} from '../src/services/auth';
import { getStoredAuthToken } from '../src/lib/api';

describe('BlueLoop Auth Services API Contracts', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('signup posts to /api/v1/auth/signup and stores auth token', async () => {
    let capturedUrl = '';
    let capturedBody = '';

    globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      capturedUrl = url;
      capturedBody = init?.body as string;
      return new Response(
        JSON.stringify({
          token: 'test-session-token-123',
          token_type: 'bearer',
          user: {
            id: 'USR-TEST-01',
            email: 'buyer@test.com',
            name: 'Jane Buyer',
            role: 'buyer',
            org_id: 'ORG-01',
            is_active: true,
          },
          message: 'Account created successfully.',
        }),
        { status: 201 }
      );
    });

    const res = await signup({
      name: 'Jane Buyer',
      company_name: 'Test Corp',
      email: 'buyer@test.com',
      password: 'Password123!',
      role: 'buyer',
    });

    expect(capturedUrl).toBe('/api/v1/auth/signup');
    expect(capturedBody).toContain('buyer@test.com');
    expect(res.token).toBe('test-session-token-123');
    expect(res.user.role).toBe('buyer');
    expect(getStoredAuthToken()).toBe('test-session-token-123');
  });

  it('login posts to /api/v1/auth/login and stores session token', async () => {
    let capturedUrl = '';
    let capturedBody = '';

    globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      capturedUrl = url;
      capturedBody = init?.body as string;
      return new Response(
        JSON.stringify({
          token: 'test-login-token-456',
          token_type: 'bearer',
          user: {
            id: 'USR-SUPP-01',
            email: 'supplier@test.com',
            name: 'Sam Supplier',
            role: 'supplier',
            org_id: 'ORG-SUPP-01',
            is_active: true,
          },
          message: 'Authenticated successfully.',
        }),
        { status: 200 }
      );
    });

    const res = await login({
      email: 'supplier@test.com',
      password: 'Password123!',
    });

    expect(capturedUrl).toBe('/api/v1/auth/login');
    expect(capturedBody).toContain('supplier@test.com');
    expect(res.token).toBe('test-login-token-456');
    expect(res.user.role).toBe('supplier');
    expect(getStoredAuthToken()).toBe('test-login-token-456');
  });

  it('logout posts to /api/v1/auth/logout and clears stored token', async () => {
    let capturedUrl = '';

    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      capturedUrl = url;
      return new Response(
        JSON.stringify({ message: 'Session invalidated successfully.' }),
        { status: 200 }
      );
    });

    const res = await logout();
    expect(capturedUrl).toBe('/api/v1/auth/logout');
    expect(res.message).toContain('invalidated');
    expect(getStoredAuthToken()).toBeNull();
  });

  it('getMe requests /api/v1/auth/me', async () => {
    let capturedUrl = '';

    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      capturedUrl = url;
      return new Response(
        JSON.stringify({
          id: 'USR-BUY-01',
          email: 'buyer@blueloop.io',
          name: 'Apex Facilities Lead',
          role: 'buyer',
          org_id: 'SYNTH-ORG-04',
          is_active: true,
        }),
        { status: 200 }
      );
    });

    const user = await getMe();
    expect(capturedUrl).toBe('/api/v1/auth/me');
    expect(user.id).toBe('USR-BUY-01');
    expect(user.role).toBe('buyer');
  });

  it('listUsers and updateUserStatus work for admin endpoints', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return new Response(
          JSON.stringify({
            id: 'USR-BUY-01',
            email: 'buyer@blueloop.io',
            name: 'Apex Facilities Lead',
            role: 'buyer',
            org_id: 'SYNTH-ORG-04',
            is_active: false,
          }),
          { status: 200 }
        );
      }
      return new Response(
        JSON.stringify([
          {
            id: 'USR-BUY-01',
            email: 'buyer@blueloop.io',
            name: 'Apex Facilities Lead',
            role: 'buyer',
            org_id: 'SYNTH-ORG-04',
            is_active: true,
          },
        ]),
        { status: 200 }
      );
    });

    const users = await listUsers();
    expect(users).toHaveLength(1);
    expect(users[0].id).toBe('USR-BUY-01');

    const updated = await updateUserStatus('USR-BUY-01', false);
    expect(updated.is_active).toBe(false);
  });
});
