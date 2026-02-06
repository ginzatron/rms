import type { EntrustmentLevel } from '../../types/api';
import { ENTRUSTMENT_DESCRIPTIONS } from '../../types/api';
import { levelDotColor } from '../ui/entrustment';

interface LevelDistributionChartProps {
  /** Count of assessments at each entrustment level */
  levels: {
    level_1: number;
    level_2: number;
    level_3: number;
    level_4: number;
    level_5: number;
  };
  /** Highlight the target level for the requirement */
  targetLevel?: EntrustmentLevel;
}

/**
 * Horizontal bar chart showing assessment count at each entrustment level (1-5).
 *
 * Each row displays:
 * - Level number + short label (e.g. "1 Observe")
 * - Horizontal bar sized relative to max count
 * - Numeric count
 *
 * Optionally highlights the target level for the current requirement.
 */
export function LevelDistributionChart({
  levels,
  targetLevel,
}: LevelDistributionChartProps) {
  const counts = [
    levels.level_1,
    levels.level_2,
    levels.level_3,
    levels.level_4,
    levels.level_5,
  ];
  const maxCount = Math.max(...counts, 1); // avoid division by zero

  return (
    <div className="space-y-2">
      {counts.map((count, i) => {
        const level = i + 1;
        const label =
          ENTRUSTMENT_DESCRIPTIONS[i]?.shortName ?? `Level ${level}`;
        const widthPercent = (count / maxCount) * 100;
        const isTarget =
          targetLevel !== undefined && Number(targetLevel) === level;

        return (
          <div key={level} className="flex items-center gap-2">
            {/* Level label */}
            <div className="flex items-center gap-1.5 w-24 shrink-0">
              <span
                className={`
                  text-xs font-bold w-4 text-right
                  ${isTarget ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                {level}
              </span>
              <span
                className={`
                  text-xs truncate
                  ${isTarget ? 'text-blue-600 font-medium' : 'text-gray-400'}
                `}
              >
                {label}
              </span>
            </div>

            {/* Bar */}
            <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden relative">
              <div
                className={`h-full rounded-md transition-all ${levelDotColor(level)}`}
                style={{ width: `${widthPercent}%`, minWidth: count > 0 ? '4px' : '0' }}
              />
              {isTarget && (
                <div
                  className="absolute inset-0 border-2 border-blue-400 rounded-md border-dashed pointer-events-none"
                  title={`Target: Level ${targetLevel}+`}
                />
              )}
            </div>

            {/* Count */}
            <span
              className={`
                text-xs font-medium w-6 text-right tabular-nums
                ${count > 0 ? 'text-gray-700' : 'text-gray-300'}
              `}
            >
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
