import { Skeleton, StatCard } from '../ui';

interface ProgressSummaryProps {
  totalAssessments: number;
  requirementsMet: number;
  requirementsTotal: number;
  avgLevel: number;
  unacknowledgedCount: number;
  loading?: boolean;
}

/**
 * Progress summary cards showing key metrics for resident dashboard.
 *
 * Displays four stat cards:
 * - Total assessments received
 * - Requirements met vs total
 * - Average entrustment level
 * - Unacknowledged assessments (feedback to review)
 */
export function ProgressSummary({
  totalAssessments,
  requirementsMet,
  requirementsTotal,
  avgLevel,
  unacknowledgedCount,
  loading,
}: ProgressSummaryProps) {
  if (loading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          value={totalAssessments}
          label="Total"
          sublabel="Assessments"
        />
        <StatCard
          value={`${requirementsMet}/${requirementsTotal}`}
          label="Met"
          sublabel="Requirements"
        />
        <StatCard
          value={Number(avgLevel || 0).toFixed(1)}
          label="Avg"
          sublabel="Level"
        />
        <StatCard
          value={unacknowledgedCount}
          label="To"
          sublabel="Review"
          highlight={unacknowledgedCount > 0}
        />
      </div>
    </div>
  );
}
