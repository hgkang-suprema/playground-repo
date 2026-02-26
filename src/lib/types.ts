/**
 * Shared TypeScript interfaces used across components and API route handlers.
 *
 * Note:
 * - This file intentionally uses named exports only (no default export).
 * - Import with: `import { Sale, KPI } from '@/lib/types';`
 */

/**
 * Represents a single sale record.
 * - id: UUID string identifying the sale.
 * - date: ISO date string in the format YYYY-MM-DD.
 * - amount: Monetary amount in cents. Format with Intl.NumberFormat in UI.
 */
export interface Sale {
  id: string;
  date: string; // ISO (YYYY-MM-DD)
  amount: number; // cents
}

/**
 * Represents a KPI (Key Performance Indicator) card data.
 * - id: UUID string.
 * - title: Name of the metric (e.g., "Total Revenue").
 * - value: Numeric value. If representing currency, store as cents.
 * - trend: Optional percentage change (+/-). Negative values indicate decline.
 * - meta: Optional helper text (e.g., "vs last month").
 */
export interface KPI {
  id: string;
  title: string;
  value: number;
  trend?: number;
  meta?: string;
}
