"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Trash2, TrendingUp, TrendingDown } from "lucide-react";

// Note: Shared types file (src/lib/types.ts) may not exist in current repo snapshot.
// Define a local KPI type to avoid import resolution errors. If you add src/lib/types.ts,
// replace this with: `import { KPI } from '@/lib/types';`
interface KPI {
  id: string;
  title: string;
  value: number;
  trend?: number;
  meta?: string;
}

interface Props {
  kpi: KPI;
  onEdit: (k: KPI) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  isLoading?: boolean;
}

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

function TrendBadge({ value }: { value?: number }) {
  if (typeof value !== "number") return null;
  const positive = value >= 0;
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
        positive
          ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300"
          : "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-200"
      )}
    >
      {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function KpiSkeletonCard() {
  return (
    <div className="h-36 animate-pulse overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06]">
      <div className="h-4 w-24 rounded bg-slate-200/60 dark:bg-slate-700/60" />
      <div className="mt-3 h-8 w-40 rounded bg-slate-200/60 dark:bg-slate-700/60" />
      <div className="mt-5 h-3 w-28 rounded bg-slate-200/60 dark:bg-slate-700/60" />
    </div>
  );
}

export default function KpiCard({ kpi, onEdit, onDelete, isLoading = false }: Props) {
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

  const isCurrency = useMemo(() => {
    const t = kpi.title.toLowerCase();
    return t.includes("revenue") || t.includes("avg") || t.includes("value");
  }, [kpi.title]);

  const displayValue = useMemo(() => {
    if (isCurrency) return formatCurrencyCents(Number(kpi.value));
    return new Intl.NumberFormat().format(kpi.value);
  }, [isCurrency, kpi.value]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsedValue = Number(value);
    const parsedTrend = trend === "" ? undefined : Number(trend);
    if (!title.trim()) return alert("Title is required");
    if (Number.isNaN(parsedValue)) return alert("Value must be a number");
    if (parsedTrend !== undefined && Number.isNaN(parsedTrend)) return alert("Trend must be a number");
    try {
      setSubmitting(true);
      await onEdit({ id: kpi.id, title: title.trim(), value: parsedValue, trend: parsedTrend, meta: meta.trim() || undefined });
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

  if (isLoading) return <KpiSkeletonCard />;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-4 shadow-lg backdrop-blur-xl transition-all duration-200 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.06]">
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-400/30 blur-2xl dark:from-cyan-600/20 dark:to-fuchsia-600/20" />
      </div>

      {!editing ? (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{kpi.title}</p>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{displayValue}</div>
            </div>
            <div className="flex items-center gap-2">
              <TrendBadge value={kpi.trend} />
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
                className="rounded-lg border border-rose-600/20 bg-rose-600/10 p-1.5 text-rose-700 shadow-sm transition-all hover:scale-105 hover:bg-rose-600/20 focus:outline-none focus:ring-2 focus:ring-rose-500/40 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {kpi.meta && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{kpi.meta}</p>}
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