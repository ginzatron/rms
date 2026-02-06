/**
 * Shared color utilities for entrustment levels.
 *
 * Entrustment levels 1-5 are color-coded consistently across the app:
 * - Levels 1-2 (Observe, Direct): Red — needs significant supervision
 * - Level 3 (Indirect): Yellow — transitional
 * - Levels 4-5 (Available, Independent): Green — approaching autonomy
 */
import type { EntrustmentLevel } from '../../types/api';

// ── Badge colors (bg + text + border for badges) ──────────────────────

/** Badge classes: bg + text + border for entrustment-level badges */
export function levelBadgeClasses(level: EntrustmentLevel): string {
  const n = Number(level);
  if (n <= 2) return 'bg-red-50 text-red-700 border-red-200';
  if (n === 3) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-green-50 text-green-700 border-green-200';
}

// ── Solid colors (progress bars, dots, chart bars) ────────────────────

/** Solid background color for progress bars and chart bars */
export function levelColor(level: EntrustmentLevel | null): string {
  if (!level) return 'bg-gray-300';
  const n = Number(level);
  if (n <= 2) return 'bg-red-500';
  if (n === 3) return 'bg-yellow-500';
  return 'bg-green-500';
}

/** Lighter solid for bar chart and distribution dots */
export function levelDotColor(level: number): string {
  if (level <= 2) return 'bg-red-400';
  if (level === 3) return 'bg-yellow-400';
  return 'bg-green-500';
}

// ── Text and background (for level display badges) ────────────────────

/** Text color for level numbers and labels */
export function levelTextColor(level: EntrustmentLevel | null): string {
  if (!level) return 'text-gray-500';
  const n = Number(level);
  if (n <= 2) return 'text-red-600';
  if (n === 3) return 'text-yellow-600';
  return 'text-green-600';
}

/** Light background for level display cards */
export function levelBgColor(level: EntrustmentLevel | null): string {
  if (!level) return 'bg-gray-100';
  const n = Number(level);
  if (n <= 2) return 'bg-red-50';
  if (n === 3) return 'bg-yellow-50';
  return 'bg-green-50';
}
