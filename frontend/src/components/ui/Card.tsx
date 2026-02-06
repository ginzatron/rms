import type { ReactNode, KeyboardEvent } from 'react';

interface CardProps {
  children: ReactNode;
  /** When provided, the card becomes tappable with hover/active states and keyboard support */
  onTap?: () => void;
  /** Additional CSS classes to merge with the card base styles */
  className?: string;
  /** Padding preset. Defaults to 'md' (p-4) */
  padding?: 'none' | 'sm' | 'md';
}

const PADDING = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
} as const;

/**
 * Consistent card container used throughout the app.
 *
 * Base style: white background, rounded-xl, 1px gray border.
 * When `onTap` is provided, adds hover/active states and keyboard accessibility.
 *
 * @example
 * // Static card
 * <Card>Content here</Card>
 *
 * // Tappable card
 * <Card onTap={() => navigate(id)}>Clickable content</Card>
 *
 * // Custom padding
 * <Card padding="none" className="overflow-hidden">
 *   <img src={cover} className="w-full" />
 *   <div className="p-4">Text</div>
 * </Card>
 */
export function Card({ children, onTap, className = '', padding = 'md' }: CardProps) {
  const baseClasses = `bg-white rounded-xl border border-gray-200 ${PADDING[padding]}`;
  const interactiveClasses = onTap
    ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors'
    : '';

  function handleKeyDown(e: KeyboardEvent) {
    if (onTap && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onTap();
    }
  }

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${className}`.trim()}
      onClick={onTap}
      role={onTap ? 'button' : undefined}
      tabIndex={onTap ? 0 : undefined}
      onKeyDown={onTap ? handleKeyDown : undefined}
    >
      {children}
    </div>
  );
}
