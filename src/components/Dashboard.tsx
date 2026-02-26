"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCcw,
  Plus,
  Calendar,
  DollarSign,
} from "lucide-react";

// Local type declarations (shared types are ideally in src/lib/types.ts)
interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // cents
}

interface KPI {
  id: string;
  title: string;
  value: number; // numeric value (cents for currency KPIs)
  trend?: number; // percent (+/-)
  meta?: string; // helper text
}

interface Props {}

function formatCurrencyCents(cents: number, locale = "en-US", currency = "USD"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

// Error Banner
interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}
function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const [show, setShow] = useState<boolean>(true);
  if (!show) return null;
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-600 shadow-sm dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5" />
        <div>
          <p className="text-sm font-medium">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 inline-flex items-center gap-1 rounded-md bg-rose-600/10 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 transition-all hover:bg-rose-600/20 dark:text-rose-200"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Retry
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss error"
        onClick={() => setShow(false)}
        className="rounded-md px-2 py-1 text-xs text-rose-700 transition hover:bg-rose-600/10 dark:text-rose-200"
      >
        Dismiss
      </button>
    </div>
  );
}

// KPI Skeleton Card
function KpiSkeleton() {
  return (
    <div className="h-36 animate-pulse rounded-2xl border border-white/20 bg-white/30 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06]">
      <div className="h-4 w-24 rounded bg-slate-200/60 dark:bg-slate-700/60" />
      <div className="mt-3 h-8 w-40 rounded bg-slate-200/60 dark:bg-slate-700/60" />
      <div className="mt-5 h-3 w-28 rounded bg-slate-200/60 dark:bg-slate-700/60" />
    </div>
  );
}

// KPI Card
interface KpiCardProps {
  kpi: KPI;
  onEdit: (k: KPI) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}
