import type { ReactNode } from 'react';

interface SectionLabelProps {
  /** Label text or elements */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Uppercase, tracking-wide section header used throughout the app.
 *
 * Consistent typography: xs, semibold, gray-500, uppercase, wide tracking.
 *
 * @example
 * <SectionLabel>EPA-1</SectionLabel>
 * <SectionLabel>Case Context</SectionLabel>
 * <SectionLabel className="mb-3">Level Distribution</SectionLabel>
 */
export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <span
      className={`text-xs font-semibold text-gray-500 uppercase tracking-wide ${className}`.trim()}
    >
      {children}
    </span>
  );
}
