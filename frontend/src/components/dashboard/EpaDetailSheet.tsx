import { useState } from 'react';
import type { EpaProgress, Assessment } from '../../types/api';
import { ENTRUSTMENT_DESCRIPTIONS } from '../../types/api';
import { useAssessments } from '../../hooks/useAssessments';
import { BottomSheet, EntrustmentBadge, SectionLabel, Skeleton, ProgressBar } from '../ui';
import { LevelDistributionChart } from './LevelDistributionChart';
import { AssessmentDetailSheet } from './AssessmentDetailSheet';

interface EpaDetailSheetProps {
  epa: EpaProgress | null;
  residentId: string;
  onClose: () => void;
}

/** Max assessments to show before "Show more" */
const INITIAL_ASSESSMENT_COUNT = 5;

/**
 * BottomSheet showing full EPA detail when a progress card is tapped.
 *
 * Displays:
 * - Full EPA title and number
 * - Requirement status with progress fraction
 * - Level distribution chart (1-5 horizontal bars)
 * - Recent assessments for this EPA (tap for detail)
 */
export function EpaDetailSheet({
  epa,
  residentId,
  onClose,
}: EpaDetailSheetProps) {
  const [showAllAssessments, setShowAllAssessments] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);

  // Fetch assessments for this specific EPA
  const { data: assessments, loading: assessmentsLoading } = useAssessments(
    epa ? residentId : null,
    epa?.epa_id
  );

  if (!epa) return null;

  const req = epa.requirement;
  const hasRequirement = req !== null;
  const isMet = req?.is_met ?? false;

  const visibleAssessments =
    assessments && !showAllAssessments
      ? assessments.slice(0, INITIAL_ASSESSMENT_COUNT)
      : assessments;

  const hasMore =
    assessments !== null && assessments.length > INITIAL_ASSESSMENT_COUNT;

  return (
    <>
      <BottomSheet
        isOpen={epa !== null}
        onClose={onClose}
        title={epa.epa_number}
      >
        <div className="space-y-5">
          {/* EPA title */}
          <div>
            <h3 className="text-base font-medium text-gray-900 leading-snug">
              {epa.title}
            </h3>
            <span className="inline-block mt-1 text-xs text-gray-400 capitalize">
              {epa.category}
            </span>
          </div>

          {/* Requirement status */}
          {hasRequirement && (
            <div
              className={`
                rounded-xl p-3
                ${isMet ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}
              `}
            >
              <div className="flex items-center justify-between mb-1.5">
                <SectionLabel
                  className={isMet ? '!text-green-700' : '!text-amber-700'}
                >
                  {isMet ? 'Requirement Met' : 'Requirement Not Met'}
                </SectionLabel>
                <span
                  className={`text-xs font-medium ${
                    isMet ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {req.current_count_at_level} / {req.target_count}
                </span>
              </div>
              <ProgressBar
                value={req.current_count_at_level}
                max={req.target_count}
                color={isMet ? 'bg-green-500' : 'bg-amber-500'}
                trackColor="bg-white/60"
              />
              <p
                className={`text-xs mt-1.5 ${
                  isMet ? 'text-green-600' : 'text-amber-600'
                }`}
              >
                {isMet
                  ? `All ${req.target_count} assessments at Level ${req.target_level}+ achieved`
                  : `Need ${req.deficit} more assessment${req.deficit !== 1 ? 's' : ''} at Level ${req.target_level}+`}
              </p>
            </div>
          )}

          {/* Level distribution */}
          <div>
            <SectionLabel className="mb-3 block">
              Level Distribution
              <span className="ml-1 normal-case font-normal text-gray-400">
                ({epa.total_assessments} total)
              </span>
            </SectionLabel>
            <LevelDistributionChart
              levels={{
                level_1: epa.level_1,
                level_2: epa.level_2,
                level_3: epa.level_3,
                level_4: epa.level_4,
                level_5: epa.level_5,
              }}
              targetLevel={req?.target_level}
            />
          </div>

          {/* Recent assessments */}
          <div>
            <SectionLabel className="mb-3 block">
              Assessment History
            </SectionLabel>

            {assessmentsLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            )}

            {!assessmentsLoading && (!assessments || assessments.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">
                No assessments recorded yet.
              </p>
            )}

            {!assessmentsLoading && visibleAssessments && visibleAssessments.length > 0 && (
              <div className="space-y-2">
                {visibleAssessments.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAssessment(a)}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl p-3 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        Dr. {a.faculty_first_name} {a.faculty_last_name}
                      </span>
                      <EntrustmentBadge level={a.entrustment_level} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      {a.narrative_feedback ? (
                        <p className="text-xs text-gray-600 line-clamp-1 mr-2">
                          {a.narrative_feedback}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-300 italic">
                          No feedback
                        </p>
                      )}
                      <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                        {new Date(a.assessment_date).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                  </button>
                ))}

                {/* Show more / less */}
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setShowAllAssessments(!showAllAssessments)}
                    className="w-full py-2 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    {showAllAssessments
                      ? 'Show less'
                      : `Show all ${assessments!.length} assessments`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </BottomSheet>

      {/* Nested: Assessment detail sheet (visually distinct from parent) */}
      <AssessmentDetailSheet
        assessment={selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        nested
      />
    </>
  );
}
