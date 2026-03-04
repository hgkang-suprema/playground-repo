/**
 * In-memory mock database for Sales KPI Dashboard.
 * - 외부 DB 금지, 런타임 메모리 전용 (데모/개발용)
 * - 모든 날짜는 ISO 문자열(YYYY-MM-DD), 금액은 숫자(원 단위)
 * - 프론트엔드 스타일 가이드: shadcn/ui 시맨틱 색상 토큰 사용 (bg-background, text-foreground 등). 하드코딩 색상 금지.
 */

// 이 파일은 독립적으로 동작하도록 로컬 타입을 정의합니다.
// 다른 파일이 참조하는 '@/lib/types'에 의존하지 않습니다.

type OrderStatus = "접수" | "진행" | "완료" | "취소";

interface SalesCustomer {
  customer_id: string;
  company_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  grade: string; // 예: 'VIP' | 'A' | 'B'
  region: string; // 예: '서울', '경기' 등
}

interface SalesProduct {
  product_id: string;
  product_name: string;
  category: string; // 예: '하드웨어' | '소프트웨어'
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

interface SalesTarget {
  target_id: string;
  department_id: string;
  target_year: number;
  target_quarter: "Q1" | "Q2" | "Q3" | "Q4";
  target_amount: number;
  actual_amount: number | null;
}

interface HrEmployee {
  employee_id: string;
  name: string;
  email: string;
  department_id: string;
  position_code: string;
  hire_date: string; // YYYY-MM-DD
  status: string; // 예: '재직' 등
  phone: string;
}

// ---------------------------
// Mock Data (In-memory)
// ---------------------------

export const mockCustomers: SalesCustomer[] = [
  {
    customer_id: "C001",
    company_name: "삼성전자",
    contact_name: "홍길동",
    contact_phone: "02-1234-5678",
    contact_email: "hong@samsung.com",
    grade: "VIP",
    region: "서울",
  },
  {
    customer_id: "C002",
    company_name: "LG전자",
    contact_name: "김영수",
    contact_phone: "02-2345-6789",
    contact_email: "kim@lg.com",
    grade: "A",
    region: "서울",
  },
  {
    customer_id: "C003",
    company_name: "현대모비스",
    contact_name: "박지은",
    contact_phone: "031-345-6789",
    contact_email: "park@hyundai.com",
    grade: "A",
    region: "경기",
  },
  {
    customer_id: "C004",
    company_name: "카카오",
    contact_name: "최민수",
    contact_phone: "02-4567-1234",
    contact_email: "choi@kakao.com",
    grade: "B",
    region: "경기",
  },
];

export const mockProducts: SalesProduct[] = [
  {
    product_id: "PRD001",
    product_name: "BioStar 2 라이선스",
    category: "소프트웨어",
    unit_price: 150000,
    stock_qty: 999,
    is_active: true,
  },
  {
    product_id: "PRD002",
    product_name: "지문인식 단말기 A",
    category: "하드웨어",
    unit_price: 85000,
    stock_qty: 320,
    is_active: true,
  },
  {
    product_id: "PRD003",
    product_name: "얼굴인식 단말기 X",
    category: "하드웨어",
    unit_price: 170000,
    stock_qty: 150,
    is_active: true,
  },
  {
    product_id: "PRD004",
    product_name: "출입통제 서버 모듈",
    category: "소프트웨어",
    unit_price: 420000,
    stock_qty: 45,
    is_active: true,
  },
];

export const mockOrders: SalesOrder[] = [
  {
    order_id: "ORD-2024-001",
    customer_id: "C001",
    product_id: "PRD001",
    order_date: "2024-03-15",
    quantity: 100,
    unit_price: 150000,
    total_amount: 100 * 150000,
    status: "완료",
  },
  {
    order_id: "ORD-2024-002",
    customer_id: "C002",
    product_id: "PRD003",
    order_date: "2024-03-16",
    quantity: 50,
    unit_price: 170000,
    total_amount: 50 * 170000,
    status: "진행",
  },
  {
    order_id: "ORD-2024-003",
    customer_id: "C001",
    product_id: "PRD002",
    order_date: "2024-03-17",
    quantity: 200,
    unit_price: 85000,
    total_amount: 200 * 85000,
    status: "접수",
  },
  {
    order_id: "ORD-2024-004",
    customer_id: "C003",
    product_id: "PRD004",
    order_date: "2024-04-05",
    quantity: 12,
    unit_price: 420000,
    total_amount: 12 * 420000,
    status: "완료",
  },
  {
    order_id: "ORD-2024-005",
    customer_id: "C002",
    product_id: "PRD002",
    order_date: "2024-04-21",
    quantity: 80,
    unit_price: 85000,
    total_amount: 80 * 85000,
    status: "취소",
  },
  {
    order_id: "ORD-2024-006",
    customer_id: "C004",
    product_id: "PRD003",
    order_date: "2024-05-02",
    quantity: 40,
    unit_price: 170000,
    total_amount: 40 * 170000,
    status: "진행",
  },
];

export const mockTargets: SalesTarget[] = [
  {
    target_id: "TGT-2024-Q1-D001",
    department_id: "D001",
    target_year: 2024,
    target_quarter: "Q1",
    target_amount: 400_000_000,
    actual_amount: 365_000_000,
  },
  {
    target_id: "TGT-2024-Q2-D001",
    department_id: "D001",
    target_year: 2024,
    target_quarter: "Q2",
    target_amount: 450_000_000,
    actual_amount: null,
  },
  {
    target_id: "TGT-2024-Q1-D002",
    department_id: "D002",
    target_year: 2024,
    target_quarter: "Q1",
    target_amount: 500_000_000,
    actual_amount: 480_000_000,
  },
  {
    target_id: "TGT-2024-Q2-D002",
    department_id: "D002",
    target_year: 2024,
    target_quarter: "Q2",
    target_amount: 600_000_000,
    actual_amount: null,
  },
];

export const mockEmployees: HrEmployee[] = [
  {
    employee_id: "EMP001",
    name: "김철수",
    email: "cskim@company.com",
    department_id: "D001",
    position_code: "P03",
    hire_date: "2019-03-15",
    status: "재직",
    phone: "010-1234-5678",
  },
  {
    employee_id: "EMP002",
    name: "이영희",
    email: "yhlee@company.com",
    department_id: "D002",
    position_code: "P04",
    hire_date: "2017-07-01",
    status: "재직",
    phone: "010-2345-6789",
  },
  {
    employee_id: "EMP003",
    name: "박민수",
    email: "mspark@company.com",
    department_id: "D001",
    position_code: "P02",
    hire_date: "2022-01-10",
    status: "재직",
    phone: "010-3456-7890",
  },
];

// ---------------------------
// Query & Mutation Utilities
// ---------------------------

function within(date: string, start?: string, end?: string): boolean {
  // date, start, end are in YYYY-MM-DD format; lexicographic compare works
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

export function queryOrders(filters?: {
  start?: string;
  end?: string;
  status?: string;
  customer_id?: string;
  product_id?: string;
  order_id?: string;
}): SalesOrder[] {
  const f = filters ?? {};
  const result = mockOrders.filter((o) => {
    if (!within(o.order_date, f.start, f.end)) return false;
    if (f.status && o.status !== f.status) return false;
    if (f.customer_id && o.customer_id !== f.customer_id) return false;
    if (f.product_id && o.product_id !== f.product_id) return false;
    if (f.order_id && o.order_id !== f.order_id) return false;
    return true;
  });
  // 최신순 정렬
  return result.sort((a, b) => (a.order_date > b.order_date ? -1 : a.order_date < b.order_date ? 1 : 0));
}

export function queryTargets(filters?: {
  year?: number;
  department_id?: string;
  quarter?: string;
}): SalesTarget[] {
  const f = filters ?? {};
  const result = mockTargets.filter((t) => {
    if (typeof f.year === "number" && t.target_year !== f.year) return false;
    if (f.department_id && t.department_id !== f.department_id) return false;
    if (f.quarter && t.target_quarter !== f.quarter) return false;
    return true;
  });
  // 정렬: 연도 desc, 분기 asc(Q1~Q4), 부서 asc
  const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 } as const;
  return result.sort((a, b) => {
    if (a.target_year !== b.target_year) return b.target_year - a.target_year;
    const qa = quarterOrder[a.target_quarter as keyof typeof quarterOrder] ?? 0;
    const qb = quarterOrder[b.target_quarter as keyof typeof quarterOrder] ?? 0;
    if (qa !== qb) return qa - qb;
    return a.department_id.localeCompare(b.department_id);
  });
}

export function queryCustomers(filters?: {
  customer_id?: string;
  grade?: string;
  region?: string;
}): SalesCustomer[] {
  const f = filters ?? {};
  const result = mockCustomers.filter((c) => {
    if (f.customer_id && c.customer_id !== f.customer_id) return false;
    if (f.grade && c.grade !== f.grade) return false;
    if (f.region && c.region !== f.region) return false;
    return true;
  });
  return result.sort((a, b) => a.company_name.localeCompare(b.company_name));
}

export function queryProducts(filters?: {
  product_id?: string;
  category?: string;
  is_active?: boolean;
}): SalesProduct[] {
  const f = filters ?? {};
  const result = mockProducts.filter((p) => {
    if (f.product_id && p.product_id !== f.product_id) return false;
    if (f.category && p.category !== f.category) return false;
    if (typeof f.is_active === "boolean" && p.is_active !== f.is_active) return false;
    return true;
  });
  return result.sort((a, b) => a.product_name.localeCompare(b.product_name));
}

export function queryEmployees(filters?: {
  employee_id?: string;
  department_id?: string;
  status?: string;
}): HrEmployee[] {
  const f = filters ?? {};
  const result = mockEmployees.filter((e) => {
    if (f.employee_id && e.employee_id !== f.employee_id) return false;
    if (f.department_id && e.department_id !== f.department_id) return false;
    if (f.status && e.status !== f.status) return false;
    return true;
  });
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export type UpsertTargetPayload = Partial<SalesTarget> & {
  department_id: string;
  target_year: number;
  target_quarter: string; // 'Q1' | 'Q2' | 'Q3' | 'Q4'
  target_amount: number;
};

export function upsertTarget(payload: UpsertTargetPayload): SalesTarget {
  const safeQuarter = payload.target_quarter.toUpperCase();
  const baseId = `TGT-${payload.target_year}-${safeQuarter}-${payload.department_id}`;

  if (payload.target_id) {
    const idx = mockTargets.findIndex((t) => t.target_id === payload.target_id);
    if (idx >= 0) {
      const updated: SalesTarget = {
        target_id: payload.target_id,
        department_id: payload.department_id,
        target_year: payload.target_year,
        target_quarter: safeQuarter as SalesTarget["target_quarter"],
        target_amount: payload.target_amount,
        actual_amount:
          typeof payload.actual_amount === "number" ? payload.actual_amount : mockTargets[idx].actual_amount ?? null,
      };
      mockTargets[idx] = updated;
      return updated;
    }
    // if provided id not found, treat as create with given id
    const created: SalesTarget = {
      target_id: payload.target_id,
      department_id: payload.department_id,
      target_year: payload.target_year,
      target_quarter: safeQuarter as SalesTarget["target_quarter"],
      target_amount: payload.target_amount,
      actual_amount: typeof payload.actual_amount === "number" ? payload.actual_amount : null,
    };
    mockTargets.push(created);
    return created;
  }

  // Generate unique ID if not provided
  let newId = baseId;
  let seq = 1;
  while (mockTargets.some((t) => t.target_id === newId)) {
    seq += 1;
    newId = `${baseId}-${seq}`;
  }

  const created: SalesTarget = {
    target_id: newId,
    department_id: payload.department_id,
    target_year: payload.target_year,
    target_quarter: safeQuarter as SalesTarget["target_quarter"],
    target_amount: payload.target_amount,
    actual_amount: typeof payload.actual_amount === "number" ? payload.actual_amount : null,
  };
  mockTargets.push(created);
  return created;
}

// Default export (optional convenience aggregator)
const MockDB = {
  mockOrders,
  mockTargets,
  mockCustomers,
  mockProducts,
  mockEmployees,
  queryOrders,
  queryTargets,
  queryCustomers,
  queryProducts,
  queryEmployees,
  upsertTarget,
};

export default MockDB;
