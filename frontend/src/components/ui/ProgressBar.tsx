interface ProgressBarProps {
  /** Current value (0 to max) */
  value: number;
  /** Maximum value. Defaults to 100 */
  max?: number;
  /** Color class for the filled portion. Defaults to 'bg-blue-500' */
  color?: string;
  /** Height class. Defaults to 'h-2' */
  height?: string;
  /** Background color class for the track. Defaults to 'bg-gray-200' */
  trackColor?: string;
  /** Additional CSS classes for the outer container */
  className?: string;
}

/**
 * Horizontal progress bar with configurable color and sizing.
 *
 * @example
 * // Basic progress
 * <ProgressBar value={60} />
 *
 * // Custom color based on entrustment level
 * <ProgressBar value={3} max={5} color="bg-green-500" />
 *
 * // EPA requirement progress
 * <ProgressBar
 *   value={current}
 *   max={target}
 *   color={isMet ? 'bg-green-500' : 'bg-amber-500'}
 * />
 */
export function ProgressBar({
  value,
  max = 100,
  color = 'bg-blue-500',
  height = 'h-2',
  trackColor = 'bg-gray-200',
  className = '',
}: ProgressBarProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`${height} ${trackColor} rounded-full overflow-hidden ${className}`.trim()}>
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
