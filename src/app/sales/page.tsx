"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Filter,
  RefreshCw,
  AlertTriangle,
  Eye,
  Calendar,
  Package,
  Users,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

// 로컬 타입 정의 (API 응답과 일치)
type OrderStatus = "접수" | "진행" | "완료" | "취소";
interface SalesCustomer {
  customer_id: string;
  company_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  grade: string;
  region: string;
}
interface SalesProduct {
  product_id: string;
  product_name: string;
  category: string;
  unit_price: number;
  stock_qty: number;
  is_active: boolean;
}
interface SalesOrder {
  order_id: string;
  customer_id: string;
  product_id: string;
  order_date: string; // YYYY-MM-DD
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: OrderStatus;
}

// 역할 타입 (클라이언트 로컬에서 사용)
export type UserRole = "viewer" | "sales_rep" | "sales_manager" | "admin";

interface OrdersResponse {
  ok: boolean;
  data?: SalesOrder[];
  error?: string;
}

interface BasicResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const PAGE_SIZE = 10;

const currency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

function getStoredRole(): UserRole {
  if (typeof window === "undefined") return "viewer";
  // 유연한 키 지원: 기존 페이지에서 어떤 키를 사용했는지 확실치 않으므로 다중 조회
  const keys = ["userRole", "app_role", "currentRole"];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v === "viewer" || v === "sales_rep" || v === "sales_manager" || v === "admin") {
      return v;
    }
  }
  return "viewer";
}

function statusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status.includes("취소")) return "destructive";
  if (status.includes("완료")) return "default";
  if (status.includes("진행")) return "secondary";
  return "outline";
}

function toDateValue(d?: string): string {
  return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "";
}

