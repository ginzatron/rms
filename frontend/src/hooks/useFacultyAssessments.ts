import { useApi } from "./useApi";
import type { FacultyAssessment } from "../types/api";

/**
 * Hook to fetch assessments submitted by a specific faculty member.
 *
 * Returns assessment history with resident info (name, PGY level),
 * ordered by assessment_date DESC.
 *
 * @param facultyId - The faculty's ID (from faculty table), or null to skip fetching
 * @returns { data: FacultyAssessment[], loading, error, refetch }
 *
 * @example
 * const { data: assessments, loading } = useFacultyAssessments(selectedUser?.facultyId ?? null)
 *
 * // Each assessment includes:
 * // - resident_first_name, resident_last_name, pgy_level
 * // - epa_number, epa_name, entrustment_level
 * // - narrative_feedback, assessment_date
 */
export function useFacultyAssessments(facultyId: string | null) {
  return useApi<FacultyAssessment[]>(
    facultyId ? `/api/assessments?faculty_id=${facultyId}` : null
  );
}
