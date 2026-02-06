interface StatCardProps {
  /** The stat value to display prominently */
  value: string | number;
  /** Primary label */
  label: string;
  /** Secondary label / units */
  sublabel?: string;
  /** When true, uses blue highlight styling */
  highlight?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Metric stat card for dashboards and summaries.
 *
 * Displays a large numeric value with label underneath.
 * Can be highlighted (blue) for attention-worthy metrics.
 *
 * @example
 * <StatCard value={42} label="Total" sublabel="Assessments" />
 * <StatCard value="3.8" label="Avg" sublabel="Level" />
 * <StatCard value={5} label="To" sublabel="Review" highlight />
 */
export function StatCard({
  value,
  label,
  sublabel,
  highlight = false,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        p-3 rounded-xl
        ${highlight ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}
        ${className}
      `.trim()}
    >
      <span
        className={`
          text-2xl font-bold
          ${highlight ? 'text-blue-600' : 'text-gray-900'}
        `}
      >
        {value}
      </span>
      <span className="text-xs text-gray-600 text-center">{label}</span>
      {sublabel && (
        <span className="text-xs text-gray-400 text-center">{sublabel}</span>
      )}
    </div>
  );
}
