import type { ReactNode } from 'react';

interface EmptyStateProps {
  /** Icon element displayed inside a colored circle */
  icon: ReactNode;
  /** Primary heading */
  title: string;
  /** Supporting description text */
  description: string;
  /** Background color class for the icon circle. Defaults to 'bg-gray-100' */
  iconBg?: string;
  /** Optional action element (e.g. a Button) rendered below the description */
  action?: ReactNode;
}

/**
 * Consistent empty state used when a list or section has no data.
 *
 * Renders a centered layout with:
 * - Circular icon in a colored background
 * - Heading + description text
 * - Optional action button
 *
 * @example
 * <EmptyState
 *   icon={<CheckIcon className="w-8 h-8 text-green-500" />}
 *   iconBg="bg-green-50"
 *   title="All Caught Up"
 *   description="You have no assessments to review."
 * />
 *
 * <EmptyState
 *   icon={<ChartIcon className="w-8 h-8 text-gray-400" />}
 *   title="No EPA Progress Yet"
 *   description="Progress tracking will appear once faculty submit evaluations."
 *   action={<Button variant="primary">Get Started</Button>}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  iconBg = 'bg-gray-100',
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${iconBg} mb-4`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
