import { useApi } from './useApi';
import type { Assessment } from '../types/api';

/**
 * Hook to fetch assessment history with optional filtering.
 *
 * Used in EPA detail drill-down to show assessments for a specific EPA,
 * or in general assessment history view.
 *
 * @param residentId - The resident's ID, or null to skip fetching
 * @param epaId - Optional EPA ID to filter by specific EPA
 * @returns { data: Assessment[], loading, error, refetch }
 *
 * @example
 * // All assessments for a resident
 * const { data: assessments } = useAssessments(residentId)
 *
 * @example
 * // Assessments for a specific EPA (drill-down view)
 * const { data: epaAssessments } = useAssessments(residentId, selectedEpaId)
 */
export function useAssessments(residentId: string | null, epaId?: string) {
  const params = new URLSearchParams();
  if (residentId) params.set('resident_id', residentId);
  if (epaId) params.set('epa_id', epaId);

  const url = residentId ? `/api/assessments?${params.toString()}` : null;
  return useApi<Assessment[]>(url);
}
