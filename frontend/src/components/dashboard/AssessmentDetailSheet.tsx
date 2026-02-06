import type { Assessment } from "../../types/api";
import { ENTRUSTMENT_DESCRIPTIONS } from "../../types/api";
import { BottomSheet, EntrustmentBadge, SectionLabel, Button } from "../ui";

interface AssessmentDetailSheetProps {
  assessment: Assessment | null;
  onClose: () => void;
  /** Optional acknowledge handler — shown when assessment is unacknowledged */
  onAcknowledge?: (id: string) => void;
  /** When true, renders as a nested sheet with higher z-index and back button */
  nested?: boolean;
}

/** Human-readable label for location type */
function formatLocation(type: string | null): string | null {
  if (!type) return null;
  const map: Record<string, string> = {
    or: "Operating Room",
    clinic: "Clinic",
    icu: "ICU",
    ed: "Emergency Dept",
    ward: "Ward",
    other: "Other",
  };
  return map[type] ?? type;
}

/** Human-readable label for case urgency */
function formatUrgency(urgency: string | null): string | null {
  if (!urgency) return null;
  return urgency.charAt(0).toUpperCase() + urgency.slice(1);
}

/** Human-readable label for case complexity */
function formatComplexity(complexity: string | null): string | null {
  if (!complexity) return null;
  return complexity.charAt(0).toUpperCase() + complexity.slice(1);
}

/**
 * Full-detail BottomSheet for a single assessment.
 *
 * Shows everything the card shows plus:
 * - Full (non-truncated) narrative feedback
 * - Case context: urgency, complexity, location
 * - Acknowledge button if the assessment hasn't been reviewed
 */
export function AssessmentDetailSheet({
  assessment,
  onClose,
  onAcknowledge,
  nested = false,
}: AssessmentDetailSheetProps) {
  if (!assessment) return null;

  const levelInfo = ENTRUSTMENT_DESCRIPTIONS.find(
    (d) => d.level === assessment.entrustment_level
  );

  const dateStr = new Date(assessment.assessment_date).toLocaleDateString(
    "en-US",
    { weekday: "short", month: "short", day: "numeric", year: "numeric" }
  );

  const location = formatLocation(assessment.location_type);
  const urgency = formatUrgency(assessment.case_urgency);
  const complexity = formatComplexity(assessment.case_complexity);
  const hasContext = location || urgency || complexity;

  return (
    <BottomSheet
      isOpen={assessment !== null}
      onClose={onClose}
      title={assessment.epa_name}
      nested={nested}
    >
      <div className="space-y-5">
        {/* Header: EPA number + entrustment badge */}
        <div className="flex items-center justify-between">
          <SectionLabel>{assessment.epa_number}</SectionLabel>
          <EntrustmentBadge level={assessment.entrustment_level} />
        </div>

        {/* Faculty + date */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="w-4 h-4 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <span>
            Dr. {assessment.faculty_first_name} {assessment.faculty_last_name}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500">{dateStr}</span>
        </div>

        {/* Narrative feedback */}
        {assessment.narrative_feedback && (
          <div>
            <SectionLabel className="mb-2 block">Feedback</SectionLabel>
            <div
              className={`${
                nested ? "bg-white/80" : "bg-gray-50"
              } rounded-xl p-3`}
            >
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {assessment.narrative_feedback}
              </p>
            </div>
          </div>
        )}

        {/* Case context */}
        {hasContext && (
          <div>
            <SectionLabel className="mb-2 block">Case Context</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {urgency && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 ${
                    nested ? "bg-white/80" : "bg-gray-100"
                  } rounded-lg text-xs text-gray-600`}
                >
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {urgency}
                </span>
              )}
              {complexity && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 ${
                    nested ? "bg-white/80" : "bg-gray-100"
                  } rounded-lg text-xs text-gray-600`}
                >
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                  {complexity}
                </span>
              )}
              {location && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 ${
                    nested ? "bg-white/80" : "bg-gray-100"
                  } rounded-lg text-xs text-gray-600`}
                >
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  {location}
                </span>
              )}
              {assessment.site_name && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 ${
                    nested ? "bg-white/80" : "bg-gray-100"
                  } rounded-lg text-xs text-gray-600`}
                >
                  {assessment.site_name}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Level description */}
        {levelInfo && (
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">
                Level {assessment.entrustment_level} — {levelInfo.shortName}:
              </span>{" "}
              {levelInfo.description}
            </p>
          </div>
        )}

        {/* Acknowledge button (only for unacknowledged assessments) */}
        {!assessment.acknowledged && onAcknowledge && (
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              onAcknowledge(assessment.id);
              onClose();
            }}
          >
            Mark as Reviewed
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}
