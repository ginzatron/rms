import { useApi } from './useApi';
import type { ResidentProgress } from '../types/api';

/**
 * Hook to fetch resident EPA progress with requirement tracking.
 *
 * @param residentId - The resident's ID (from residents table), or null to skip fetching
 * @returns { data: ResidentProgress, loading, error, refetch }
 *
 * @example
 * const { data: progress, loading, error } = useResidentProgress(selectedUser?.residentId ?? null)
 *
 * if (loading) return <Spinner />
 * if (!progress) return <SelectResidentPrompt />
 *
 * // progress.stats contains overall statistics
 * // progress.progress contains per-EPA breakdown with requirements
 */
export function useResidentProgress(residentId: string | null) {
  return useApi<ResidentProgress>(
    residentId ? `/api/residents/${residentId}/progress` : null
  );
}
