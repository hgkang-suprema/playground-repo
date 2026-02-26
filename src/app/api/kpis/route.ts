import { NextResponse } from "next/server";
import type { KPI } from "@/lib/types";

/**
 * Mock KPIs API (in-memory)
 * - This route handler simulates a full CRUD backend using a file-level in-memory array.
 * - Data resets whenever the server restarts or the file is reloaded.
 */

let KPIS: KPI[] = [
  {
    id: "kpi-0001-1111-aaaa-0001",
    title: "Total Revenue",
    value: 2543000, // cents => $25,430.00
    trend: 6.4,
    meta: "vs last month",
  },
  {
    id: "kpi-0002-2222-bbbb-0002",
    title: "Orders",
    value: 321, // number of orders
    trend: 2.1,
    meta: "total orders",
  },
  {
    id: "kpi-0003-3333-cccc-0003",
    title: "Avg Order Value",
    value: 7925, // cents => $79.25
    trend: -1.8,
    meta: "per order",
  },
];

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isNonNegativeNumber(v: unknown): v is number {
  return isFiniteNumber(v) && v >= 0;
}

function safeId(): string {
  // Prefer Web Crypto if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any;
  if (g.crypto && typeof g.crypto.randomUUID === "function") {
    return g.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function GET(_request: Request) {
  return NextResponse.json({ kpis: KPIS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, value, trend, meta } = body as {
      title?: unknown;
      value?: unknown;
      trend?: unknown;
      meta?: unknown;
    };

    if (!isNonEmptyString(title)) {
      return NextResponse.json({ error: "Invalid or missing 'title'" }, { status: 400 });
    }
    if (!isNonNegativeNumber(value)) {
      return NextResponse.json({ error: "Invalid or missing 'value'. Must be a non-negative number." }, { status: 400 });
    }
    if (trend !== undefined && !isFiniteNumber(trend)) {
      return NextResponse.json({ error: "Invalid 'trend'. Must be a finite number if provided." }, { status: 400 });
    }
    if (meta !== undefined && typeof meta !== "string") {
      return NextResponse.json({ error: "Invalid 'meta'. Must be a string if provided." }, { status: 400 });
    }

    const newKpi: KPI = {
      id: safeId(),
      title: title.trim(),
      value,
      ...(trend !== undefined ? { trend: Number(trend) } : {}),
      ...(meta !== undefined && meta.toString().trim().length > 0
        ? { meta: meta.toString().trim() }
        : {}),
    };

    KPIS.push(newKpi);
    return NextResponse.json(newKpi, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, value, trend, meta } = body as {
      id?: unknown;
      title?: unknown;
      value?: unknown;
      trend?: unknown;
      meta?: unknown;
    };

    if (typeof id !== "string" || id.length === 0) {
      return NextResponse.json({ error: "Missing or invalid 'id'" }, { status: 400 });
    }

    const idx = KPIS.findIndex((k) => k.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "KPI not found" }, { status: 404 });
    }

    if (title !== undefined && !isNonEmptyString(title)) {
      return NextResponse.json({ error: "Invalid 'title'" }, { status: 400 });
    }
    if (value !== undefined && !isNonNegativeNumber(value)) {
      return NextResponse.json({ error: "Invalid 'value'. Must be a non-negative number." }, { status: 400 });
    }
    if (trend !== undefined && !isFiniteNumber(trend)) {
      return NextResponse.json({ error: "Invalid 'trend'. Must be a finite number." }, { status: 400 });
    }
    if (meta !== undefined && typeof meta !== "string") {
      return NextResponse.json({ error: "Invalid 'meta'. Must be a string." }, { status: 400 });
    }

    const updated: KPI = {
      ...KPIS[idx],
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(value !== undefined ? { value } : {}),
      ...(trend !== undefined ? { trend: Number(trend) } : {}),
      ...(meta !== undefined
        ? meta.toString().trim().length > 0
          ? { meta: meta.toString().trim() }
          : { meta: undefined }
        : {}),
    };

    KPIS[idx] = updated;
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body as { id?: unknown };

    if (typeof id !== "string" || id.length === 0) {
      return NextResponse.json({ error: "Missing or invalid 'id'" }, { status: 400 });
    }

    const idx = KPIS.findIndex((k) => k.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "KPI not found" }, { status: 404 });
    }

    KPIS.splice(idx, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }
}
