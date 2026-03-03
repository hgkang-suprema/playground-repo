import { NextResponse } from "next/server";
import { RevenueMonth, KPI } from "@/lib/types";

// In-memory mock data (persisted for the lifetime of the server process)
// Latest year sample (12 months) so initial GET renders charts.
const BASE_YEAR = 2026;

function isoDate(year: number, month: number, day: number): string {
  const d = new Date(Date.UTC(year, month - 1, day, 9, 0, 0));
  return d.toISOString();
}

let revenues: RevenueMonth[] = [
  { id: `${BASE_YEAR}-01`, year: BASE_YEAR, month: 1, revenue: 12500, createdAt: isoDate(BASE_YEAR, 1, 10) },
  { id: `${BASE_YEAR}-02`, year: BASE_YEAR, month: 2, revenue: 13800, createdAt: isoDate(BASE_YEAR, 2, 8) },
  { id: `${BASE_YEAR}-03`, year: BASE_YEAR, month: 3, revenue: 14150, createdAt: isoDate(BASE_YEAR, 3, 9) },
  { id: `${BASE_YEAR}-04`, year: BASE_YEAR, month: 4, revenue: 16800, createdAt: isoDate(BASE_YEAR, 4, 10) },
  { id: `${BASE_YEAR}-05`, year: BASE_YEAR, month: 5, revenue: 15800, createdAt: isoDate(BASE_YEAR, 5, 11) },
  { id: `${BASE_YEAR}-06`, year: BASE_YEAR, month: 6, revenue: 17250, createdAt: isoDate(BASE_YEAR, 6, 10) },
  { id: `${BASE_YEAR}-07`, year: BASE_YEAR, month: 7, revenue: 18500, createdAt: isoDate(BASE_YEAR, 7, 12) },
  { id: `${BASE_YEAR}-08`, year: BASE_YEAR, month: 8, revenue: 19000, createdAt: isoDate(BASE_YEAR, 8, 9) },
  { id: `${BASE_YEAR}-09`, year: BASE_YEAR, month: 9, revenue: 20500, createdAt: isoDate(BASE_YEAR, 9, 10) },
  { id: `${BASE_YEAR}-10`, year: BASE_YEAR, month: 10, revenue: 19800, createdAt: isoDate(BASE_YEAR, 10, 11) },
  { id: `${BASE_YEAR}-11`, year: BASE_YEAR, month: 11, revenue: 21200, createdAt: isoDate(BASE_YEAR, 11, 10) },
  { id: `${BASE_YEAR}-12`, year: BASE_YEAR, month: 12, revenue: 23000, createdAt: isoDate(BASE_YEAR, 12, 12) }
];

function latestYear(): number | null {
  if (revenues.length === 0) return null;
  return revenues.reduce((acc, r) => (r.year > acc ? r.year : acc), revenues[0].year);
}

function sortByMonthAsc(a: RevenueMonth, b: RevenueMonth): number {
  return a.month - b.month;
}

function computeKPI(yearData: RevenueMonth[]): KPI {
  if (!yearData || yearData.length === 0) {
    return { mrr: 0, momGrowth: 0, ytdRevenue: 0, bestMonth: null };
  }

  const sorted = [...yearData].sort(sortByMonthAsc);
  const latest = sorted[sorted.length - 1];
  const prev = sorted.find((m) => m.month === latest.month - 1) || null;

  const mrr = latest.revenue;
  const ytdRevenue = sorted
    .filter((m) => m.month <= latest.month)
    .reduce((sum, m) => sum + m.revenue, 0);

  let momGrowth = 0;
  if (prev && prev.revenue > 0) {
    momGrowth = ((latest.revenue - prev.revenue) / prev.revenue) * 100;
  } else {
    momGrowth = 0;
  }

  let bestMonth: RevenueMonth | null = null;
  for (const item of sorted) {
    if (!bestMonth || item.revenue > bestMonth.revenue) {
      bestMonth = item;
    }
  }

  return { mrr, momGrowth, ytdRevenue, bestMonth };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const yearParam = url.searchParams.get("year");
    const parsedYear = yearParam ? Number.parseInt(yearParam, 10) : NaN;

    const defaultYear = latestYear();
    const targetYear = Number.isFinite(parsedYear) ? parsedYear : defaultYear;

    const filtered = revenues
      .filter((r) => (targetYear != null ? r.year === targetYear : true))
      .sort(sortByMonthAsc);

    const kpi = computeKPI(filtered);

    return NextResponse.json({ data: filtered, kpi });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as {
      year?: unknown;
      month?: unknown;
      revenue?: unknown;
    } | null;

    if (!body || typeof body.year !== "number" || typeof body.month !== "number" || typeof body.revenue !== "number") {
      return NextResponse.json({ error: "Invalid payload. Expect { year:number, month:number, revenue:number }" }, { status: 400 });
    }

    const { year, month, revenue } = body;

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Month must be an integer between 1 and 12" }, { status: 400 });
    }
    if (!Number.isFinite(revenue) || revenue < 0) {
      return NextResponse.json({ error: "Revenue must be a non-negative number" }, { status: 400 });
    }

    const id = `${year}-${String(month).padStart(2, "0")}`;
    const exists = revenues.some((r) => r.id === id);
    if (exists) {
      return NextResponse.json({ error: "Revenue for this year-month already exists" }, { status: 409 });
    }

    const newItem: RevenueMonth = {
      id,
      year,
      month,
      revenue,
      createdAt: new Date().toISOString()
    };

    revenues.push(newItem);

    return NextResponse.json({ data: newItem }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create revenue item" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null) as {
      id?: unknown;
      revenue?: unknown;
    } | null;

    if (!body || typeof body.id !== "string") {
      return NextResponse.json({ error: "Invalid payload. Expect { id:string, revenue:number }" }, { status: 400 });
    }

    const { id, revenue } = body;

    if (typeof revenue !== "number" || !Number.isFinite(revenue) || revenue < 0) {
      return NextResponse.json({ error: "Revenue must be a non-negative number" }, { status: 400 });
    }

    const idx = revenues.findIndex((r) => r.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Revenue item not found" }, { status: 404 });
    }

    revenues[idx] = { ...revenues[idx], revenue };

    return NextResponse.json({ data: revenues[idx] });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update revenue item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { id?: unknown } | null;

    if (!body || typeof body.id !== "string") {
      return NextResponse.json({ error: "Invalid payload. Expect { id:string }" }, { status: 400 });
    }

    const idx = revenues.findIndex((r) => r.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ error: "Revenue item not found" }, { status: 404 });
    }

    revenues.splice(idx, 1);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete revenue item" }, { status: 500 });
  }
}
