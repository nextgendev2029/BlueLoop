/**
 * Minimal typed fetch wrapper for BlueLoop API requests.
 */

export interface ApiError {
  error: string;
  message: string;
  path?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: 'NetworkError',
        message: `HTTP error ${response.status}: ${response.statusText}`,
      };
    }
    throw new Error(errorData.message || 'An unexpected API error occurred');
  }

  return response.json() as Promise<T>;
}
