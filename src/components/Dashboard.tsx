"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, Target, Users2, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";

// Local minimal types (structural typing compatible)
interface SalesOrder {
  order_id: string;
  order_date: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount?: number;
  status?: string;
}

interface SalesTarget {
  target_id: string;
  department_id: string;
  target_year: number | string;
  target_quarter: string | number;
  target_amount?: number;
  actual_amount?: number;
}

interface SalesCustomer {
  customer_id: string;
  company_name: string;
}

interface SalesProduct {
  product_id: string;
  product_name: string;
}

export type UserRole = "viewer" | "sales_rep" | "sales_manager" | "admin";

interface DashboardProps {
  orders?: SalesOrder[];
  targets?: SalesTarget[];
  customers?: SalesCustomer[];
  products?: SalesProduct[];
  kpis?: {
    totalSales?: number;
    targetsProgress?: number; // 0~100
    topCustomers?: { customer_id: string; company_name: string; total: number }[];
  };
  role?: UserRole;
  className?: string;
  loading?: boolean;
  error?: string | null;
}

// Utils
function formatCurrency(value: number | undefined | null): string {
  const n = typeof value === "number" && isFinite(value) ? value : 0;
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);
}

function formatNumber(value: number | undefined | null): string {
  const n = typeof value === "number" && isFinite(value) ? value : 0;
  return new Intl.NumberFormat("ko-KR").format(n);
}

