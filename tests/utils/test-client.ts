/**
 * Test Client Utilities
 *
 * Provides helper functions for making API requests in tests.
 * Configure API_BASE_URL environment variable to test against different servers.
 */

/**
 * Get the base URL for API requests.
 * Defaults to localhost:3000 if not specified.
 */
export function getBaseUrl(): string {
  return process.env.API_BASE_URL || "http://localhost:3000";
}

/**
 * Make a fetch request to the API with proper defaults.
 *
 * @param path - API path (e.g., "/api/users")
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Fetch Response
 */
export async function fetchApi(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
}

/**
 * Make a GET request to the API.
 */
export async function get(path: string): Promise<Response> {
  return fetchApi(path, { method: "GET" });
}

/**
 * Make a POST request to the API.
 */
export async function post(path: string, body: unknown): Promise<Response> {
  return fetchApi(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Make a PATCH request to the API.
 */
export async function patch(path: string, body?: unknown): Promise<Response> {
  return fetchApi(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Make a PUT request to the API.
 */
export async function put(path: string, body: unknown): Promise<Response> {
  return fetchApi(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Make a DELETE request to the API.
 */
export async function del(path: string): Promise<Response> {
  return fetchApi(path, { method: "DELETE" });
}

/**
 * Helper to extract JSON and check response status.
 * Throws if response is not ok.
 */
export async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetchApi(path, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(`API Error ${res.status}: ${JSON.stringify(error)}`);
  }
  return res.json();
}
