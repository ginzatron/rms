import { useApi } from './useApi';
import type { Faculty } from '../types/api';

/**
 * Hook to fetch the list of faculty members.
 * Wraps useApi for the /api/faculty endpoint.
 */
export function useFacultyList() {
  return useApi<Faculty[]>('/api/faculty');
}