function clampPercent(value: number): number {
  if (!isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

// Top KPI Card
interface TopKpiCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}
function TopKpiCard({ title, value, description, icon, extra }: TopKpiCardProps): React.ReactElement {
  return (
    <Card className="bg-card text-card-foreground border border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
      {extra ? <CardFooter className="pt-0">{extra}</CardFooter> : null}
    </Card>
  );
}

// Targets Progress
interface TargetsProgressProps {
  targets: SalesTarget[];
}
function TargetsProgress({ targets }: TargetsProgressProps): React.ReactElement {
  const items = targets.slice(0, 6);
  return (
    <Card className="bg-card text-card-foreground border border-border">
      <CardHeader>
        <CardTitle className="text-base">목표 달성률</CardTitle>
        <CardDescription className="text-sm">분기별 목표 진행 현황</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">표시할 목표가 없습니다.</p>
        ) : (
          items.map((t) => {
            const target = t.target_amount || 0;
            const actual = t.actual_amount ?? 0;
            const pct = clampPercent(target > 0 ? (actual / target) * 100 : 0);
            return (
              <div key={t.target_id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{t.target_year} {t.target_quarter}</Badge>
                    <span className="text-muted-foreground">부서 {t.department_id}</span>
                  </div>
                  <span className="text-foreground font-medium">{formatNumber(Math.round(pct))}%</span>
                </div>
                <div className="h-2 w-full rounded bg-muted overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={`목표 진행률 ${Math.round(pct)}%`}>
                  <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>목표 {formatCurrency(target)}</span>
                  <span>실적 {formatCurrency(actual)}</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// SmallChart: simple inline SVG (bar or line)
interface SmallChartProps {
  values: number[];
  variant?: "bar" | "line";
  className?: string;
}
function SmallChart({ values, variant = "line", className }: SmallChartProps): React.ReactElement {
  const width = 200;
  const height = 56;
  const padding = 6;
  const safeValues = values && values.length > 0 ? values : [0];
  const max = Math.max(...safeValues);
  const min = Math.min(...safeValues);
  const range = Math.max(1, max - min);
  const points = safeValues.map((v, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(1, safeValues.length - 1);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return { x, y };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full h-14", className)} aria-hidden>
      {variant === "bar" ? (
        <g className="text-chart-1">
          {safeValues.map((v, i) => {
            const barW = (width - padding * 2) / Math.max(1, safeValues.length * 1.5);
            const x = padding + i * ((width - padding * 2) / safeValues.length) + barW * 0.25;
            const h = ((v - min) / range) * (height - padding * 2);
            const y = height - padding - h;
            return <rect key={i} x={x} y={y} width={barW} height={h} fill="currentColor" className="opacity-80" rx={2} />;
          })}
        </g>
      ) : (
        <g className="text-chart-1">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          />
        </g>
      )}
    </svg>
  );
}

// Orders Table
type OrderSortKey = "date" | "amount";
interface OrdersTableProps {
  orders: SalesOrder[];
  customers?: SalesCustomer[];
  products?: SalesProduct[];
  initialLimit?: number;
}
function OrdersTable({ orders, customers = [], products = [], initialLimit = 8 }: OrdersTableProps): React.ReactElement {
  const [sortKey, setSortKey] = useState<OrderSortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState<number>(initialLimit);

  const customerMap = useMemo(() => new Map(customers.map((c) => [c.customer_id, c])), [customers]);
  const productMap = useMemo(() => new Map(products.map((p) => [p.product_id, p])), [products]);

  const sorted = useMemo(() => {
    const copy = [...orders];
    copy.sort((a, b) => {
      if (sortKey === "date") {
        const da = a.order_date;
        const db = b.order_date;
        if (da === db) return 0;
        return sortDir === "asc" ? (da < db ? -1 : 1) : (da > db ? -1 : 1);
      }
      // amount
      const aa = a.total_amount ?? a.quantity * a.unit_price;
      const bb = b.total_amount ?? b.quantity * b.unit_price;
      return sortDir === "asc" ? aa - bb : bb - aa;
    });
    return copy.slice(0, limit);
  }, [orders, sortKey, sortDir, limit]);

  function toggleSort(nextKey: OrderSortKey): void {
    if (sortKey === nextKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(nextKey);
      setSortDir("desc");
    }
  }

  return (
    <Card className="bg-card text-card-foreground border border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">최근 주문</CardTitle>
          <CardDescription className="text-sm">최신 순 또는 금액 순으로 정렬할 수 있습니다.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => toggleSort("date")} aria-label="날짜 정렬 전환">
            날짜
            {sortKey === "date" ? (sortDir === "desc" ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />) : null}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggleSort("amount")} aria-label="금액 정렬 전환">
            금액
            {sortKey === "amount" ? (sortDir === "desc" ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />) : null}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">표시할 주문이 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-2 font-medium">주문일</th>
                <th className="py-2 pr-2 font-medium">주문ID</th>
                <th className="py-2 pr-2 font-medium">고객</th>
                <th className="py-2 pr-2 font-medium">제품</th>
                <th className="py-2 pr-2 font-medium text-right">수량</th>
                <th className="py-2 pr-2 font-medium text-right">금액</th>
                <th className="py-2 pr-2 font-medium text-right">상태</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((o) => (
                <OrderRow key={o.order_id} order={o} customer={customerMap.get(o.customer_id)} product={productMap.get(o.product_id)} />
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
      {orders.length > limit ? (
        <CardFooter>
          <Button variant="secondary" size="sm" onClick={() => setLimit((v) => v + initialLimit)}>
            더 보기
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}

interface OrderRowProps {
  order: SalesOrder;
  customer?: SalesCustomer;
  product?: SalesProduct;
}
function OrderRow({ order, customer, product }: OrderRowProps): React.ReactElement {
  const total = order.total_amount ?? order.quantity * order.unit_price;
  const status = String(order.status || "");
  let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "secondary";
  if (status.includes("완료")) badgeVariant = "default";
  else if (status.includes("취소") || status.includes("지연")) badgeVariant = "destructive";
  else if (status.includes("접수")) badgeVariant = "outline";

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2 pr-2 whitespace-nowrap">{order.order_date}</td>
      <td className="py-2 pr-2 font-medium text-foreground whitespace-nowrap">{order.order_id}</td>
      <td className="py-2 pr-2 whitespace-nowrap">{customer?.company_name ?? order.customer_id}</td>
      <td className="py-2 pr-2 whitespace-nowrap">{product?.product_name ?? order.product_id}</td>
      <td className="py-2 pr-2 text-right whitespace-nowrap">{formatNumber(order.quantity)}</td>
      <td className="py-2 pr-2 text-right whitespace-nowrap">{formatCurrency(total)}</td>
      <td className="py-2 pr-0 text-right whitespace-nowrap">
        <Badge variant={badgeVariant}>{status || "-"}</Badge>
      </td>
    </tr>
  );
}

// Customers List (Top N)
interface CustomersListProps {
  topCustomers: { customer_id: string; company_name: string; total: number }[];
}
function CustomersList({ topCustomers }: CustomersListProps): React.ReactElement {
  return (
    <Card className="bg-card text-card-foreground border border-border">
      <CardHeader>
        <CardTitle className="text-base">상위 고객</CardTitle>
        <CardDescription className="text-sm">매출 상위 고객 목록</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {topCustomers.length === 0 ? (
          <p className="text-sm text-muted-foreground">표시할 고객이 없습니다.</p>
        ) : (
          topCustomers.map((c) => (
            <div key={c.customer_id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Users2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{c.company_name}</span>
              </div>
              <span className="font-medium">{formatCurrency(c.total)}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// Main Dashboard
export default function Dashboard({ orders = [], targets = [], customers = [], products = [], kpis, role = "viewer", className, loading, error, }: DashboardProps): React.ReactElement {
  // Derived metrics
  const totalSales = useMemo(() => {
    if (kpis?.totalSales != null) return kpis.totalSales;
    return orders.reduce((sum, o) => sum + (o.total_amount ?? o.quantity * o.unit_price), 0);
  }, [orders, kpis?.totalSales]);

  const ordersCount = useMemo(() => orders.length, [orders]);

  const avgOrder = useMemo(() => (ordersCount > 0 ? Math.round(totalSales / ordersCount) : 0), [totalSales, ordersCount]);

  const overallTargetPct = useMemo(() => {
    if (kpis?.targetsProgress != null) return clampPercent(kpis.targetsProgress);
    const targetSum = targets.reduce((s, t) => s + (t.target_amount || 0), 0);
    const actualSum = targets.reduce((s, t) => s + (t.actual_amount || 0), 0);
    return clampPercent(targetSum > 0 ? (actualSum / targetSum) * 100 : 0);
  }, [targets, kpis?.targetsProgress]);

  const topCustomers = useMemo(() => {
    if (kpis?.topCustomers) return kpis.topCustomers.slice(0, 5);
    const map = new Map<string, number>();
    for (const o of orders) {
      const total = o.total_amount ?? o.quantity * o.unit_price;
      map.set(o.customer_id, (map.get(o.customer_id) || 0) + total);
    }
    const sorted = Array.from(map.entries())
      .map(([customer_id, total]) => {
        const c = customers.find((x) => x.customer_id === customer_id);
        return { customer_id, company_name: c?.company_name ?? customer_id, total };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    return sorted;
  }, [orders, customers, kpis?.topCustomers]);

  // Mini time series for chart (last N orders amounts by date)
  const chartValues = useMemo(() => {
    if (orders.length === 0) return [0];
    const byDate = new Map<string, number>();
    for (const o of orders) {
      const total = o.total_amount ?? o.quantity * o.unit_price;
      byDate.set(o.order_date, (byDate.get(o.order_date) || 0) + total);
    }
    const dates = Array.from(byDate.keys()).sort();
    return dates.map((d) => byDate.get(d) || 0).slice(-12);
  }, [orders]);

  return (
    <section className={cn("w-full", className)}>
      {error ? (
        <Card className="mb-4 bg-destructive text-white border-0">
          <CardHeader>
            <CardTitle className="text-base">에러</CardTitle>
            <CardDescription className="text-white/90">{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {loading ? (
        <Card className="mb-4 border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">로딩 중...</CardTitle>
            <CardDescription>데이터를 불러오고 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TopKpiCard
          title="총 매출"
          value={formatCurrency(totalSales)}
          description="집계 기간 내 주문 합계"
          icon={<TrendingUp className="h-5 w-5" />}
          extra={<SmallChart values={chartValues} variant="line" />}
        />
        <TopKpiCard
          title="평균 주문 금액"
          value={formatCurrency(avgOrder)}
          description="주문 1건당 평균 금액"
          icon={<ShoppingCart className="h-5 w-5" />}
          extra={<SmallChart values={chartValues} variant="bar" />}
        />
        <TopKpiCard
          title="주문 수"
          value={formatNumber(ordersCount)}
          description="총 주문 건수"
          icon={<Users2 className="h-5 w-5" />}
        />
        <TopKpiCard
          title="목표 달성률"
          value={`${Math.round(overallTargetPct)}%`}
          description={role === "viewer" ? "읽기 전용" : "팀 목표 진행률"}
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      {/* Main Grid */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <OrdersTable orders={orders} customers={customers} products={products} />
        </div>
        <div className="flex flex-col gap-4">
          <CustomersList topCustomers={topCustomers} />
          <TargetsProgress targets={targets} />
        </div>
      </div>
    </section>
  );
}
