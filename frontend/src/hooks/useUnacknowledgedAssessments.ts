import { useApi } from './useApi';
import type { Assessment } from '../types/api';

/**
 * Hook to fetch assessments that a resident hasn't acknowledged yet.
 *
 * These are assessments with narrative feedback that the resident
 * should review. Once reviewed, they call the acknowledge endpoint
 * and the assessment will no longer appear in this list.
 *
 * @param residentId - The resident's ID (from residents table), or null to skip fetching
 * @returns { data: Assessment[], loading, error, refetch }
 *
 * @example
 * const { data: unacknowledged, refetch } = useUnacknowledgedAssessments(residentId)
 *
 * // After acknowledging an assessment:
 * await patchApi(`/api/assessments/${id}/acknowledge`)
 * refetch() // Refresh the list
 */
export function useUnacknowledgedAssessments(residentId: string | null) {
  return useApi<Assessment[]>(
    residentId ? `/api/residents/${residentId}/unacknowledged` : null
  );
}
