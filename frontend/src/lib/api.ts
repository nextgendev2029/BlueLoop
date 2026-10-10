/**
 * BlueLoop Typed API Client
 * Robust fetch wrapper handling RFC 7807 error responses, timeout, and query parameters.
 */

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  detail?: string | any;
  path?: string;
}

export class BlueLoopApiError extends Error {
  public status: number;
  public errorCode?: string;
  public detail?: any;
  public path?: string;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'BlueLoopApiError';
    this.status = status;
    this.errorCode = payload?.error;
    this.detail = payload?.detail;
    this.path = payload?.path;
  }
}

/**
 * Executes a typed request against the BlueLoop REST API.
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit & { params?: Record<string, string | number | boolean | undefined | null> }
): Promise<T> {
  let url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Append query parameters if provided
  if (options?.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options?.headers,
      },
      ...options,
    });
  } catch (err: any) {
    throw new BlueLoopApiError(0, err.message || 'Network connection failed. Backend service may be offline.', {
      error: 'NETWORK_ERROR',
      message: 'Failed to communicate with BlueLoop backend.',
    });
  }

  if (!response.ok) {
    let errorPayload: ApiErrorPayload | undefined;
    try {
      errorPayload = await response.json();
    } catch {
      // Body not JSON
    }

    const message =
      (typeof errorPayload?.detail === 'string' ? errorPayload.detail : errorPayload?.message) ||
      `HTTP error ${response.status}: ${response.statusText}`;

    throw new BlueLoopApiError(response.status, message, errorPayload);
  }

  // Handle empty responses (e.g. 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
