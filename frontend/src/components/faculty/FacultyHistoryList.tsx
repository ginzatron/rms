import { useState } from 'react';
import type { FacultyAssessment, EntrustmentLevel } from '../../types/api';
import { ENTRUSTMENT_DESCRIPTIONS } from '../../types/api';
import { useFacultyAssessments } from '../../hooks/useFacultyAssessments';
import { Card, Skeleton, SkeletonCard, EmptyState, StatCard } from '../ui';
import { levelDotColor } from '../ui/entrustment';
import { FacultyAssessmentCard } from './FacultyAssessmentCard';
import { AssessmentDetailSheet } from '../dashboard/AssessmentDetailSheet';

interface FacultyHistoryListProps {
  facultyId: string;
}

/**
 * Faculty assessment history list with summary stats.
 *
 * Shows:
 * - Quick stats: total assessments, unique residents, level distribution
 * - Chronological list of assessments (most recent first)
 * - Tap-through to AssessmentDetailSheet
 */
export function FacultyHistoryList({ facultyId }: FacultyHistoryListProps) {
  const { data: assessments, loading } = useFacultyAssessments(facultyId);
  const [selectedAssessment, setSelectedAssessment] =
    useState<FacultyAssessment | null>(null);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {/* Stats skeleton */}
        <Card>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-7 w-10 rounded mb-1" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            ))}
          </div>
        </Card>
        {/* Card skeletons */}
        <SkeletonCard count={4}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <Skeleton className="h-4 w-32 rounded mb-1" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-3 w-48 rounded mb-2" />
          <Skeleton className="h-3 w-full rounded" />
        </SkeletonCard>
      </div>
    );
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          }
          title="No Assessments Yet"
          description='Your submitted assessments will appear here. Switch to the "New" tab to log your first assessment.'
        />
      </div>
    );
  }

  // Compute stats
  const totalCount = assessments.length;
  const uniqueResidents = new Set(assessments.map((a) => a.resident_id)).size;

  // Level distribution
  const levelCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  for (const a of assessments) {
    levelCounts[a.entrustment_level] = (levelCounts[a.entrustment_level] || 0) + 1;
  }

  return (
    <>
      <div className="p-4 space-y-3">
        {/* Summary stats */}
        <Card>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <StatCard value={totalCount} label="Total" />
            <StatCard value={uniqueResidents} label="Residents" />
            <StatCard
              value={(
                assessments.reduce(
                  (sum, a) => sum + Number(a.entrustment_level),
                  0
                ) / totalCount
              ).toFixed(1)}
              label="Avg Level"
            />
          </div>

          {/* Mini level distribution */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 w-12 shrink-0">
              Levels:
            </span>
            <div className="flex-1 flex items-center gap-1">
              {([1, 2, 3, 4, 5] as const).map((level) => {
                const count = levelCounts[String(level) as EntrustmentLevel] || 0;
                const label =
                  ENTRUSTMENT_DESCRIPTIONS[level - 1]?.shortName ?? '';
                return (
                  <div
                    key={level}
                    className="flex-1 flex flex-col items-center"
                    title={`Level ${level} (${label}): ${count}`}
                  >
                    <div className="flex items-end gap-px h-4 w-full justify-center">
                      <div
                        className={`w-full max-w-6 rounded-sm ${levelDotColor(level)}`}
                        style={{
                          height: `${Math.max((count / Math.max(...Object.values(levelCounts), 1)) * 16, count > 0 ? 2 : 0)}px`,
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 mt-0.5">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Assessment list */}
        {assessments.map((assessment) => (
          <FacultyAssessmentCard
            key={assessment.id}
            assessment={assessment}
            onTap={setSelectedAssessment}
          />
        ))}
      </div>

      {/* Detail drill-down */}
      <AssessmentDetailSheet
        assessment={selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
      />
    </>
  );
}
