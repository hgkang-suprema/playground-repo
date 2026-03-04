"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Local type to avoid missing export errors from '@/lib/types'
export interface SalesTarget {
  target_id: string;
  department_id: string;
  target_year: number;
  target_quarter: "Q1" | "Q2" | "Q3" | "Q4";
  target_amount: number;
  actual_amount?: number | null;
}

export type UserRole = "viewer" | "sales_rep" | "sales_manager" | "admin";

interface BasicResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

interface TargetsResponse {
  ok: boolean;
  data?: SalesTarget[];
  error?: string;
}

interface ProgressBarProps {
  value: number; // 0~100
  label?: string;
}

function ProgressBar({ value, label }: ProgressBarProps): React.ReactElement {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className="w-full">
      {label ? (
        <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <span>{clamped.toFixed(0)}%</span>
        </div>
      ) : null}
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${clamped}%` }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Number.isFinite(clamped) ? clamped : 0}
          role="progressbar"
        />
      </div>
    </div>
  );
}

interface TargetProgressCardProps {
  target: SalesTarget;
  onEdit: (t: SalesTarget) => void;
}

function TargetProgressCard({ target, onEdit }: TargetProgressCardProps): React.ReactElement {
  const actual = target.actual_amount ?? 0;
  const pct = target.target_amount > 0 ? (actual / target.target_amount) * 100 : 0;
  return (
    <Card className="bg-card text-card-foreground border border-border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">부서 {target.department_id}</CardTitle>
            <CardDescription>
              {target.target_year} • <span className="font-medium">{target.target_quarter}</span>
            </CardDescription>
          </div>
          <Badge variant="secondary">Target</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">목표 금액</div>
            <div className="text-lg font-semibold">{target.target_amount.toLocaleString()}원</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">실적</div>
            <div className="text-lg font-semibold">{(target.actual_amount ?? 0).toLocaleString()}원</div>
          </div>
        </div>
        <ProgressBar value={pct} />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => onEdit(target)} className="transition-colors">수정</Button>
      </CardFooter>
    </Card>
  );
}

interface TargetFormState {
  target_id?: string;
  department_id: string;
  target_year: number | "";
  target_quarter: "Q1" | "Q2" | "Q3" | "Q4" | "";
  target_amount: number | "";
  actual_amount?: number | "";
}

interface TargetFormProps {
  role: UserRole;
  initial?: SalesTarget | null;
  onCancel: () => void;
  onSubmitted: (updated: SalesTarget) => void;
}

function TargetForm({ role, initial, onCancel, onSubmitted }: TargetFormProps): React.ReactElement {
  const isEditable = role === "sales_manager" || role === "admin";
  const [form, setForm] = useState<TargetFormState>(() => {
    if (initial) {
      return {
        target_id: initial.target_id,
        department_id: initial.department_id,
        target_year: initial.target_year,
        target_quarter: initial.target_quarter as "Q1" | "Q2" | "Q3" | "Q4",
        target_amount: initial.target_amount,
        actual_amount: initial.actual_amount ?? "",
      };
    }
    return {
      department_id: "",
      target_year: new Date().getFullYear(),
      target_quarter: "",
      target_amount: "",
      actual_amount: "",
    };
  });

  useEffect(() => {
    if (initial) {
      setForm({
        target_id: initial.target_id,
        department_id: initial.department_id,
        target_year: initial.target_year,
        target_quarter: initial.target_quarter as "Q1" | "Q2" | "Q3" | "Q4",
        target_amount: initial.target_amount,
        actual_amount: initial.actual_amount ?? "",
      });
    } else {
      setForm({
        department_id: "",
        target_year: new Date().getFullYear(),
        target_quarter: "",
        target_amount: "",
        actual_amount: "",
      });
    }
  }, [initial]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onChange = <K extends keyof TargetFormState>(key: K, value: TargetFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): string | null => {
    if (!form.department_id.trim()) return "부서를 입력하세요";
    if (form.target_year === "" || Number.isNaN(Number(form.target_year))) return "연도를 올바르게 입력하세요";
    if (!form.target_quarter) return "분기를 선택하세요";
    if (form.target_amount === "" || Number(form.target_amount) <= 0) return "목표 금액을 0보다 크게 입력하세요";
    if (form.actual_amount !== "" && Number(form.actual_amount) < 0) return "실적 금액은 0 이상이어야 합니다";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    if (!isEditable) {
      setError("권한이 없습니다. (sales_manager 또는 admin만 편집 가능)");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<SalesTarget> & {
        department_id: string;
        target_year: number;
        target_quarter: "Q1" | "Q2" | "Q3" | "Q4";
        target_amount: number;
        target_id?: string;
        actual_amount?: number | null;
      } = {
        target_id: form.target_id,
        department_id: form.department_id.trim(),
        target_year: Number(form.target_year),
        target_quarter: form.target_quarter as "Q1" | "Q2" | "Q3" | "Q4",
        target_amount: Number(form.target_amount),
        actual_amount: form.actual_amount === "" ? null : Number(form.actual_amount),
      };

      const method = payload.target_id ? "PUT" : "POST";
      const res = await fetch(`/api/data?type=targets`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": role,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError("권한이 부족합니다. (403)");
        } else {
          setError(`요청 실패: HTTP ${res.status}`);
        }
        return;
      }

      const data: BasicResponse<SalesTarget> = await res.json();
      if (!data.ok || !data.data) {
        setError(data.error ?? "알 수 없는 오류가 발생했습니다");
        return;
      }
      setSuccess(payload.target_id ? "목표가 수정되었습니다" : "목표가 생성되었습니다");
      onSubmitted(data.data);
    } catch (e) {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-card text-card-foreground border border-border shadow-sm">
      <CardHeader>
        <CardTitle>{initial ? "목표 수정" : "목표 생성"}</CardTitle>
        <CardDescription>
          부서/연도/분기를 지정하고 목표 금액을 입력하세요. {isEditable ? "" : "(읽기 전용)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">부서 ID</label>
            <input
              type="text"
              value={form.department_id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange("department_id", e.target.value)}
              className={cn(
                "w-full rounded-md border border-input bg-background p-2 outline-none",
                "focus:ring-2 focus:ring-primary/40"
              )}
              placeholder="예: D002"
              disabled={!isEditable || submitting}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">연도</label>
            <input
              type="number"
              value={form.target_year}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange("target_year", Number(e.target.value))}
              className={cn(
                "w-full rounded-md border border-input bg-background p-2 outline-none",
                "focus:ring-2 focus:ring-primary/40"
              )}
              min={2000}
              max={2100}
              step={1}
              disabled={!isEditable || submitting}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">분기</label>
            <select
              value={form.target_quarter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange("target_quarter", e.target.value as TargetFormState["target_quarter"])}
              className={cn(
                "w-full rounded-md border border-input bg-background p-2 outline-none",
                "focus:ring-2 focus:ring-primary/40"
              )}
              disabled={!isEditable || submitting}
              required
            >
              <option value="" disabled>
                분기 선택
              </option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">목표 금액(원)</label>
            <input
              type="number"
              value={form.target_amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange("target_amount", e.target.value === "" ? "" : Number(e.target.value))}
              className={cn(
                "w-full rounded-md border border-input bg-background p-2 outline-none",
                "focus:ring-2 focus:ring-primary/40"
              )}
              min={0}
              step={100000}
              placeholder="예: 600000000"
              disabled={!isEditable || submitting}
              required
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm text-muted-foreground">실적 금액(원, 선택)</label>
            <input
              type="number"
              value={form.actual_amount === "" ? "" : form.actual_amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange("actual_amount", e.target.value === "" ? "" : Number(e.target.value))}
              className={cn(
                "w-full rounded-md border border-input bg-background p-2 outline-none",
                "focus:ring-2 focus:ring-primary/40"
              )}
              min={0}
              step={100000}
              placeholder="예: 480000000"
              disabled={!isEditable || submitting}
            />
          </div>

          {error ? (
            <div className="md:col-span-2 text-sm text-destructive">{error}</div>
          ) : null}
          {success ? (
            <div className="md:col-span-2 text-sm text-primary">{success}</div>
          ) : null}

          <div className="md:col-span-2 flex items-center justify-end gap-2">
            {initial ? (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting} className="transition-colors">
                취소
              </Button>
            ) : null}
            <Button type="submit" disabled={!isEditable || submitting} className="transition-colors">
              {submitting ? "저장 중..." : initial ? "수정 저장" : "생성"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ManagerPage(): React.ReactElement {
  const [role, setRole] = useState<UserRole>("viewer");
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    // 복구: 여러 키 시도 (페이지 간 일관성 보장 어려울 때 대비)
    try {
      const stored =
        typeof window !== "undefined"
          ? (localStorage.getItem("user-role") || localStorage.getItem("role") || localStorage.getItem("app:role"))
          : null;
      if (stored === "sales_rep" || stored === "sales_manager" || stored === "admin" || stored === "viewer") {
        setRole(stored);
      }
    } catch {
      // 무시
    } finally {
      setLoadingRole(false);
    }
  }, []);

  const canAccess = role === "sales_manager" || role === "admin";

  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTargets = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/data?type=targets`, {
        headers: { "X-User-Role": role },
      });
      if (!res.ok) {
        setError(`목표 조회 실패: HTTP ${res.status}`);
        setTargets([]);
        return;
      }
      const data: TargetsResponse = await res.json();
      if (!data.ok || !data.data) {
        setError(data.error ?? "데이터를 불러오지 못했습니다");
        setTargets([]);
        return;
      }
      setTargets(data.data);
    } catch {
      setError("네트워크 오류가 발생했습니다");
      setTargets([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (loadingRole) return;
    if (canAccess) {
      // 접근 가능한 역할만 데이터 로드
      void loadTargets();
    }
  }, [canAccess, loadingRole, loadTargets]);

  // 필터 상태
  const distinctYears = useMemo(() => {
    const set = new Set<number>();
    for (const t of targets) set.add(t.target_year);
    return Array.from(set).sort((a, b) => b - a);
  }, [targets]);

  const distinctDepartments = useMemo(() => {
    const set = new Set<string>();
    for (const t of targets) set.add(t.department_id);
    return Array.from(set).sort();
  }, [targets]);

  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [deptFilter, setDeptFilter] = useState<string | "all">("all");
  const [qFilter, setQFilter] = useState<"all" | "Q1" | "Q2" | "Q3" | "Q4">("all");

  const filtered = useMemo(() => {
    return targets.filter((t) => {
      if (yearFilter !== "all" && t.target_year !== yearFilter) return false;
      if (deptFilter !== "all" && t.department_id !== deptFilter) return false;
      if (qFilter !== "all" && t.target_quarter !== qFilter) return false;
      return true;
    });
  }, [targets, yearFilter, deptFilter, qFilter]);

  const [editing, setEditing] = useState<SalesTarget | null>(null);

  const handleSubmitted = useCallback(
    (updated: SalesTarget) => {
      // 낙관적 병합 후 재조회
      setTargets((prev) => {
        const idx = prev.findIndex((p) => p.target_id === updated.target_id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = updated;
          return copy;
        }
        return [updated, ...prev];
      });
      setEditing(null);
      // 정확성 위해 새로고침
      void loadTargets();
    },
    [loadTargets]
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">목표 관리</h1>
          <p className="text-sm text-muted-foreground">분기별 영업 목표를 조회하고 편집합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">역할: {role}</Badge>
          <Link href="/">
            <Button variant="secondary" size="sm" className="transition-colors">대시보드</Button>
          </Link>
        </div>
      </div>

      {loadingRole ? (
        <Card className="bg-card text-card-foreground border border-border">
          <CardContent className="p-6 text-muted-foreground">역할 정보를 불러오는 중...</CardContent>
        </Card>
      ) : !canAccess ? (
        <Card className="bg-card text-card-foreground border border-border">
          <CardHeader>
            <CardTitle>접근 제한</CardTitle>
            <CardDescription>이 페이지는 sales_manager 또는 admin 역할만 접근할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardFooter className="p-6 pt-0">
            <Link href="/">
              <Button className="transition-colors">메인으로 이동</Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="bg-card text-card-foreground border border-border">
            <CardHeader>
              <CardTitle>필터</CardTitle>
              <CardDescription>연도/부서/분기로 목록을 좁혀 보세요.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">연도</label>
                <select
                  value={yearFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setYearFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                  }
                  className={cn(
                    "w-full rounded-md border border-input bg-background p-2 outline-none",
                    "focus:ring-2 focus:ring-primary/40"
                  )}
                >
                  <option value="all">전체</option>
                  {distinctYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">부서</label>
                <select
                  value={deptFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDeptFilter(e.target.value as typeof deptFilter)}
                  className={cn(
                    "w-full rounded-md border border-input bg-background p-2 outline-none",
                    "focus:ring-2 focus:ring-primary/40"
                  )}
                >
                  <option value="all">전체</option>
                  {distinctDepartments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">분기</label>
                <select
                  value={qFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQFilter(e.target.value as typeof qFilter)}
                  className={cn(
                    "w-full rounded-md border border-input bg-background p-2 outline-none",
                    "focus:ring-2 focus:ring-primary/40"
                  )}
                >
                  <option value="all">전체</option>
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </div>

              <div className="flex items-end justify-end gap-2">
                <Button variant="outline" onClick={() => { setYearFilter("all"); setDeptFilter("all"); setQFilter("all"); }} className="transition-colors">
                  초기화
                </Button>
                <Button onClick={() => void loadTargets()} className="transition-colors">새로고침</Button>
              </div>
            </CardContent>
          </Card>

          {/* Targets grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <Card className="bg-card text-card-foreground border border-border">
                <CardContent className="p-6 text-muted-foreground">불러오는 중...</CardContent>
              </Card>
            ) : error ? (
              <Card className="bg-card text-card-foreground border border-border">
                <CardContent className="p-6 text-destructive">{error}</CardContent>
              </Card>
            ) : filtered.length === 0 ? (
              <Card className="bg-card text-card-foreground border border-border">
                <CardContent className="p-6 text-muted-foreground">표시할 목표가 없습니다</CardContent>
              </Card>
            ) : (
              filtered.map((t) => (
                <TargetProgressCard key={t.target_id} target={t} onEdit={(tt) => setEditing(tt)} />
              ))
            )}
          </div>

          {/* Editor */}
          <TargetForm role={role} initial={editing} onCancel={() => setEditing(null)} onSubmitted={handleSubmitted} />
        </div>
      )}
    </div>
  );
}
