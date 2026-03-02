import { NextResponse } from "next/server";
import type { Todo, ApiError } from "@/lib/types";

// In-memory mock database (reset on server restart)
let TODOS: Todo[] = [
  {
    id: "a3f1c9e4-1b2a-4c3d-8f0a-111111111111",
    title: "할 일 예시: 장보기",
    completed: false,
    createdAt: "2024-01-01T10:00:00.000Z",
  },
  {
    id: "b4d2e0f5-2c3b-5d4e-9a1b-222222222222",
    title: "할 일 예시: 이메일 확인",
    completed: true,
    createdAt: "2024-01-02T08:30:00.000Z",
  },
];

function sortByCreatedDesc(items: Todo[]): Todo[] {
  return [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json<ApiError>({ error: message }, { status });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET() {
  try {
    const data = sortByCreatedDesc(TODOS);
    return NextResponse.json<Todo[]>(data, { status: 200 });
  } catch (err) {
    return errorResponse("Failed to fetch todos", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const title = (body as { title?: unknown })?.title;

    if (!isNonEmptyString(title)) {
      return errorResponse("'title' is required", 400);
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Add to the front so latest appears first
    TODOS.unshift(newTodo);

    return NextResponse.json<Todo>(newTodo, { status: 201 });
  } catch (err) {
    return errorResponse("Failed to create todo", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const { id, title, completed } = body as {
      id?: unknown;
      title?: unknown;
      completed?: unknown;
    };

    if (typeof id !== "string" || id.length === 0) {
      return errorResponse("'id' is required", 400);
    }

    const index = TODOS.findIndex((t) => t.id === id);
    if (index === -1) {
      return errorResponse("Not found", 404);
    }

    const current = TODOS[index];

    // Validate optional fields
    let nextTitle = current.title;
    if (title !== undefined) {
      if (!isNonEmptyString(title)) {
        return errorResponse("'title' must be a non-empty string when provided", 400);
      }
      nextTitle = title.trim();
    }

    let nextCompleted = current.completed;
    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return errorResponse("'completed' must be a boolean when provided", 400);
      }
      nextCompleted = completed;
    }

    const updated: Todo = {
      ...current,
      title: nextTitle,
      completed: nextCompleted,
    };

    TODOS[index] = updated;

    return NextResponse.json<Todo>(updated, { status: 200 });
  } catch (err) {
    return errorResponse("Failed to update todo", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const { id } = body as { id?: unknown };

    if (typeof id !== "string" || id.length === 0) {
      return errorResponse("'id' is required", 400);
    }

    const index = TODOS.findIndex((t) => t.id === id);
    if (index === -1) {
      return errorResponse("Not found", 404);
    }

    TODOS.splice(index, 1);

    return NextResponse.json<{ success: true }>({ success: true }, { status: 200 });
  } catch (err) {
    return errorResponse("Failed to delete todo", 500);
  }
}
