import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Generic data fetching hook that handles loading, error, and refetch states.
 *
 * @param url - API endpoint URL, or null to skip fetching
 * @returns { data, loading, error, refetch }
 *
 * @example
 * // Basic usage
 * const { data, loading, error } = useApi<User[]>('/api/users')
 *
 * @example
 * // Conditional fetching - pass null to skip
 * const { data } = useApi<Progress>(residentId ? `/api/residents/${residentId}/progress` : null)
 */
export function useApi<T>(url: string | null): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: url !== null, // Don't show loading if URL is null
    error: null,
  });

  const fetchData = useCallback(async () => {
    // Skip fetch if URL is null
    if (url === null) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
      const response = await fetch(fullUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as T;
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

// Helper function for POST requests
export async function postApi<TRequest, TResponse>(
  url: string,
  payload: TRequest
): Promise<TResponse> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response.json() as Promise<TResponse>;
}

// Helper function for PATCH requests
export async function patchApi<TResponse>(url: string): Promise<TResponse> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response.json() as Promise<TResponse>;
}