function KpiCard({ kpi, onEdit, onDelete }: KpiCardProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(kpi.title);
  const [value, setValue] = useState<string>(String(kpi.value));
  const [trend, setTrend] = useState<string>(kpi.trend?.toString() ?? "");
  const [meta, setMeta] = useState<string>(kpi.meta ?? "");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setTitle(kpi.title);
    setValue(String(kpi.value));
    setTrend(kpi.trend?.toString() ?? "");
    setMeta(kpi.meta ?? "");
  }, [kpi]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsedValue = Number(value);
    const parsedTrend = trend === "" ? undefined : Number(trend);
    if (Number.isNaN(parsedValue)) return alert("Value must be a number");
    if (parsedTrend !== undefined && Number.isNaN(parsedTrend)) return alert("Trend must be a number");
    try {
      setSubmitting(true);
      await onEdit({ id: kpi.id, title, value: parsedValue, trend: parsedTrend, meta });
      setEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const ok = confirm(`Delete KPI "${kpi.title}"?`);
    if (!ok) return;
    await onDelete(kpi.id);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-4 shadow-lg backdrop-blur-xl transition-all duration-200 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.06]">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-400/30 blur-2xl dark:from-cyan-600/20 dark:to-fuchsia-600/20" />
      </div>

      {!editing ? (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{kpi.title}</p>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {kpi.title.toLowerCase().includes("revenue") || kpi.title.toLowerCase().includes("avg")
                  ? formatCurrencyCents(kpi.value)
                  : new Intl.NumberFormat().format(kpi.value)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeof kpi.trend === "number" && (
                <span
                  className={classNames(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                    kpi.trend >= 0
                      ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300"
                      : "bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:text-rose-200"
                  )}
                >
                  {kpi.trend >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(kpi.trend).toFixed(1)}%
                </span>
              )}
              <button
                type="button"
                aria-label="Edit KPI"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-slate-900/10 bg-white/80 p-1.5 text-slate-600 shadow-sm transition-all hover:scale-105 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-white"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Delete KPI"
                onClick={handleDelete}
                className="rounded-lg border border-rose-600/20 bg-rose-600/10 p-1.5 text-rose-600 shadow-sm transition-all hover:scale-105 hover:bg-rose-600/20 focus:outline-none focus:ring-2 focus:ring-rose-500/40 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {kpi.meta && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{kpi.meta}</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Title</label>
              <input
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Value</label>
              <input
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Trend (%)</label>
              <input
                value={trend}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrend(e.target.value)}
                type="number"
                step="0.1"
                className="mt-1 w-full rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Meta</label>
              <input
                value={meta}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMeta(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 dark:from-cyan-600 dark:to-fuchsia-600"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-900/10 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Monthly Sales Chart (SVG Bars + inline add form)
interface MonthlySalesChartProps {
  sales: Sale[];
  onAddSale?: (s: { date: string; amount: number }) => Promise<void> | void;
}
function MonthlySalesChart({ sales, onAddSale }: MonthlySalesChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [date, setDate] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Compute the last 6 months including current based on available data or today
  const { months, totals, max } = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      labels.push(`${y}-${m}`);
    }
    const map = new Map<string, number>();
    labels.forEach((k) => map.set(k, 0));

    for (const s of sales) {
      const key = s.date.slice(0, 7);
      if (map.has(key)) {
        map.set(key, (map.get(key) || 0) + s.amount);
      }
    }
    const totalsArr = labels.map((k) => map.get(k) || 0);
    const maxVal = Math.max(1, ...totalsArr);
    return { months: labels, totals: totalsArr, max: maxVal };
  }, [sales]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onAddSale) return;
    const parsed = Number(amount);
    if (!date) return alert("Please choose a date");
    if (Number.isNaN(parsed)) return alert("Amount must be a number (in cents)");
    try {
      setSubmitting(true);
      await onAddSale({ date, amount: parsed });
      setDate("");
      setAmount("");
    } finally {
      setSubmitting(false);
    }
  };

  // Chart dimensions
  const height = 240;
  const barGap = 16;
  const barCount = months.length;
  const containerPadding = 24;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute -left-14 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-400/30 blur-2xl dark:from-cyan-600/20 dark:to-fuchsia-600/20" />
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Monthly Sales</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Last 6 months performance</p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="date"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-900/10 bg-white/80 pl-9 pr-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
            />
          </div>
          <div className="relative">
            <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="number"
              placeholder="Amount (cents)"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-900/10 bg-white/80 pl-9 pr-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 dark:from-cyan-600 dark:to-fuchsia-600"
          >
            <Plus className="h-4 w-4" /> {submitting ? "Adding..." : "Add Sale"}
          </button>
        </form>
      </div>

      <div
        className="relative mt-5 w-full select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <svg className="h-[260px] w-full" viewBox={`0 0 800 ${height + containerPadding * 2}`} preserveAspectRatio="none">
          {/* Axes grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <line
              key={i}
              x1={0}
              y1={containerPadding + (1 - t) * height}
              x2={800}
              y2={containerPadding + (1 - t) * height}
              stroke="currentColor"
              className="stroke-slate-300/40 dark:stroke-slate-700/50"
              strokeWidth={1}
            />
          ))}
          {/* Bars */}
          {months.map((m, i) => {
            const W = 800;
            const barWidth = (W - (barCount + 1) * barGap) / barCount;
            const x = barGap + i * (barWidth + barGap);
            const val = totals[i];
            const h = Math.max(2, (val / max) * height);
            const y = containerPadding + (height - h);
            const isHover = hoverIdx === i;
            return (
              <g key={m}>
                <motion.rect
                  initial={{ height: 0, y: containerPadding + height }}
                  animate={{ height: h, y }}
                  transition={{ type: "spring", stiffness: 90, damping: 18, delay: i * 0.03 }}
                  onMouseEnter={() => setHoverIdx(i)}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx={8}
                  role="img"
                  aria-label={`${m}: ${formatCurrencyCents(val)}`}
                  className={classNames(
                    "cursor-pointer fill-cyan-500/70 transition-opacity dark:fill-cyan-400/70",
                    isHover && "opacity-90"
                  )}
                />
                {/* Month label */}
                <text
                  x={x + barWidth / 2}
                  y={containerPadding + height + 18}
                  textAnchor="middle"
                  className="fill-slate-600 text-[11px] dark:fill-slate-400"
                >
                  {m.slice(2)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoverIdx !== null && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-2 rounded-lg border border-white/20 bg-white/90 px-3 py-1.5 text-xs text-slate-900 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <div className="font-medium">{months[hoverIdx]}</div>
            <div className="mt-0.5 text-slate-600 dark:text-slate-400">{formatCurrencyCents(totals[hoverIdx])}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptySalesState({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300/50 bg-white/60 p-10 text-center shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-white/[0.04]">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-fuchsia-400/30 to-cyan-400/30 blur-3xl dark:from-fuchsia-700/20 dark:to-cyan-700/20" />
      </div>
      <DollarSign className="h-10 w-10 text-slate-500 dark:text-slate-400" />
      <div>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No sales yet</h4>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Start by adding your first sale to see monthly trends.</p>
      </div>
      <button
        type="button"
        onClick={onQuickAdd}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.03] active:scale-95 dark:from-cyan-600 dark:to-fuchsia-600"
      >
        <Plus className="h-4 w-4" /> Add a quick sale
      </button>
    </div>
  );
}

export default function Dashboard({}: Props) {
  // State
  const [sales, setSales] = useState<Sale[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loadingSales, setLoadingSales] = useState<boolean>(true);
  const [loadingKpis, setLoadingKpis] = useState<boolean>(true);
  const [errorSales, setErrorSales] = useState<string | null>(null);
  const [errorKpis, setErrorKpis] = useState<string | null>(null);
  const [isCreatingKpi, setIsCreatingKpi] = useState<boolean>(false);

  // Derived
  const totalRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.amount, 0), [sales]);

  // Fetchers
  const fetchSales = useCallback(async () => {
    setLoadingSales(true);
    setErrorSales(null);
    try {
      const res = await fetch("/api/sales");
      if (!res.ok) throw new Error(`Failed to load sales (${res.status})`);
      const data: { sales: Sale[] } = await res.json();
      setSales(data.sales);
    } catch (err: unknown) {
      setErrorSales(err instanceof Error ? err.message : "Failed to load sales");
    } finally {
      setLoadingSales(false);
    }
  }, []);

  const fetchKpis = useCallback(async () => {
    setLoadingKpis(true);
    setErrorKpis(null);
    try {
      const res = await fetch("/api/kpis");
      if (!res.ok) throw new Error(`Failed to load KPIs (${res.status})`);
      const data: { kpis: KPI[] } = await res.json();
      setKpis(data.kpis);
    } catch (err: unknown) {
      setErrorKpis(err instanceof Error ? err.message : "Failed to load KPIs");
    } finally {
      setLoadingKpis(false);
    }
  }, []);

  // Mutations - Sales
  const createSale = useCallback(async (payload: { date: string; amount: number }) => {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create sale");
    await fetchSales();
  }, [fetchSales]);

  const updateSale = useCallback(async (payload: { id: string; date?: string; amount?: number }) => {
    const res = await fetch("/api/sales", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update sale");
    await fetchSales();
  }, [fetchSales]);

  const deleteSale = useCallback(async (id: string) => {
    const res = await fetch("/api/sales", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("Failed to delete sale");
    await fetchSales();
  }, [fetchSales]);

  // Mutations - KPI
  const createKpi = useCallback(async (payload: { title: string; value: number; trend?: number; meta?: string }) => {
    const res = await fetch("/api/kpis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create KPI");
    await fetchKpis();
  }, [fetchKpis]);

  const updateKpi = useCallback(async (k: KPI) => {
    const res = await fetch("/api/kpis", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(k),
    });
    if (!res.ok) throw new Error("Failed to update KPI");
    await fetchKpis();
  }, [fetchKpis]);

  const deleteKpi = useCallback(async (id: string) => {
    const res = await fetch("/api/kpis", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("Failed to delete KPI");
    await fetchKpis();
  }, [fetchKpis]);

  useEffect(() => {
    fetchSales();
    fetchKpis();
  }, [fetchSales, fetchKpis]);

  // KPI create inline form state
  const [newKpi, setNewKpi] = useState<{ title: string; value: string; trend: string; meta: string }>(
    { title: "", value: "", trend: "", meta: "" }
  );

  const handleCreateKpi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = Number(newKpi.value);
    const trend = newKpi.trend === "" ? undefined : Number(newKpi.trend);
    if (!newKpi.title.trim()) return alert("Title is required");
    if (Number.isNaN(value)) return alert("Value must be a number");
    if (trend !== undefined && Number.isNaN(trend)) return alert("Trend must be a number");
    await createKpi({ title: newKpi.title.trim(), value, trend, meta: newKpi.meta.trim() || undefined });
    setNewKpi({ title: "", value: "", trend: "", meta: "" });
    setIsCreatingKpi(false);
  };

  return (
    <div className="space-y-6">
      {/* Error banners */}
      {errorKpis && <ErrorBanner message={errorKpis} onRetry={fetchKpis} />}
      {errorSales && <ErrorBanner message={errorSales} onRetry={fetchSales} />}

      {/* Top Insight Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
            <div className="absolute -left-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-400/30 blur-2xl dark:from-cyan-600/20 dark:to-fuchsia-600/20" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue (last 6m)</p>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{formatCurrencyCents(totalRevenue)}</div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <p className="text-sm text-slate-600 dark:text-slate-400">Sales Records</p>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{sales.length}</div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <p className="text-sm text-slate-600 dark:text-slate-400">KPI Cards</p>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{kpis.length}</div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {(loadingSales || loadingKpis) ? "Loading..." : "Live"}
          </div>
        </div>
      </div>

      {/* KPI Grid + Create */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Key Performance Indicators</h2>
          <button
            type="button"
            onClick={() => setIsCreatingKpi((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.03] active:scale-95 dark:from-cyan-600 dark:to-fuchsia-600"
          >
            <Plus className="h-4 w-4" /> New KPI
          </button>
        </div>

        {isCreatingKpi && (
          <form onSubmit={handleCreateKpi} className="grid grid-cols-1 gap-3 rounded-2xl border border-white/20 bg-white/60 p-4 shadow-sm backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-white/[0.06]">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Title</label>
              <input
                value={newKpi.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKpi((p) => ({ ...p, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Value</label>
              <input
                type="number"
                value={newKpi.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKpi((p) => ({ ...p, value: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Trend (%)</label>
              <input
                type="number"
                step="0.1"
                value={newKpi.trend}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKpi((p) => ({ ...p, trend: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Meta</label>
              <input
                value={newKpi.meta}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKpi((p) => ({ ...p, meta: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 mt-1 flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.02] active:scale-95 dark:from-cyan-600 dark:to-fuchsia-600"
              >
                Create KPI
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingKpi(false)}
                className="rounded-lg border border-slate-900/10 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingKpis
            ? Array.from({ length: 3 }).map((_, i) => <KpiSkeleton key={i} />)
            : kpis.length === 0
            ? (
              <div className="col-span-full">
                <div className="rounded-2xl border border-dashed border-slate-300/60 bg-white/60 p-8 text-center shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-white/[0.04]">
                  <p className="text-sm text-slate-600 dark:text-slate-400">No KPI yet. Click "New KPI" to create your first metric.</p>
                </div>
              </div>
            )
            : kpis.map((k) => (
                <KpiCard key={k.id} kpi={k} onEdit={updateKpi} onDelete={deleteKpi} />
              ))}
        </div>
      </div>

      {/* Sales Chart & List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loadingSales ? (
            <div className="h-[360px] animate-pulse rounded-2xl border border-white/20 bg-white/50 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]" />
          ) : sales.length === 0 ? (
            <EmptySalesState
              onQuickAdd={() =>
                createSale({ date: new Date().toISOString().slice(0, 10), amount: 10000 })
              }
            />
          ) : (
            <MonthlySalesChart sales={sales} onAddSale={createSale} />
          )}
        </div>

        {/* Simple recent sales list with edit/delete */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent Sales</h3>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/50 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
            <ul className="divide-y divide-slate-900/5 dark:divide-white/10">
              {loadingSales ? (
                <li className="p-4">
                  <div className="h-6 animate-pulse rounded bg-slate-200/60 dark:bg-slate-700/60" />
                </li>
              ) : sales.length === 0 ? (
                <li className="p-6 text-sm text-slate-600 dark:text-slate-400">No sales available</li>
              ) : (
                sales
                  .slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .slice(0, 8)
                  .map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatCurrencyCents(s.amount)}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{s.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Edit sale"
                          onClick={async () => {
                            const date = prompt("Edit date (YYYY-MM-DD)", s.date) ?? s.date;
                            const amountStr = prompt("Edit amount (cents)", String(s.amount)) ?? String(s.amount);
                            const amount = Number(amountStr);
                            if (!date) return;
                            if (Number.isNaN(amount)) return alert("Amount must be a number");
                            await updateSale({ id: s.id, date, amount });
                          }}
                          className="rounded-lg border border-slate-900/10 bg-white/70 px-2 py-1 text-xs text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          aria-label="Delete sale"
                          onClick={async () => {
                            const ok = confirm("Delete this sale?");
                            if (!ok) return;
                            await deleteSale(s.id);
                          }}
                          className="rounded-lg border border-rose-600/20 bg-rose-600/10 px-2 py-1 text-xs text-rose-700 transition hover:bg-rose-600/20 focus:outline-none focus:ring-2 focus:ring-rose-500/40 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}