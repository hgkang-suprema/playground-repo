"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Dashboard from "@/components/Dashboard";

// 로컬 전용 타입 (외부 타입 의존 제거)
export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

// Dashboard 컴포넌트와 구조 호환되도록 정의
export type SalesOrder = {
  order_id: string;
  customer_id: string;
  product_id: string;
  order_date: string; // YYYY-MM-DD
  quantity: number;
  unit_price: number;
  total_amount?: number;
  status?: string;
};

export type SalesTarget = {
  target_id: string;
  department_id: string;
  target_year: number;
  target_quarter: "Q1" | "Q2" | "Q3" | "Q4";
  target_amount?: number;
  actual_amount?: number | null;
};

export type SalesCustomer = {
  customer_id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  tier?: string;
};

export type SalesProduct = {
  product_id: string;
  product_name?: string;
  category?: string;
  unit_price?: number;
};

// 페이지 전용 타입들
export type UserRole = "viewer" | "sales_rep" | "sales_manager" | "admin";

interface TopCustomer {
  customer_id: string;
  company_name: string;
  total: number;
}

interface DashboardData {
  orders: SalesOrder[];
  targets: SalesTarget[];
  customers: SalesCustomer[];
  products: SalesProduct[];
  kpis: {
    totalSales: number;
    targetsProgress: number; // 0~100
    topCustomers: TopCustomer[];
  };
}

