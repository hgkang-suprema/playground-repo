import { NextResponse } from "next/server";
import type { Sale } from "@/lib/types";

/**
 * Mock Sales API (in-memory)
 * - This route handler simulates a full CRUD backend using a file-level in-memory array.
 * - Data resets whenever the server restarts or the file is reloaded.
 */

// Initial sample data: spread over the last several months
let SALES: Sale[] = [
  { id: "a1d4f7b8-1111-4c3a-9a1f-000000000001", date: "2025-09-05", amount: 125000 },
  { id: "a1d4f7b8-1111-4c3a-9a1f-000000000002", date: "2025-09-18", amount: 89000 },
  { id: "b2c5e8d9-2222-4d3b-8b2f-000000000003", date: "2025-10-02", amount: 430000 },
  { id: "b2c5e8d9-2222-4d3b-8b2f-000000000004", date: "2025-10-21", amount: 76000 },
  { id: "c3e6f9a0-3333-4e3c-7c3f-000000000005", date: "2025-11-11", amount: 210000 },
  { id: "c3e6f9a0-3333-4e3c-7c3f-000000000006", date: "2025-12-30", amount: 98000 },
  { id: "d4f7a1b2-4444-4f3d-6d4f-000000000007", date: "2026-01-09", amount: 305000 },
  { id: "d4f7a1b2-4444-4f3d-6d4f-000000000008", date: "2026-01-27", amount: 120000 },
  { id: "e5a8b2c3-5555-413e-5e5f-000000000009", date: "2026-02-03", amount: 145000 },
  { id: "e5a8b2c3-5555-413e-5e5f-00000000000a", date: "2026-02-20", amount: 225000 },
];

function isValidISODate(date: unknown): date is string {
  if (typeof date !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

function isValidAmount(amount: unknown): amount is number {
  return typeof amount === "number" && Number.isFinite(amount) && amount >= 0;
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
  return NextResponse.json({ sales: SALES });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, amount } = body as { date?: unknown; amount?: unknown };

    if (!isValidISODate(date)) {
      return NextResponse.json({ error: "Invalid or missing 'date'. Expected format: YYYY-MM-DD" }, { status: 400 });
    }
    if (!isValidAmount(amount)) {
      return NextResponse.json({ error: "Invalid or missing 'amount'. Must be a non-negative number (cents)." }, { status: 400 });
    }

    const newSale: Sale = { id: safeId(), date, amount };
    SALES.push(newSale);

    return NextResponse.json(newSale, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, date, amount } = body as { id?: unknown; date?: unknown; amount?: unknown };

    if (typeof id !== "string" || id.length === 0) {
      return NextResponse.json({ error: "Missing or invalid 'id'" }, { status: 400 });
    }

    const idx = SALES.findIndex((s) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    if (date !== undefined && !isValidISODate(date)) {
      return NextResponse.json({ error: "Invalid 'date'. Expected format: YYYY-MM-DD" }, { status: 400 });
    }
    if (amount !== undefined && !isValidAmount(amount)) {
      return NextResponse.json({ error: "Invalid 'amount'. Must be a non-negative number (cents)." }, { status: 400 });
    }

    const updated: Sale = {
      ...SALES[idx],
      ...(date !== undefined ? { date } : {}),
      ...(amount !== undefined ? { amount } : {}),
    };
    SALES[idx] = updated;

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

    const idx = SALES.findIndex((s) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    SALES.splice(idx, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }
}
