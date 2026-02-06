interface SkeletonProps {
  /** Additional CSS classes (width, height, shape) */
  className?: string;
}

/**
 * Animated skeleton placeholder for loading states.
 *
 * A simple `div` with `animate-pulse` and `bg-gray-200`. You control
 * dimensions and shape via `className`.
 *
 * @example
 * // Text line
 * <Skeleton className="h-4 w-32 rounded" />
 *
 * // Square avatar
 * <Skeleton className="h-12 w-12 rounded-lg" />
 *
 * // Full-width bar
 * <Skeleton className="h-2 w-full rounded-full" />
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`bg-gray-200 animate-pulse ${className}`.trim()} />;
}

// ── Pre-composed skeleton patterns ────────────────────────────────────

interface SkeletonCardProps {
  /** Number of skeleton cards to render */
  count?: number;
  /** Content to render inside each skeleton card */
  children?: React.ReactNode;
}

/**
 * Skeleton card matching the Card component's visual style.
 *
 * Renders N card-shaped placeholders. Pass children for custom
 * skeleton content, or leave empty for a simple block.
 *
 * @example
 * // 4 simple skeleton cards
 * <SkeletonCard count={4} />
 *
 * // Custom skeleton layout inside cards
 * <SkeletonCard count={3}>
 *   <div className="flex justify-between mb-2">
 *     <Skeleton className="h-3 w-16 rounded" />
 *     <Skeleton className="h-8 w-20 rounded-lg" />
 *   </div>
 *   <Skeleton className="h-4 w-48 rounded" />
 * </SkeletonCard>
 */
export function SkeletonCard({ count = 1, children }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
          {children ?? <Skeleton className="h-16 w-full rounded" />}
        </div>
      ))}
    </>
  );
}
