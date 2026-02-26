"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, DollarSign, Plus } from "lucide-react";

// Local type to avoid missing import issues if shared types file is not present.
interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // cents
}

interface Props {
  sales: Sale[];
  onAddSale?: (s: { date: string; amount: number }) => Promise<void> | void;
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

function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function parseISO(dateStr: string): Date {
  // dateStr expected format: YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map((v) => Number(v));
  return new Date(y, m - 1, d || 1);
}

function getMonthLabel(key: string, locale = "en-US"): string {
  // key: YYYY-MM
  const [y, m] = key.split("-").map((v) => Number(v));
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(locale, { month: "short", year: "2-digit" });
}

function EmptyState({ onQuickAdd }: { onQuickAdd?: () => void }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300/60 bg-white/60 p-10 text-center shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-white/[0.04]">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-fuchsia-400/30 to-cyan-400/30 blur-3xl dark:from-fuchsia-700/20 dark:to-cyan-700/20" />
      </div>
      <DollarSign className="h-10 w-10 text-slate-500 dark:text-slate-400" />
      <div>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No sales yet</h4>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Add your first sale to start visualizing monthly trends.</p>
      </div>
      {onQuickAdd && (
        <button
          type="button"
          onClick={onQuickAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.03] active:scale-95 dark:from-cyan-600 dark:to-fuchsia-600"
        >
          <Plus className="h-4 w-4" /> Add a quick sale
        </button>
      )}
    </div>
  );
}

export default function MonthlySalesChart({ sales, onAddSale }: Props) {
  // Inline add form
  const [date, setDate] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Tooltip/hover state
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Aggregate to recent 6-12 months depending on dataset span
  const { months, totals, max, endKey } = useMemo(() => {
    const keys = sales.map((s) => s.date.slice(0, 7)); // YYYY-MM
    const unique = Array.from(new Set(keys)).sort();

    const now = new Date();
    const maxDate = unique.length
      ? unique.reduce((acc, k) => {
          const d = parseISO(`${k}-01`);
          return d > acc ? d : acc;
        }, new Date(1970, 0, 1))
      : now;

    const distinctCount = Math.max(1, unique.length);
    const monthsToShow = Math.min(12, Math.max(6, distinctCount));

    // Build month range ending at maxDate
    const labels: string[] = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(maxDate.getFullYear(), maxDate.getMonth() - i, 1);
      labels.push(monthKey(d));
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

    return { months: labels, totals: totalsArr, max: maxVal, endKey: labels[labels.length - 1] };
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

  // Chart dimensions (SVG viewBox coordinates)
  const height = 240;
  const viewWidth = 800; // fixed logical width (responsive via viewBox scaling)
  const barGap = 16;
  const barCount = months.length || 1;
  const containerPadding = 24;
  const barWidth = (viewWidth - (barCount + 1) * barGap) / barCount;

  const hasData = sales.length > 0 && totals.some((t) => t > 0);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute -left-14 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-400/30 blur-2xl dark:from-cyan-600/20 dark:to-fuchsia-600/20" />
      </div>

      {/* Header + Inline Add Form */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Monthly Sales</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {hasData ? `Through ${getMonthLabel(endKey)}` : "Add data to see the trend"}
          </p>
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
            aria-label="Add sale"
          >
            <Plus className="h-4 w-4" /> {submitting ? "Adding..." : "Add Sale"}
          </button>
        </form>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="mt-6">
          <EmptyState onQuickAdd={onAddSale ? () => onAddSale({ date: new Date().toISOString().slice(0, 10), amount: 10000 }) : undefined} />
        </div>
      )}

      {/* Chart */}
      {hasData && (
        <div
          className="relative mt-5 w-full select-none"
          onMouseMove={(e) => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <svg className="h-[260px] w-full" viewBox={`0 0 ${viewWidth} ${height + containerPadding * 2 + 22}`} preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
              <line
                key={i}
                x1={0}
                y1={containerPadding + (1 - t) * height}
                x2={viewWidth}
                y2={containerPadding + (1 - t) * height}
                stroke="currentColor"
                className="stroke-slate-300/40 dark:stroke-slate-700/50"
                strokeWidth={1}
              />
            ))}

            {/* Bars */}
            {months.map((m, i) => {
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
                    {getMonthLabel(m)}
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
              <div className="font-medium">{getMonthLabel(months[hoverIdx])}</div>
              <div className="mt-0.5 text-slate-600 dark:text-slate-400">{formatCurrencyCents(totals[hoverIdx])}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
