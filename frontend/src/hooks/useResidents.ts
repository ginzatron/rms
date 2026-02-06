import { useApi } from './useApi';
import type { Resident } from '../types/api';

/**
 * Hook to fetch the list of active residents.
 * Wraps useApi for the /api/residents endpoint.
 */
export function useResidents() {
  return useApi<Resident[]>('/api/residents');
}
