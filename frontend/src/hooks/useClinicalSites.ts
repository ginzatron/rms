import { useApi } from './useApi';
import type { ClinicalSite } from '../types/api';

/**
 * Hook to fetch clinical sites.
 * Wraps useApi for the /api/clinical-sites endpoint.
 */
export function useClinicalSites() {
  return useApi<ClinicalSite[]>('/api/clinical-sites');
}
