import { useApi } from './useApi';
import type { EpaDefinition } from '../types/api';

/**
 * Hook to fetch EPA definitions.
 * Wraps useApi for the /api/epas endpoint.
 */
export function useEpas() {
  return useApi<EpaDefinition[]>('/api/epas');
}
