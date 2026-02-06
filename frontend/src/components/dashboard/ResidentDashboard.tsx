import { useState, useEffect, useCallback } from 'react';
import { useResidentProgress } from '../../hooks/useResidentProgress';
import { useUnacknowledgedAssessments } from '../../hooks/useUnacknowledgedAssessments';
import { patchApi } from '../../hooks/useApi';
import type { Assessment } from '../../types/api';
import { ProgressSummary } from './ProgressSummary';
import { TabBar, type DashboardTab } from './TabBar';
import { EpaProgressList } from './EpaProgressList';
import { UnacknowledgedList } from './UnacknowledgedList';

interface ResidentDashboardProps {
  residentId: string;
}

/**
 * Main dashboard for residents.
 *
 * Owns ALL unacknowledged assessment state so that the "To Review" badge,
 * summary stat card, and the assessment list always stay in sync.
 *
 * Optimistic acknowledge flow:
 * 1. User taps "Mark as Reviewed"
 * 2. Assessment ID added to acknowledgedIds → card hidden + count decremented instantly
 * 3. PATCH API fires in background
 * 4. On success: refetch server data → acknowledgedIds reset
 * 5. On failure: rollback → card reappears + count restored
 */
export function ResidentDashboard({ residentId }: ResidentDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('progress');

  const { data: progress, loading: progressLoading } = useResidentProgress(residentId);
  const {
    data: unacknowledged,
    loading: unacknowledgedLoading,
    refetch: refetchUnacknowledged,
  } = useUnacknowledgedAssessments(residentId);

  // IDs that have been optimistically acknowledged but not yet confirmed by server
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  // Reset optimistic removals when fresh server data arrives
  useEffect(() => {
    setAcknowledgedIds(new Set());
  }, [unacknowledged]);

  // Visible assessments = server data minus optimistic removals
  const visibleUnacknowledged: Assessment[] = (unacknowledged ?? []).filter(
    (a) => !acknowledgedIds.has(a.id)
  );
  const toReviewCount = visibleUnacknowledged.length;

  // Single acknowledge handler shared with child — lives here so both
  // the list display and the count are derived from the same state.
  const handleAcknowledge = useCallback(async (id: string) => {
    // Optimistic: hide immediately
    setAcknowledgedIds((prev) => new Set(prev).add(id));

    try {
      await patchApi(`/api/assessments/${id}/acknowledge`);
      // Refetch updates `unacknowledged`, which resets `acknowledgedIds` via useEffect
      await refetchUnacknowledged();
    } catch {
      // Rollback on failure
      setAcknowledgedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [refetchUnacknowledged]);

  const stats = progress?.stats ?? {
    total_assessments: 0,
    requirements_met: 0,
    requirements_total: 0,
    avg_level: 0,
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Progress Summary Cards */}
      <ProgressSummary
        totalAssessments={stats.total_assessments}
        requirementsMet={stats.requirements_met}
        requirementsTotal={stats.requirements_total}
        avgLevel={stats.avg_level}
        unacknowledgedCount={toReviewCount}
        loading={progressLoading}
      />

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        toReviewCount={toReviewCount}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'progress' ? (
          <EpaProgressList
            progress={progress?.progress ?? []}
            loading={progressLoading}
            residentId={residentId}
          />
        ) : (
          <UnacknowledgedList
            assessments={visibleUnacknowledged}
            loading={unacknowledgedLoading && unacknowledged === null}
            onAcknowledge={handleAcknowledge}
          />
        )}
      </div>
    </div>
  );
}

