// ── UI Component Library ──────────────────────────────────────────────
//
// Reusable, consistently styled primitives for the RMS app.
// Import from '@/components/ui' or '../../components/ui'.
//
// Usage:
//   import { Card, Button, EntrustmentBadge } from '../ui';

// Layout
export { Card } from './Card';
export { StatCard } from './StatCard';

// Controls
export { Button } from './Button';
export { Select } from './Select';

// Feedback
export { EmptyState } from './EmptyState';
export { Skeleton, SkeletonCard } from './Skeleton';
export { Toast } from './Toast';
export { ProgressBar } from './ProgressBar';

// Typography
export { SectionLabel } from './SectionLabel';

// Form
export { FormField } from './FormField';

// Domain-specific
export { EntrustmentBadge } from './EntrustmentBadge';
export { BottomSheet } from './BottomSheet';
export { VoiceInput } from './VoiceInput';

// Utilities
export {
  levelBadgeClasses,
  levelColor,
  levelDotColor,
  levelTextColor,
  levelBgColor,
} from './entrustment';
