import { useState } from 'react';
import type { Assessment } from '../../types/api';
import { AssessmentCard } from './AssessmentCard';
import { AssessmentDetailSheet } from './AssessmentDetailSheet';

interface UnacknowledgedListProps {
  /** Already-filtered list of visible unacknowledged assessments */
  assessments: Assessment[];
  /** True only during the initial fetch (before any data has loaded) */
  loading: boolean;
  /** Acknowledge handler owned by the parent (handles optimistic state + API) */
  onAcknowledge: (id: string) => void;
}

/**
 * Pure display component for unacknowledged assessments.
 *
 * All data fetching, optimistic removal, and acknowledge logic live in the
 * parent (ResidentDashboard) so the badge count and this list always agree.
 */
export function UnacknowledgedList({ assessments, loading, onAcknowledge }: UnacknowledgedListProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            {/* Skeleton header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            {/* Skeleton faculty + date */}
            <div className="flex gap-2 mb-3">
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* Skeleton narrative */}
            <div className="space-y-1.5 mb-3">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* Skeleton button */}
            <div className="h-9 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            All Caught Up
          </h3>
          <p className="text-sm text-gray-500">
            You have no assessments to review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-3">
        {assessments.map((assessment) => (
          <AssessmentCard
            key={assessment.id}
            assessment={assessment}
            onAcknowledge={onAcknowledge}
            onTap={setSelectedAssessment}
          />
        ))}
      </div>

      {/* Assessment detail drill-down */}
      <AssessmentDetailSheet
        assessment={selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        onAcknowledge={onAcknowledge}
      />
    </>
  );
}
