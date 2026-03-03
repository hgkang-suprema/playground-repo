// Shared TypeScript types for revenue dashboard
// Use named exports only. No runtime logic in this file.

export interface RevenueMonth {
  id: string; // e.g. "2026-01"
  year: number;
  month: number; // 1-12
  revenue: number; // integer amount
  createdAt: string; // ISO timestamp
}

export interface KPI {
  mrr: number; // most recent month's revenue
  momGrowth: number; // percent (e.g. 12.34)
  ytdRevenue: number; // year-to-date sum
  bestMonth: RevenueMonth | null;
}
