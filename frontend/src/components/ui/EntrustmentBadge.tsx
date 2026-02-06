import type { EntrustmentLevel } from '../../types/api';
import { ENTRUSTMENT_DESCRIPTIONS } from '../../types/api';
import { levelBadgeClasses, levelBgColor, levelTextColor } from './entrustment';

type BadgeSize = 'sm' | 'md' | 'lg';

interface EntrustmentBadgeProps {
  /** Entrustment level (1-5) */
  level: EntrustmentLevel;
  /** Whether to show the short label (e.g. "Observe") alongside the number */
  showLabel?: boolean;
  /** Size preset */
  size?: BadgeSize;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Color-coded entrustment level badge.
 *
 * Shows the level number with optional short label. Color-coded:
 * 1-2 red, 3 yellow, 4-5 green.
 *
 * @example
 * // Compact badge: just the number
 * <EntrustmentBadge level="3" size="sm" />
 *
 * // Standard badge: number + label
 * <EntrustmentBadge level="4" showLabel />
 *
 * // Large display badge (used in progress cards)
 * <EntrustmentBadge level="5" showLabel size="lg" />
 */
export function EntrustmentBadge({
  level,
  showLabel = true,
  size = 'md',
  className = '',
}: EntrustmentBadgeProps) {
  const info = ENTRUSTMENT_DESCRIPTIONS.find((d) => d.level === level);
  const label = info?.shortName ?? `Level ${level}`;

  if (size === 'lg') {
    // Large display variant (stacked number + label, used in EpaProgressCard)
    return (
      <div
        className={`
          flex flex-col items-center justify-center
          min-w-12 px-2 py-1 rounded-lg
          ${levelBgColor(level)}
          ${className}
        `.trim()}
      >
        <span className={`text-lg font-bold ${levelTextColor(level)}`}>
          {level}
        </span>
        {showLabel && (
          <span className={`text-[10px] font-medium ${levelTextColor(level)}`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Small and medium: inline badge with border
  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-xs'
    : 'px-2 py-1 text-sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1
        ${sizeClasses} rounded-lg border
        font-semibold whitespace-nowrap shrink-0
        ${levelBadgeClasses(level)}
        ${className}
      `.trim()}
    >
      <span className={size === 'sm' ? 'text-xs' : 'text-base'}>{level}</span>
      {showLabel && (
        <span className={size === 'sm' ? 'text-[10px] font-medium' : 'text-xs font-medium'}>
          {label}
        </span>
      )}
    </span>
  );
}
