import { NextResponse } from "next/server";
import type { Todo } from "../../../lib/types";

// In-memory mock DB (module-scoped)
export let todos: Todo[] = [];
export let idCounter = 1;

export async function GET(_request: Request) {
  try {
    const sorted = todos
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return NextResponse.json({ todos: sorted }, { status: 200 });
  } catch (_e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const titleRaw =
      typeof body === "object" && body !== null
        ? (body as { title?: unknown }).title
        : undefined;

    if (typeof titleRaw !== "string") {
      return NextResponse.json(
        { error: "Title required" },
        { status: 400 }
      );
    }

    const title = titleRaw.trim();
    if (title.length === 0 || title.length > 200) {
      return NextResponse.json(
        { error: "Title required" },
        { status: 400 }
      );
    }

    const todo: Todo = {
      id: String(idCounter++),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    todos.push(todo);

    return NextResponse.json({ todo }, { status: 201 });
  } catch (_e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Default export to satisfy repository rules; not used by Next.js route handlers
export default {};
