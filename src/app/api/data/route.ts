import { NextResponse } from "next/server";
import {
  queryOrders,
  queryTargets,
  upsertTarget,
  queryCustomers,
  queryProducts,
  queryEmployees,
  mockTargets,
} from "@/lib/mockData";

// Local API response type (to avoid missing exports from '@/lib/types')
type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

// Role type used for lightweight RBAC via header
type UserRole = "viewer" | "sales_rep" | "sales_manager" | "admin";

// Quarter literal type aligned with mockData
type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

function isQuarter(value: string | null): value is Quarter {
  return value === "Q1" || value === "Q2" || value === "Q3" || value === "Q4";
}

function getRole(req: Request): UserRole {
  const raw = req.headers.get("X-User-Role");
  if (raw === "sales_rep" || raw === "sales_manager" || raw === "admin" || raw === "viewer") {
    return raw;
  }
  // Default to viewer when header missing/invalid
  return "viewer";
}

function errorJson(message: string, status = 400): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function okJson<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return undefined;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    switch (type) {
      case "orders": {
        const filters: {
          start?: string;
          end?: string;
          status?: string;
          customer_id?: string;
          product_id?: string;
          order_id?: string;
        } = {};
        const start = url.searchParams.get("start");
        const end = url.searchParams.get("end");
        const status = url.searchParams.get("status");
        const customer_id = url.searchParams.get("customer_id");
        const product_id = url.searchParams.get("product_id");
        const order_id = url.searchParams.get("order_id");
        if (start) filters.start = start;
        if (end) filters.end = end;
        if (status) filters.status = status;
        if (customer_id) filters.customer_id = customer_id;
        if (product_id) filters.product_id = product_id;
        if (order_id) filters.order_id = order_id;
        const data = queryOrders(filters);
        return okJson(data);
      }
      case "targets": {
        const filters: { year?: number; department_id?: string; quarter?: Quarter } = {};
        const yearStr = url.searchParams.get("year");
        if (yearStr) {
          const n = Number(yearStr);
          if (!Number.isNaN(n)) filters.year = n;
        }
        const department_id = url.searchParams.get("department_id");
        if (department_id) filters.department_id = department_id;
        const quarter = url.searchParams.get("quarter");
        if (isQuarter(quarter)) filters.quarter = quarter;
        const data = queryTargets(filters);
        return okJson(data);
      }
      case "customers": {
        const filters: { customer_id?: string; grade?: string; region?: string } = {};
        const customer_id = url.searchParams.get("customer_id");
        const grade = url.searchParams.get("grade");
        const region = url.searchParams.get("region");
        if (customer_id) filters.customer_id = customer_id;
        if (grade) filters.grade = grade;
        if (region) filters.region = region;
        const data = queryCustomers(filters);
        return okJson(data);
      }
      case "products": {
        const filters: { product_id?: string; category?: string; is_active?: boolean } = {};
        const product_id = url.searchParams.get("product_id");
        const category = url.searchParams.get("category");
        const is_active_raw = url.searchParams.get("is_active");
        if (product_id) filters.product_id = product_id;
        if (category) filters.category = category;
        const is_active = parseBoolean(is_active_raw);
        if (typeof is_active !== "undefined") filters.is_active = is_active;
        const data = queryProducts(filters);
        return okJson(data);
      }
      case "employees": {
        const filters: { employee_id?: string; department_id?: string; status?: string } = {};
        const employee_id = url.searchParams.get("employee_id");
        const department_id = url.searchParams.get("department_id");
        const status = url.searchParams.get("status");
        if (employee_id) filters.employee_id = employee_id;
        if (department_id) filters.department_id = department_id;
        if (status) filters.status = status;
        const data = queryEmployees(filters);
        return okJson(data);
      }
      case "auth": {
        // Simple helper endpoint to introspect current role
        const role = getRole(request);
        return okJson<{ role: UserRole }>({ role });
      }
      default: {
        return errorJson("Invalid or missing 'type' query parameter", 400);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return errorJson(message, 500);
  }
}

// Body type for target upsert operations
type TargetUpsertBody = {
  target_id?: string;
  department_id?: string;
  target_year?: number;
  target_quarter?: string | Quarter;
  target_amount?: number;
  actual_amount?: number | null;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const role = getRole(request);
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (type === "targets") {
      if (!(role === "sales_manager" || role === "admin")) {
        return errorJson("권한 부족: targets 생성은 sales_manager 또는 admin만 가능합니다.", 403);
      }
      const body = (await request.json()) as TargetUpsertBody;

      if (!body || !body.department_id || body.target_year == null || !body.target_quarter || body.target_amount == null) {
        return errorJson("잘못된 요청 본문: department_id, target_year, target_quarter, target_amount는 필수입니다.", 400);
      }

      const quarter: Quarter | undefined = isQuarter(String(body.target_quarter))
        ? (String(body.target_quarter) as Quarter)
        : undefined;
      if (!quarter) {
        return errorJson("잘못된 요청 본문: target_quarter는 Q1|Q2|Q3|Q4 중 하나여야 합니다.", 400);
      }

      const updated = upsertTarget({
        target_id: body.target_id, // allow explicit id or let upsert generate one
        department_id: body.department_id,
        target_year: Number(body.target_year),
        target_quarter: quarter,
        target_amount: Number(body.target_amount),
        actual_amount: body.actual_amount == null ? null : Number(body.actual_amount),
      });

      return okJson(updated, 201);
    }

    return errorJson("지원하지 않는 리소스 type 입니다 (POST).", 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return errorJson(message, 500);
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const role = getRole(request);
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (type === "targets") {
      if (!(role === "sales_manager" || role === "admin")) {
        return errorJson("권한 부족: targets 수정은 sales_manager 또는 admin만 가능합니다.", 403);
      }

      const body = (await request.json()) as TargetUpsertBody;

      if (!body || !body.target_id) {
        return errorJson("잘못된 요청 본문: target_id는 필수입니다.", 400);
      }

      const existing = mockTargets.find((t) => t.target_id === body.target_id);

      // Determine quarter
      let target_quarter: Quarter | undefined = undefined;
      if (isQuarter(typeof body.target_quarter === "string" ? body.target_quarter : null)) {
        target_quarter = body.target_quarter as Quarter;
      } else if (existing) {
        target_quarter = existing.target_quarter;
      }

      // Determine other required fields (fallback to existing when possible)
      const department_id = body.department_id ?? existing?.department_id;
      const target_year = body.target_year ?? existing?.target_year;
      const target_amount = body.target_amount ?? existing?.target_amount;

      if (!department_id || target_year == null || !target_quarter || target_amount == null) {
        return errorJson(
          "잘못된 요청 본문: department_id, target_year, target_quarter, target_amount가 누락되었거나 대상이 존재하지 않습니다.",
          400
        );
      }

      const updated = upsertTarget({
        target_id: body.target_id,
        department_id,
        target_year,
        target_quarter,
        target_amount,
        actual_amount: body.actual_amount == null ? null : Number(body.actual_amount),
      });

      return okJson(updated, 200);
    }

    return errorJson("지원하지 않는 리소스 type 입니다 (PUT).", 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return errorJson(message, 500);
  }
}

// Optionally provide a method stub for DELETE to extend later
export async function DELETE(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  // Not implemented in this demo. Kept for future extensibility.
  return errorJson(`삭제 미구현: type=${type ?? "(none)"}`, 405);
}
