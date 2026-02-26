import { NextResponse } from "next/server";
import { todos } from "../route";

// Dynamic Todo handlers: GET one (optional), PATCH (partial update), DELETE (remove)
// Uses the same in-memory store exported from ../route to keep a single source of truth.

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ todo }, { status: 200 });
  } catch (_e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const data = (typeof body === "object" && body !== null ? body : {}) as {
      title?: unknown;
      completed?: unknown;
    };

    const hasTitle = Object.prototype.hasOwnProperty.call(data, "title");
    const hasCompleted = Object.prototype.hasOwnProperty.call(data, "completed");

    if (!hasTitle && !hasCompleted) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    let newTitle: string | undefined;
    if (hasTitle) {
      if (typeof data.title !== "string") {
        return NextResponse.json({ error: "Invalid title" }, { status: 400 });
      }
      newTitle = data.title.trim();
      if (newTitle.length === 0 || newTitle.length > 200) {
        return NextResponse.json({ error: "Invalid title" }, { status: 400 });
      }
    }

    let newCompleted: boolean | undefined;
    if (hasCompleted) {
      if (typeof data.completed !== "boolean") {
        return NextResponse.json({ error: "Invalid completed" }, { status: 400 });
      }
      newCompleted = data.completed;
    }

    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const todo = todos[idx];
    if (typeof newTitle === "string") todo.title = newTitle;
    if (typeof newCompleted === "boolean") todo.completed = newCompleted;

    return NextResponse.json({ todo }, { status: 200 });
  } catch (_e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    todos.splice(idx, 1);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (_e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Default export to satisfy repository rule; not used by Next.js route handlers
export default {};