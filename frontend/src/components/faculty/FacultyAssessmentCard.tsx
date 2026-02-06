import type { FacultyAssessment } from '../../types/api';
import { Card, EntrustmentBadge } from '../ui';

interface FacultyAssessmentCardProps {
  assessment: FacultyAssessment;
  onTap?: (assessment: FacultyAssessment) => void;
}

/**
 * Assessment card from the faculty perspective.
 *
 * Shows:
 * - Resident name + PGY level (instead of faculty name)
 * - EPA name + entrustment level badge (color-coded)
 * - Date
 * - Narrative feedback (truncated)
 * - Tappable for drill-down to full detail
 */
export function FacultyAssessmentCard({
  assessment,
  onTap,
}: FacultyAssessmentCardProps) {
  const dateStr = new Date(assessment.assessment_date).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  const narrative = assessment.narrative_feedback;
  const truncated =
    narrative && narrative.length > 120
      ? narrative.slice(0, 120) + '...'
      : narrative;

  return (
    <Card onTap={onTap ? () => onTap(assessment) : undefined}>
      {/* Top row: resident name + level badge */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-gray-900 leading-snug">
            {assessment.resident_first_name} {assessment.resident_last_name}
          </h3>
          <span className="text-xs text-gray-400">{assessment.pgy_level}</span>
        </div>
        <EntrustmentBadge level={assessment.entrustment_level} />
      </div>

      {/* EPA + date */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <span className="font-medium text-gray-600">
          {assessment.epa_number}
        </span>
        <span className="text-gray-300">·</span>
        <span className="truncate">{assessment.epa_name}</span>
        <span className="text-gray-300">·</span>
        <span className="whitespace-nowrap shrink-0">{dateStr}</span>
      </div>

      {/* Narrative preview */}
      {truncated && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {truncated}
        </p>
      )}
      {!narrative && (
        <p className="text-xs text-gray-300 italic">No feedback provided</p>
      )}
    </Card>
  );
}