export default function SalesPage() {
  const [role, setRole] = useState<UserRole>("viewer");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<SalesCustomer[]>([]);
  const [products, setProducts] = useState<SalesProduct[]>([]);

  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<SalesOrder | null>(null);

  const allowed = role === "sales_rep" || role === "sales_manager" || role === "admin";

  useEffect(() => {
    setRole(getStoredRole());
  }, []);

  const customerMap = useMemo(() => {
    const m = new Map<string, SalesCustomer>();
    customers.forEach((c) => m.set(c.customer_id, c));
    return m;
  }, [customers]);

  const productMap = useMemo(() => {
    const m = new Map<string, SalesProduct>();
    products.forEach((p) => m.set(p.product_id, p));
    return m;
  }, [products]);

  const pagedOrders = useMemo(() => {
    const startIdx = (page - 1) * PAGE_SIZE;
    return orders.slice(startIdx, startIdx + PAGE_SIZE);
  }, [orders, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(orders.length / PAGE_SIZE)), [orders.length]);

  const topCustomers = useMemo(() => {
    const sumByCustomer: Record<string, number> = {};
    for (const o of orders) {
      sumByCustomer[o.customer_id] = (sumByCustomer[o.customer_id] ?? 0) + o.total_amount;
    }
    const arr = Object.entries(sumByCustomer)
      .map(([customer_id, total]) => ({
        customer_id,
        company_name: customerMap.get(customer_id)?.company_name ?? customer_id,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
    return arr;
  }, [orders, customerMap]);

  const totals = useMemo(() => {
    const totalAmount = orders.reduce((acc, o) => acc + o.total_amount, 0);
    const completed = orders.filter((o) => o.status.includes("완료")).length;
    return { totalAmount, completed, count: orders.length };
  }, [orders]);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("type", "orders");
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    if (status) params.set("status", status);
    return `/api/data?${params.toString()}`;
  }, [start, end, status]);

  const fetchOrders = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        fetch(buildQuery(), { headers: { "X-User-Role": role } }),
        fetch(`/api/data?type=customers`, { headers: { "X-User-Role": role } }),
        fetch(`/api/data?type=products`, { headers: { "X-User-Role": role } }),
      ]);

      if (ordersRes.status === 403) {
        setError("권한이 없습니다. 접근 가능한 역할로 전환해 주세요.");
        setOrders([]);
      } else {
        const d: OrdersResponse = await ordersRes.json();
        if (!d.ok) throw new Error(d.error || "주문 데이터를 불러오지 못했습니다.");
        setOrders(Array.isArray(d.data) ? d.data : []);
      }

      const c: BasicResponse<SalesCustomer[]> = await customersRes.json();
      setCustomers(c.ok && Array.isArray(c.data) ? c.data : []);

      const p: BasicResponse<SalesProduct[]> = await productsRes.json();
      setProducts(p.ok && Array.isArray(p.data) ? p.data : []);

      setPage(1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "데이터 로드 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [allowed, buildQuery, role]);

  useEffect(() => {
    fetchOrders().catch(() => undefined);
  }, [fetchOrders]);

  const onFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchOrders().catch(() => undefined);
  };

  if (!allowed) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">접근 제한</CardTitle>
            <CardDescription className="text-muted-foreground">
              영업 페이지는 영업 사원/매니저/관리자만 접근할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 text-muted-foreground">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              <p>
                현재 역할: <span className="font-medium text-foreground">{role}</span>. 메인 페이지에서 역할을 변경해 주세요.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/">
              <Button variant="secondary">메인 대시보드로 이동</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 전문적인 페이지 제목 추가 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">영업 운영 대시보드</h1>
        <p className="text-sm text-muted-foreground">기간 및 상태별 주문 현황과 상위 고객·제품 인사이트를 제공합니다.</p>
      </div>

      <section aria-label="요약 KPI" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<ShoppingCart className="h-5 w-5" aria-hidden="true" />}
          title="총 주문금액"
          value={currency.format(totals.totalAmount)}
          hint={`${totals.count}건`}
        />
        <SummaryCard
          icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
          title="완료된 주문"
          value={`${totals.completed}건`}
          hint="상태=완료"
        />
        <SummaryCard
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
          title="상위 고객"
          value={topCustomers[0]?.company_name || "-"}
          hint={topCustomers[0] ? currency.format(topCustomers[0].total) : "데이터 없음"}
        />
        <SummaryCard
          icon={<Package className="h-5 w-5" aria-hidden="true" />}
          title="활성 제품 수"
          value={`${products.filter((p) => p.is_active).length}개`}
          hint={`${products.length}개 전체`}
        />
      </section>

      <section aria-label="필터" className="">
        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">주문 필터</CardTitle>
              <CardDescription className="text-muted-foreground">기간과 상태로 주문을 조회하세요.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">역할: {role}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onFilterSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor="start" className="text-sm text-muted-foreground">시작일</label>
                <div className="flex items-center gap-2 border border-input rounded-md px-3 py-2 bg-background">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="start"
                    name="start"
                    type="date"
                    value={toDateValue(start)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStart(e.target.value)}
                    className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
                    aria-label="시작일"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor="end" className="text-sm text-muted-foreground">종료일</label>
                <div className="flex items-center gap-2 border border-input rounded-md px-3 py-2 bg-background">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="end"
                    name="end"
                    type="date"
                    value={toDateValue(end)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnd(e.target.value)}
                    className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
                    aria-label="종료일"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 md:col-span-1">
                <label htmlFor="status" className="text-sm text-muted-foreground">상태</label>
                <div className="border border-input rounded-md px-3 py-2 bg-background">
                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
                    className="bg-transparent outline-none w-full text-foreground"
                    aria-label="주문 상태"
                  >
                    <option value="">전체</option>
                    <option value="접수">접수</option>
                    <option value="진행">진행</option>
                    <option value="완료">완료</option>
                    <option value="취소">취소</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-5 flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => { setStart(""); setEnd(""); setStatus(""); }}>
                  초기화
                </Button>
                <Button type="submit" variant="secondary">
                  <Filter className="h-4 w-4 mr-2" aria-hidden="true" /> 조회
                </Button>
                <Button type="button" onClick={() => fetchOrders()}>
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  )}
                  새로고침
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <section aria-label="상위 고객">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">상위 고객</CardTitle>
            <CardDescription className="text-muted-foreground">필터 결과 기준 상위 3개 고객</CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-muted-foreground">데이터가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {topCustomers.map((c) => (
                  <div key={c.customer_id} className="border border-border rounded-md p-3 bg-background">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{c.company_name}</span>
                      <Badge variant="outline">{c.customer_id}</Badge>
                    </div>
                    <div className="mt-2 text-foreground font-semibold">{currency.format(c.total)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="주문 리스트">
        <Card className="bg-card border border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">주문 목록</CardTitle>
              <CardDescription className="text-muted-foreground">
                총 {orders.length}건, 페이지 {page}/{totalPages}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="p-4 flex items-start gap-3 text-destructive">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                <p className="text-foreground">{error}</p>
              </div>
            ) : loading ? (
              <div className="p-6 flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> 로딩 중...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-muted-foreground">조건에 해당하는 주문이 없습니다.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr className="text-left">
                      <Th>날짜</Th>
                      <Th>주문번호</Th>
                      <Th>고객</Th>
                      <Th>제품</Th>
                      <Th className="text-right">수량</Th>
                      <Th className="text-right">단가</Th>
                      <Th className="text-right">금액</Th>
                      <Th>상태</Th>
                      <Th className="text-right">보기</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map((o) => (
                      <tr key={o.order_id} className="border-t border-border hover:bg-muted/50 transition-colors">
                        <Td>{o.order_date}</Td>
                        <Td className="font-medium text-foreground">{o.order_id}</Td>
                        <Td>{customerMap.get(o.customer_id)?.company_name ?? o.customer_id}</Td>
                        <Td>{productMap.get(o.product_id)?.product_name ?? o.product_id}</Td>
                        <Td className="text-right tabular-nums">{o.quantity.toLocaleString()}</Td>
                        <Td className="text-right tabular-nums">{currency.format(o.unit_price)}</Td>
                        <Td className="text-right tabular-nums font-semibold">{currency.format(o.total_amount)}</Td>
                        <Td>
                          <Badge variant={statusBadgeVariant(o.status)}>{o.status}</Badge>
                        </Td>
                        <Td className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelected(o)} aria-label={`${o.order_id} 상세 보기`}>
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">{orders.length > 0 && `${(page - 1) * PAGE_SIZE + 1} - ${Math.min(page * PAGE_SIZE, orders.length)} / ${orders.length}`}</div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" /> 이전
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                다음 <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </section>

      {selected && (
        <OrderDetailModal
          order={selected}
          customer={customerMap.get(selected.customer_id)}
          product={productMap.get(selected.product_id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// Sub Components (동일 파일 내 정의)
interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  hint?: string;
}
function SummaryCard({ icon, title, value, hint }: SummaryCardProps) {
  return (
    <Card className="bg-card border border-border h-full">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-md bg-muted text-foreground">{icon}</div>
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-lg font-semibold text-foreground">{value}</div>
          {hint ? (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" aria-hidden="true" /> {hint}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-2 text-xs font-medium text-muted-foreground", className)}>
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-2 align-middle text-foreground", className)}>{children}</td>;
}

interface OrderDetailModalProps {
  order: SalesOrder;
  customer?: SalesCustomer;
  product?: SalesProduct;
  onClose: () => void;
}

function OrderDetailModal({ order, customer, product, onClose }: OrderDetailModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <Card className="bg-popover border border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">주문 상세</CardTitle>
            <CardDescription className="text-muted-foreground">{order.order_id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="주문일" value={order.order_date} />
            <Row label="고객" value={customer?.company_name ?? order.customer_id} />
            <Row label="제품" value={product?.product_name ?? order.product_id} />
            <Row label="수량" value={`${order.quantity.toLocaleString()} ea`} />
            <Row label="단가" value={currency.format(order.unit_price)} />
            <Row label="금액" value={currency.format(order.total_amount)} emphasized />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">상태</span>
              <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>닫기</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, emphasized }: { label: string; value: React.ReactNode; emphasized?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm text-foreground", emphasized && "font-semibold")}>{value}</span>
    </div>
  );
}
