/* Server Route Handler: /api/todos
   - Provides a simple in-memory TODOS array shared with child route ([id]/route.ts)
   - Exports helper utilities and types so child module can import them directly
*/

// NOTE: Route handlers run on the server. Do NOT add "use client".

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  category?: string | null;
  createdAt: string; // ISO
};

export type CreateTodoBody = {
  title: string;
  category?: string | null;
};

export type UpdateTodoBody = Partial<{
  title: string;
  completed: boolean;
  category: string | null;
}>;

// Small helper: simulate latency for a more realistic demo
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simple category validator (adjust rules as needed)
export function isValidCategory(input: unknown): boolean {
  if (input === null) return true;
  return typeof input === "string" && input.trim().length <= 100;
}

// Shared in-memory TODOS store. This lives in module scope so child route ([id])
// can import and modify it during runtime for a full-stack mockup experience.
export const TODOS: Todo[] = [
  {
    id: "t1",
    title: "Welcome — try adding, updating or deleting",
    completed: false,
    category: "general",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "This is a sample completed todo",
    completed: true,
    category: "done",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET() {
  // Return all todos with a tiny delay to simulate network/server work
  await delay(120 + Math.round(Math.random() * 150));
  return jsonResponse({ todos: TODOS }, 200);
}

export async function POST(request: Request) {
  try {
    await delay(150 + Math.round(Math.random() * 200));

    const text = await request.text();
    if (!text) return jsonResponse({ error: "Empty body" }, 400);

    let body: unknown = null;
    try {
      body = JSON.parse(text);
    } catch (e) {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (!body || typeof body !== "object") return jsonResponse({ error: "Invalid body" }, 400);

    const b = body as CreateTodoBody;
    if (!b.title || typeof b.title !== "string" || !b.title.trim()) {
      return jsonResponse({ error: "Title is required" }, 400);
    }

    if (b.category !== undefined && !isValidCategory(b.category)) {
      return jsonResponse({ error: "Invalid category" }, 400);
    }

    const newTodo: Todo = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
      title: b.title.trim(),
      completed: false,
      category: b.category ?? null,
      createdAt: new Date().toISOString(),
    };

    TODOS.unshift(newTodo);

    return jsonResponse({ todo: newTodo }, 201);
  } catch (err) {
    return jsonResponse({ error: "Server error" }, 500);
  }
}

// Default export to satisfy repository rule that every file must end with an export default
// (Does not affect Next.js route handler behavior)
export default {};
