import type { EpaProgress } from '../../types/api';
import { Card, EntrustmentBadge, SectionLabel, ProgressBar } from '../ui';
import { levelColor } from '../ui/entrustment';

interface EpaProgressCardProps {
  epa: EpaProgress;
  onTap?: (epa: EpaProgress) => void;
}

/**
 * Single EPA progress card showing:
 * - EPA number and short name
 * - Progress bar (current_count_at_level / target_count)
 * - Warning indicator for unmet requirements
 * - Highest level achieved with label
 * - Last assessment date
 */
export function EpaProgressCard({ epa, onTap }: EpaProgressCardProps) {
  const req = epa.requirement;
  const hasRequirement = req !== null;
  const isMet = req?.is_met ?? false;

  // Progress fraction for the bar
  const current = req?.current_count_at_level ?? 0;
  const target = req?.target_count ?? 1;
  const progressPercent = Math.min((current / target) * 100, 100);

  // Format date
  const lastDate = epa.last_assessment
    ? new Date(epa.last_assessment).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card onTap={onTap ? () => onTap(epa) : undefined}>
      {/* Header: EPA number + name + warning */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <SectionLabel>{epa.epa_number}</SectionLabel>
            {hasRequirement && !isMet && (
              <span
                className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full"
                title={`${req.deficit} more needed at Level ${req.target_level}+`}
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {req.deficit} needed
              </span>
            )}
            {hasRequirement && isMet && (
              <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                <svg
                  className="w-3 h-3 mr-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                Met
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900 mt-0.5 leading-snug">
            {epa.short_name}
          </h3>
        </div>

        {/* Highest level badge */}
        <EntrustmentBadge
          level={epa.highest_level ?? '1'}
          showLabel
          size="lg"
          className={!epa.highest_level ? 'opacity-40' : ''}
        />
      </div>

      {/* Progress bar */}
      {hasRequirement && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>
              {current} / {target} at Level {req.target_level}+
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <ProgressBar
            value={current}
            max={target}
            color={isMet ? 'bg-green-500' : levelColor(epa.highest_level)}
          />
        </div>
      )}

      {/* Footer: total assessments + last date */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
        <span>{epa.total_assessments} assessment{epa.total_assessments !== 1 ? 's' : ''}</span>
        {lastDate && <span>Last: {lastDate}</span>}
      </div>
    </Card>
  );
}
