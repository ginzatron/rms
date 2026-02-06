// TypeScript interfaces for the RMS API

export interface Resident {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  pgy_level:
    | "PGY-1"
    | "PGY-2"
    | "PGY-3"
    | "PGY-4"
    | "PGY-5"
    | "PGY-6"
    | "PGY-7"
    | "PGY-8";
  status: string;
  email: string;
  photo_url: string | null;
  medical_school: string;
}

export interface Faculty {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  rank: string;
  is_core_faculty: boolean;
  can_assess: boolean;
  email: string;
  photo_url: string | null;
}

export interface EpaDefinition {
  id: string;
  epa_number: string;
  title: string;
  short_name: string;
  category:
    | "preoperative"
    | "intraoperative"
    | "postoperative"
    | "longitudinal"
    | "professional";
  display_order: number;
}

export interface ClinicalSite {
  id: string;
  name: string;
  site_type: string;
}

export type EntrustmentLevel = "1" | "2" | "3" | "4" | "5";

export type CaseUrgency = "elective" | "urgent" | "emergent";

export type CaseComplexity = "straightforward" | "moderate" | "complex";

export type LocationType = "or" | "clinic" | "icu" | "ed" | "ward" | "other";

export type EntryMethod = "mobile_ios" | "mobile_android" | "web";

export interface AssessmentPayload {
  resident_id: string;
  faculty_id: string;
  epa_id: string;
  entrustment_level: EntrustmentLevel;
  observation_date: string; // When the clinical observation occurred (YYYY-MM-DD)
  assessment_date?: string; // When submitted (auto-set by server if not provided)
  clinical_site_id?: string;
  case_urgency?: CaseUrgency;
  case_complexity?: CaseComplexity;
  patient_asa_class?: number;
  procedure_duration_min?: number;
  location_type?: LocationType;
  location_details?: string;
  narrative_feedback?: string;
  entry_method: EntryMethod;
}

export interface EntrustmentDescription {
  level: EntrustmentLevel;
  shortName: string;
  description: string;
}

export const ENTRUSTMENT_DESCRIPTIONS: EntrustmentDescription[] = [
  {
    level: "1",
    shortName: "Observe",
    description: "Allowed to observe only",
  },
  {
    level: "2",
    shortName: "Direct",
    description:
      "Allowed to act with direct supervision (supervisor physically present)",
  },
  {
    level: "3",
    shortName: "Indirect",
    description:
      "Allowed to act with indirect supervision (supervisor immediately available)",
  },
  {
    level: "4",
    shortName: "Available",
    description:
      "Allowed to act independently with distant supervision (supervisor available by phone)",
  },
  {
    level: "5",
    shortName: "Independent",
    description: "Allowed to supervise others performing this activity",
  },
];

export interface CaseComplexityDescription {
  value: CaseComplexity;
  label: string;
  description: string;
}

export const CASE_COMPLEXITY_DESCRIPTIONS: CaseComplexityDescription[] = [
  {
    value: "straightforward",
    label: "Straightforward",
    description: "Easiest 1/3 of similar cases in your practice",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Middle 1/3 of similar cases in your practice",
  },
  {
    value: "complex",
    label: "Complex",
    description: "Hardest 1/3 of similar cases in your practice",
  },
];

// ============================================
// Resident Dashboard Types
// ============================================

export type EpaCategory =
  | "preoperative"
  | "intraoperative"
  | "postoperative"
  | "longitudinal"
  | "professional";

export type UserRole =
  | "resident"
  | "faculty"
  | "program_director"
  | "coordinator"
  | "admin";

export type TrainingLevel =
  | "PGY-1"
  | "PGY-2"
  | "PGY-3"
  | "PGY-4"
  | "PGY-5"
  | "PGY-6"
  | "PGY-7"
  | "PGY-8";

/**
 * User from /api/users endpoint
 * Base user information that applies to all roles
 */
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  photo_url: string | null;
}

/**
 * Extended user info from /api/users/:id endpoint
 * Includes role-specific data (resident or faculty)
 */
export interface UserWithRoleData extends User {
  resident: {
    id: string;
    pgy_level: TrainingLevel;
    status: string;
    medical_school: string;
  } | null;
  faculty: {
    id: string;
    rank: string;
    is_core_faculty: boolean;
    can_assess: boolean;
  } | null;
}

/**
 * Requirement tracking for a single EPA
 * Compares resident's current progress against target
 */
export interface EpaRequirement {
  /** Number of assessments required at target level */
  target_count: number;
  /** Minimum entrustment level that counts toward requirement */
  target_level: EntrustmentLevel;
  /** Current count of assessments at or above target level */
  current_count_at_level: number;
  /** Whether the requirement has been met */
  is_met: boolean;
  /** Number of additional assessments needed (0 if met) */
  deficit: number;
}

/**
 * EPA progress data from /api/residents/:id/progress
 * Includes assessment distribution and requirement tracking
 */
export interface EpaProgress {
  epa_id: string;
  epa_number: string;
  title: string;
  short_name: string;
  category: EpaCategory;
  /** Total assessments received for this EPA */
  total_assessments: number;
  /** Count of Level 1 (Observe) assessments */
  level_1: number;
  /** Count of Level 2 (Direct supervision) assessments */
  level_2: number;
  /** Count of Level 3 (Indirect supervision) assessments */
  level_3: number;
  /** Count of Level 4 (Available) assessments */
  level_4: number;
  /** Count of Level 5 (Independent) assessments */
  level_5: number;
  /** Highest entrustment level achieved, null if no assessments */
  highest_level: EntrustmentLevel | null;
  /** Date of most recent assessment, null if no assessments */
  last_assessment: string | null;
  /** Requirement for current PGY level, null if no requirement defined */
  requirement: EpaRequirement | null;
}

/**
 * Full progress response from /api/residents/:id/progress
 */
export interface ResidentProgress {
  progress: EpaProgress[];
  stats: {
    total_assessments: number;
    epas_assessed: number;
    unique_assessors: number;
    avg_level: number;
    requirements_met: number;
    requirements_total: number;
  };
}

/**
 * Assessment record for display in dashboard
 * Used by unacknowledged endpoint and assessment history
 */
export interface Assessment {
  id: string;
  entrustment_level: EntrustmentLevel;
  assessment_date: string;
  case_urgency: CaseUrgency | null;
  case_complexity: CaseComplexity | null;
  location_type: LocationType | null;
  narrative_feedback: string | null;
  acknowledged: boolean;
  epa_number: string;
  epa_name: string;
  epa_category: EpaCategory;
  faculty_first_name: string;
  faculty_last_name: string;
  site_name: string | null;
}

/**
 * Assessment record for faculty history view.
 * Extends the base Assessment with resident information since
 * faculty need to see which resident they assessed.
 */
export interface FacultyAssessment extends Assessment {
  resident_id: string;
  resident_first_name: string;
  resident_last_name: string;
  pgy_level: TrainingLevel;
}

/**
 * Selected user for UserContext
 * Combines base user info with role-specific IDs needed for API calls
 */
export interface SelectedUser {
  /** User table ID */
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  photoUrl: string | null;
  /** Resident table ID - needed for dashboard API calls */
  residentId?: string;
  /** Faculty table ID - needed for assessment submissions */
  facultyId?: string;
  /** Training level for residents */
  pgyLevel?: TrainingLevel;
}