function formatCurrencyKRW(value: number): string {
  try {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString()}원`;
  }
}

export default function Page() {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === "undefined") return "viewer";
    const saved = window.localStorage.getItem("app.role");
    if (saved === "sales_rep" || saved === "sales_manager" || saved === "admin" || saved === "viewer") return saved as UserRole;
    return "viewer";
  });

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [customers, setCustomers] = useState<SalesCustomer[]>([]);
  const [products, setProducts] = useState<SalesProduct[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("app.role", role);
    }
  }, [role]);

  async function fetchList<T>(type: string, params?: Record<string, string | number | boolean>): Promise<T[]> {
    const usp = new URLSearchParams({ type });
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) usp.set(k, String(v));
      });
    }
    const res = await fetch(`/api/data?${usp.toString()}`, {
      headers: { "X-User-Role": role },
      cache: "no-store",
    });
    const json = (await res.json()) as ApiResponse<T[]>;
    if (!res.ok || !json.ok) {
      const msg = json?.error || `요청 실패 (HTTP ${res.status})`;
      throw new Error(msg);
    }
    return json.data ?? [];
  }

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [o, t, c, p] = await Promise.all([
        fetchList<SalesOrder>("orders"),
        fetchList<SalesTarget>("targets"),
        fetchList<SalesCustomer>("customers"),
        fetchList<SalesProduct>("products"),
      ]);
      setOrders(o);
      setTargets(t);
      setCustomers(c);
      setProducts(p);
    } catch (e) {
      const message = e instanceof Error ? e.message : "데이터 로드 중 오류가 발생했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 역할 변경 시마다 새로 로드
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const kpis = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

    const totalTarget = targets.reduce((sum, t) => sum + (t.target_amount ?? 0), 0);
    const totalActual = targets.reduce((sum, t) => sum + (t.actual_amount ?? 0), 0);
    const targetsProgress = totalTarget > 0 ? Math.min(100, Math.max(0, Math.round((totalActual / totalTarget) * 100))) : 0;

    const byCustomer = new Map<string, number>();
    for (const o of orders) {
      byCustomer.set(o.customer_id, (byCustomer.get(o.customer_id) ?? 0) + (o.total_amount ?? 0));
    }
    const topCustomers: TopCustomer[] = Array.from(byCustomer.entries())
      .map(([customer_id, total]) => {
        const info = customers.find((c) => c.customer_id === customer_id);
        return {
          customer_id,
          company_name: info?.company_name ?? customer_id,
          total,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { totalSales, targetsProgress, topCustomers };
  }, [orders, targets, customers]);

  const dashboardData: DashboardData = useMemo(
    () => ({ orders, targets, customers, products, kpis }),
    [orders, targets, customers, products, kpis]
  );

  // Dashboard 컴포넌트의 내부 타입과 구조적으로 호환되는 어댑트 타입
  type DashboardSalesTarget = {
    target_id: string;
    department_id: string;
    target_year: number | string;
    target_quarter: string | number;
    target_amount?: number;
    actual_amount?: number; // null 제거
  };

  type DashboardSalesProduct = {
    product_id: string;
    product_name: string; // 필수 보장
  };

  // 타입 불일치 교정: null 제거 및 필수 필드 보완
  const adaptedTargets = useMemo<DashboardSalesTarget[]>(
    () =>
      targets.map((t) => ({
        target_id: t.target_id,
        department_id: t.department_id,
        target_year: t.target_year,
        target_quarter: t.target_quarter,
        target_amount: t.target_amount,
        actual_amount: t.actual_amount ?? undefined,
      })),
    [targets]
  );

  const adaptedProducts = useMemo<DashboardSalesProduct[]>(
    () =>
      products.map((p) => ({
        product_id: p.product_id,
        product_name: p.product_name ?? p.product_id,
      })),
    [products]
  );

  const canSeeSales = role === "sales_rep" || role === "sales_manager" || role === "admin";
  const canSeeManager = role === "sales_manager" || role === "admin";

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">영업 성과 대시보드</h1>
            <Badge variant="secondary" aria-label={`현재 역할: ${role}`}>{role}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="role" className="text-sm text-muted-foreground">
              역할 선택
            </label>
            <select
              id="role"
              value={role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as UserRole)}
              className={cn(
                "rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary transition"
              )}
              aria-label="역할 선택"
            >
              <option value="viewer">viewer</option>
              <option value="sales_rep">sales_rep</option>
              <option value="sales_manager">sales_manager</option>
              <option value="admin">admin</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => void loadAll()} aria-label="데이터 새로고침">
              새로고침
            </Button>
          </div>
        </div>

        <nav aria-label="주요 내비게이션">
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/"
              className={cn(
                "px-3 py-2 rounded-md border text-sm transition-colors",
                pathname === "/" ? "bg-accent text-foreground border-border" : "bg-card text-foreground hover:bg-muted border-border"
              )}
            >
              대시보드
            </Link>
            {canSeeSales && (
              <Link
                href="/sales"
                className={cn(
                  "px-3 py-2 rounded-md border text-sm transition-colors",
                  pathname === "/sales" ? "bg-accent text-foreground border-border" : "bg-card text-foreground hover:bg-muted border-border"
                )}
              >
                영업 뷰
              </Link>
            )}
            {canSeeManager && (
              <Link
                href="/manager"
                className={cn(
                  "px-3 py-2 rounded-md border text-sm transition-colors",
                  pathname === "/manager" ? "bg-accent text-foreground border-border" : "bg-card text-foreground hover:bg-muted border-border"
                )}
              >
                매니저 뷰
              </Link>
            )}
          </div>
        </nav>
      </section>

      {error && (
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">로드 오류</CardTitle>
            <CardDescription className="text-muted-foreground">
              데이터를 불러오는 중 문제가 발생했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!error && (
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="bg-card border border-border animate-pulse">
                  <CardHeader>
                    <CardTitle className="h-5 w-32 bg-muted rounded" />
                    <CardDescription className="h-4 w-24 bg-muted rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 w-full bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 && targets.length === 0 && customers.length === 0 ? (
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">아직 데이터가 없습니다</CardTitle>
                <CardDescription className="text-muted-foreground">
                  샘플 데이터가 로드되지 않았습니다. 새로고침을 시도해 주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" onClick={() => void loadAll()}>새로고침</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* KPI 요약 배너 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-card border border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">총 매출</CardTitle>
                    <CardDescription className="text-muted-foreground">주문 합계</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-foreground">{formatCurrencyKRW(dashboardData.kpis.totalSales)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">목표 달성률</CardTitle>
                    <CardDescription className="text-muted-foreground">전체 Targets 기준</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-full h-2 bg-muted rounded">
                        <div
                          className="h-2 bg-primary rounded"
                          style={{ width: `${dashboardData.kpis.targetsProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground" aria-label={`달성률 ${dashboardData.kpis.targetsProgress}%`}>
                        {dashboardData.kpis.targetsProgress}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">상위 고객</CardTitle>
                    <CardDescription className="text-muted-foreground">Top 1 기준</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.kpis.topCustomers.length > 0 ? (
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">{dashboardData.kpis.topCustomers[0].company_name}</span>
                        <span className="text-foreground font-medium">{formatCurrencyKRW(dashboardData.kpis.topCustomers[0].total)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">데이터 없음</span>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 공용 대시보드 컴포넌트 (자세한 표/리스트) */}
              <Dashboard
                orders={dashboardData.orders}
                targets={adaptedTargets}
                customers={dashboardData.customers}
                products={adaptedProducts}
                kpis={dashboardData.kpis}
                loading={loading}
                error={error}
                role={role}
              />
            </div>
          )}
        </section>
      )}
    </main>
  );
}
