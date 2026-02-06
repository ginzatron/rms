import { useState } from 'react';
import type { Assessment } from '../../types/api';
import { ENTRUSTMENT_DESCRIPTIONS } from '../../types/api';
import { Card, EntrustmentBadge, Button, SectionLabel } from '../ui';

interface AssessmentCardProps {
  assessment: Assessment;
  onAcknowledge: (id: string) => void;
  onTap?: (assessment: Assessment) => void;
}

/** Max characters for truncated narrative feedback */
const NARRATIVE_TRUNCATE_LENGTH = 150;

/**
 * Single assessment card for the "To Review" tab.
 *
 * Shows:
 * - EPA name with entrustment level badge (color-coded 1-2 red, 3 yellow, 4-5 green)
 * - Faculty name and date
 * - Narrative feedback (truncated with expand toggle)
 * - "Mark as Reviewed" button
 */
export function AssessmentCard({ assessment, onAcknowledge, onTap }: AssessmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const dateStr = new Date(assessment.assessment_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const narrative = assessment.narrative_feedback;
  const isLong = narrative !== null && narrative.length > NARRATIVE_TRUNCATE_LENGTH;
  const displayNarrative =
    narrative && isLong && !expanded
      ? narrative.slice(0, NARRATIVE_TRUNCATE_LENGTH) + '...'
      : narrative;

  async function handleAcknowledge() {
    setAcknowledging(true);
    try {
      onAcknowledge(assessment.id);
    } catch {
      setAcknowledging(false);
    }
  }

  function handleCardTap() {
    if (onTap) onTap(assessment);
  }

  return (
    <Card>
      {/* Tappable content area (excludes buttons) */}
      <div
        className={onTap ? 'cursor-pointer' : ''}
        onClick={onTap ? handleCardTap : undefined}
        role={onTap ? 'button' : undefined}
        tabIndex={onTap ? 0 : undefined}
        onKeyDown={onTap ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardTap(); } } : undefined}
      >
        {/* Header: EPA name + level badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <SectionLabel>{assessment.epa_number}</SectionLabel>
            <h3 className="text-sm font-medium text-gray-900 mt-0.5 leading-snug">
              {assessment.epa_name}
            </h3>
          </div>
          <EntrustmentBadge level={assessment.entrustment_level} />
        </div>

        {/* Faculty + date */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>
            Dr. {assessment.faculty_first_name} {assessment.faculty_last_name}
          </span>
          <span className="text-gray-300">·</span>
          <span>{dateStr}</span>
        </div>

        {/* Narrative feedback */}
        {narrative && (
          <div className="mb-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {displayNarrative}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className="text-xs text-blue-600 font-medium mt-1 hover:text-blue-700"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Acknowledge button */}
      <Button
        variant="secondary"
        size="md"
        fullWidth
        loading={acknowledging}
        onClick={handleAcknowledge}
      >
        {acknowledging ? 'Marking...' : 'Mark as Reviewed'}
      </Button>
    </Card>
  );
}
