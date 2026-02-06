import { useState, useMemo } from 'react';
import type { EpaProgress, EpaCategory } from '../../types/api';
import { Skeleton, SkeletonCard, EmptyState } from '../ui';
import { EpaProgressCard } from './EpaProgressCard';
import { EpaDetailSheet } from './EpaDetailSheet';

// Ordered categories matching the EPA selector pills
const CATEGORY_ORDER: { key: EpaCategory; label: string }[] = [
  { key: 'intraoperative', label: 'Intraoperative' },
  { key: 'preoperative', label: 'Preoperative' },
  { key: 'postoperative', label: 'Postoperative' },
  { key: 'longitudinal', label: 'Longitudinal' },
  { key: 'professional', label: 'Professional' },
];

function CategoryDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

interface EpaProgressListProps {
  progress: EpaProgress[];
  loading: boolean;
  residentId: string;
}

/**
 * Renders a list of EpaProgressCard components.
 *
 * Handles:
 * - Loading state with animated skeleton cards
 * - Empty state when no EPAs have been assessed
 * - Groups EPAs and renders a card for each
 */
export function EpaProgressList({ progress, loading, residentId }: EpaProgressListProps) {
  const [selectedEpa, setSelectedEpa] = useState<EpaProgress | null>(null);

  // Group progress items by category
  const groupedProgress = useMemo(() => {
    const groups: Record<EpaCategory, EpaProgress[]> = {
      intraoperative: [],
      preoperative: [],
      postoperative: [],
      longitudinal: [],
      professional: [],
    };

    progress.forEach((epa) => {
      if (groups[epa.category]) {
        groups[epa.category].push(epa);
      }
    });

    return groups;
  }, [progress]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <SkeletonCard count={4}>
          {/* Skeleton header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              <Skeleton className="h-3 w-16 rounded mb-2" />
              <Skeleton className="h-4 w-48 rounded" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
          {/* Skeleton progress bar */}
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-8 rounded" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          {/* Skeleton footer */}
          <div className="flex justify-between mt-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </SkeletonCard>
      </div>
    );
  }

  if (progress.length === 0) {
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          title="No EPA Progress Yet"
          description="Your EPA assessments and progress tracking will appear here once faculty submit evaluations."
        />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-3">
        {CATEGORY_ORDER.map((category) => {
          const epasInCategory = groupedProgress[category.key];
          if (epasInCategory.length === 0) return null;
          return (
            <div key={category.key} className="space-y-3">
              <CategoryDivider label={category.label} />
              {epasInCategory.map((epa) => (
                <EpaProgressCard
                  key={epa.epa_id}
                  epa={epa}
                  onTap={setSelectedEpa}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* EPA detail drill-down */}
      <EpaDetailSheet
        epa={selectedEpa}
        residentId={residentId}
        onClose={() => setSelectedEpa(null)}
      />
    </>
  );
}
