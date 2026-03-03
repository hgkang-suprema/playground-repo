"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RevenueMonth, KPI } from "@/lib/types";
import { Plus, Save, X, Trash2, Edit, RefreshCw, TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";

interface Props {}

interface KPICardProps {
  title: string;
  value: string;
  hint?: string;
  delta?: { label: string; positive: boolean } | null;
  icon?: React.ReactNode;
}

interface ChartProps {
  data: RevenueMonth[];
}

interface MonthRowProps {
  item: RevenueMonth;
  isEditing: boolean;
  onStartEdit: (id: string, current: number) => void;
  onCancel: () => void;
  onSave: (id: string, revenue: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatCurrencyKRW(n: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(n);
}

function byMonthAsc(a: RevenueMonth, b: RevenueMonth) {
  return a.month - b.month;
}

export default function Dashboard({}: Props) {
  const [data, setData] = useState<RevenueMonth[] | null>(null);
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [form, setForm] = useState<{ year: number; month: number; revenue: number }>(
    { year: new Date().getFullYear(), month: new Date().getMonth() + 1, revenue: 0 }
  );

  async function fetchGET(targetYear?: number) {
    try {
      setLoading(true);
      setError(null);
      const url = targetYear != null ? `/api/revenue?year=${encodeURIComponent(targetYear)}` : "/api/revenue";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`GET failed: ${res.status}`);
      const json: { data: RevenueMonth[]; kpi: KPI } = await res.json();
      setData(json.data);
      setKpi(json.kpi);
      if (json.data && json.data.length > 0) {
        setYear(json.data[0].year);
        setForm((f) => ({ ...f, year: json.data[0].year }));
      } else if (targetYear != null) {
        setYear(targetYear);
        setForm((f) => ({ ...f, year: targetYear }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Initial load: let API choose latest year by default
    fetchGET();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createRevenue(payload: { year: number; month: number; revenue: number }) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || `POST failed: ${res.status}`);
      }
      await fetchGET(payload.year);
      setShowAdd(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function updateRevenue(id: string, revenue: number) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/revenue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, revenue }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || `PATCH failed: ${res.status}`);
      }
      await fetchGET(year);
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRevenue(id: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/revenue", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || `DELETE failed: ${res.status}`);
      }
      await fetchGET(year);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const sortedData = useMemo(() => (data ? [...data].sort(byMonthAsc) : []), [data]);
  const availableYears = useMemo(() => {
    const now = new Date().getFullYear();
    const set = new Set<number>([now - 1, now, now + 1]);
    if (sortedData.length) set.add(sortedData[0].year);
    return Array.from(set).sort((a, b) => a - b);
  }, [sortedData]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const y = Number.parseInt(e.target.value, 10);
    if (Number.isFinite(y)) {
      fetchGET(y);
    }
  };

  return (
    <section className="w-full space-y-6">
      {/* Top control bar */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <CardTitle className="text-zinc-900 dark:text-zinc-100">Revenue Overview</CardTitle>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">월별 매출과 핵심 지표를 한눈에 확인하세요.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <select
                aria-label="Select year"
                value={year}
                onChange={handleYearChange}
                className={cn(
                  "rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100",
                  "focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-all"
                )}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Button
              aria-label={showAdd ? "Close add month form" : "Open add month form"}
              onClick={() => setShowAdd((v) => !v)}
              className="transition-all hover:scale-[0.98]"
            >
              {showAdd ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}월 추가
            </Button>
            <Button
              variant="secondary"
              aria-label="Refresh data"
              onClick={() => fetchGET(year)}
              className="transition-all hover:scale-[0.98]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />새로고침
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence initial={false}>
          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pb-6">
                <div className="col-span-1 sm:col-span-1">
                  <Input
                    type="number"
                    label="Year"
                    aria-label="Year"
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                    className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <div className="col-span-1 sm:col-span-1">
                  <Input
                    type="number"
                    label="Month (1-12)"
                    aria-label="Month"
                    value={form.month}
                    onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))}
                    className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <div className="col-span-1 sm:col-span-1">
                  <Input
                    type="number"
                    label="Revenue"
                    aria-label="Revenue"
                    value={form.revenue}
                    onChange={(e) => setForm((f) => ({ ...f, revenue: Number(e.target.value) }))}
                    className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <div className="col-span-1 sm:col-span-1 flex items-end gap-2">
                  <Button
                    onClick={() => createRevenue(form)}
                    className="w-full transition-all hover:scale-[0.98]"
                    aria-label="Add month revenue"
                    disabled={loading}
                  >
                    <Plus className="mr-2 h-4 w-4" /> 추가
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAdd(false)}
                    className="w-full transition-all hover:scale-[0.98]"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* KPI Row */}
      {error ? (
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">오류가 발생했어요</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">{error}</p>
            <Button onClick={() => fetchGET(year)} className="transition-all hover:scale-[0.98]">재시도</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-lg p-5 animate-pulse">
                <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded mb-4" />
                <div className="h-6 w-32 bg-zinc-100 dark:bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
              </div>
            ))
          ) : (
            <>
              <KPICard
                title="MRR"
                value={formatCurrencyKRW(kpi?.mrr || 0)}
                hint="가장 최근 월 매출"
                icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              />
              <KPICard
                title="MoM Growth"
                value={`${(kpi?.momGrowth || 0).toFixed(1)}%`}
                hint="전월 대비 증감률"
                delta={{ label: (kpi?.momGrowth || 0) >= 0 ? "상승" : "하락", positive: (kpi?.momGrowth || 0) >= 0 }}
                icon={(kpi?.momGrowth || 0) >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              />
              <KPICard
                title="YTD Revenue"
                value={formatCurrencyKRW(kpi?.ytdRevenue || 0)}
                hint="연초부터 현재까지 합계"
                icon={<BarChart3 className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />}
              />
              <KPICard
                title="Best Month"
                value={kpi?.bestMonth ? `${kpi.bestMonth.year}.${String(kpi.bestMonth.month).padStart(2, "0")}` : "-"}
                hint={kpi?.bestMonth ? formatCurrencyKRW(kpi.bestMonth.revenue) : "데이터 없음"}
                icon={<Calendar className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />}
              />
            </>
          )}
        </div>
      )}

      {/* Chart */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-zinc-900 dark:text-zinc-100">월별 매출 차트</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !sortedData.length ? (
            <div className="h-64 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ) : sortedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <BarChart3 className="h-7 w-7 text-zinc-600 dark:text-zinc-400" />
              </div>
              <p className="text-zinc-700 dark:text-zinc-300">선택한 연도에 데이터가 없어요.</p>
              <Button onClick={() => setShowAdd(true)} className="transition-all hover:scale-[0.98]"><Plus className="mr-2 h-4 w-4" />월 추가</Button>
            </div>
          ) : (
            <Chart data={sortedData} />
          )}
        </CardContent>
      </Card>

      {/* Month list */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-zinc-900 dark:text-zinc-100">월별 상세</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {loading && !sortedData.length ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
              ))}
            </div>
          ) : sortedData.length === 0 ? (
            <p className="text-zinc-700 dark:text-zinc-300">표시할 데이터가 없습니다.</p>
          ) : (
            <ul className="-mx-2">
              {sortedData.map((item) => (
                <li key={item.id} className="px-2 py-3">
                  <MonthRow
                    item={item}
                    isEditing={editingId === item.id}
                    onStartEdit={(id) => setEditingId(id)}
                    onCancel={() => setEditingId(null)}
                    onSave={async (id, revenue) => updateRevenue(id, revenue)}
                    onDelete={async (id) => {
                      const ok = window.confirm("정말 삭제하시겠어요?");
                      if (ok) await deleteRevenue(id);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="text-sm text-zinc-600 dark:text-zinc-400">
          총 {sortedData.length}건의 월 데이터
        </CardFooter>
      </Card>
    </section>
  );
}

function KPICard({ title, value, hint, delta, icon }: KPICardProps) {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-lg transition-all hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
        {hint && <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{hint}</div>}
      </CardContent>
      {delta && (
        <CardFooter>
          <Badge
            variant={delta.positive ? "secondary" : "destructive"}
            className={cn(
              delta.positive ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" : "",
              !delta.positive ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800" : "",
            )}
          >
            {delta.positive ? "▲" : "▼"} {delta.label}
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
}

function Chart({ data }: ChartProps) {
  const sorted = [...data].sort(byMonthAsc);
  const width = 720;
  const height = 260;
  const padding = { top: 20, right: 24, bottom: 30, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const months = sorted.map((d) => d.month);
  const values = sorted.map((d) => d.revenue);
  const minV = Math.min(0, ...values);
  const maxV = Math.max(...values, 10);
  const yScale = (v: number) => {
    if (maxV === minV) return padding.top + innerH / 2;
    const t = (v - minV) / (maxV - minV);
    return padding.top + innerH * (1 - t);
  };
  const xScale = (m: number) => {
    // Map month 1..12 evenly across inner width
    const idx = m - 1;
    const step = innerW / 11; // 12 months => 11 intervals
    return padding.left + step * idx;
  };

  const pathD = useMemo(() => {
    if (!sorted.length) return "";
    return sorted
      .map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.month)},${yScale(d.revenue)}`)
      .join(" ");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sorted)]);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div className="w-full overflow-hidden">
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72">
          {/* axes */}
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />

          {/* horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padding.top + innerH * t;
            return <line key={t} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" />;
          })}

          {/* month labels */}
          {Array.from({ length: 12 }).map((_, i) => {
            const m = i + 1;
            const x = xScale(m);
            const y = height - padding.bottom + 18;
            return (
              <text key={m} x={x} y={y} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">
                {monthNames[i]}
              </text>
            );
          })}

          {/* y-axis labels */}
          {(() => {
            const ticks = 4;
            return Array.from({ length: ticks + 1 }).map((_, i) => {
              const v = minV + ((maxV - minV) * i) / ticks;
              const y = yScale(v);
              return (
                <text key={i} x={padding.left - 6} y={y} textAnchor="end" dominantBaseline="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">
                  {formatCurrencyKRW(Math.round(v))}
                </text>
              );
            });
          })()}

          {/* line path */}
          <motion.path
            d={pathD}
            fill="none"
            strokeWidth={2.5}
            stroke="url(#grad)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />

          {/* gradient definition */}
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* data points */}
          {sorted.map((d, i) => {
            const cx = xScale(d.month);
            const cy = yScale(d.revenue);
            const active = hoverIdx === i;
            return (
              <g key={d.id}>
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={active ? 5.5 : 4}
                  className={cn("fill-white dark:fill-zinc-950 stroke-blue-500", active ? "" : "")}
                  strokeWidth={2}
                  tabIndex={0}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onFocus={() => setHoverIdx(i)}
                  onBlur={() => setHoverIdx(null)}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  aria-label={`${d.year}-${String(d.month).padStart(2, "0")} ${formatCurrencyKRW(d.revenue)}`}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoverIdx != null && sorted[hoverIdx] && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="pointer-events-none absolute"
              style={{
                left: `${((sorted[hoverIdx].month - 1) / 11) * 100}%`,
                top: 0,
                transform: "translate(-50%, 40px)",
              }}
            >
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 shadow-lg">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  {sorted[hoverIdx].year}.{String(sorted[hoverIdx].month).padStart(2, "0")}
                </div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrencyKRW(sorted[hoverIdx].revenue)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MonthRow({ item, isEditing, onStartEdit, onCancel, onSave, onDelete }: MonthRowProps) {
  const [draft, setDraft] = useState<number>(item.revenue);
  useEffect(() => {
    if (isEditing) setDraft(item.revenue);
  }, [isEditing, item.revenue]);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm text-zinc-700 dark:text-zinc-300">
          {String(item.month).padStart(2, "0")}
        </div>
        <div className="truncate">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {item.year}. {monthNames[item.month - 1]}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">생성: {new Date(item.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              aria-label="Revenue"
              value={draft}
              onChange={(e) => setDraft(Number(e.target.value))}
              className="w-36 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800"
            />
            <Button
              size="sm"
              aria-label="Save"
              onClick={() => onSave(item.id, draft)}
              className="transition-all hover:scale-[0.98]"
            >
              <Save className="mr-1 h-4 w-4" /> 저장
            </Button>
            <Button
              size="sm"
              variant="secondary"
              aria-label="Cancel"
              onClick={onCancel}
              className="transition-all hover:scale-[0.98]"
            >
              <X className="mr-1 h-4 w-4" /> 취소
            </Button>
          </div>
        ) : (
          <>
            <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 min-w-32 text-right">
              {formatCurrencyKRW(item.revenue)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                aria-label="Edit"
                onClick={() => onStartEdit(item.id, item.revenue)}
                className="transition-all hover:scale-[0.98] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <Edit className="mr-1 h-4 w-4" /> 편집
              </Button>
              <Button
                size="sm"
                variant="destructive"
                aria-label="Delete"
                onClick={() => onDelete(item.id)}
                className="transition-all hover:scale-[0.98]"
              >
                <Trash2 className="mr-1 h-4 w-4" /> 삭제
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}