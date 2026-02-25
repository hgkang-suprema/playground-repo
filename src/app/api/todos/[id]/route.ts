/* Server Route Handler: /api/todos/[id]
   - Supports PATCH (update) and DELETE for a given todo id
   - Imports shared TODOS and utilities from parent route module
*/

// NOTE: Route handlers run on the server. Do NOT add "use client".

import {
  delay,
  isValidCategory,
  TODOS as SHARED_TODOS,
  type Todo,
  type UpdateTodoBody,
} from "../route";

// Use the shared array if available, otherwise fall back to a local empty array.
let TODOS: Todo[] = Array.isArray(SHARED_TODOS) ? SHARED_TODOS : [];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// The Next.js Route Handler context may provide params either synchronously or as a Promise.
// We declare a small helper type and resolve the params accordingly to satisfy TS and runtime.
type RouteContext = { params: { id: string } | Promise<{ id: string }> };

async function resolveParams(ctx?: RouteContext | undefined) {
  if (!ctx || !ctx.params) return null;
  const p = ctx.params;
  return p instanceof Promise ? await p : p;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await delay(120 + Math.round(Math.random() * 200));

    const resolved = await resolveParams(context);
    const id = resolved?.id;
    if (!id) return jsonResponse({ error: "Missing id param" }, 400);

    const text = await request.text();
    if (!text) return jsonResponse({ error: "Empty body" }, 400);

    let body: Partial<UpdateTodoBody> | null = null;
    try {
      body = JSON.parse(text);
    } catch (e) {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (!body || typeof body !== "object") {
      return jsonResponse({ error: "Invalid body" }, 400);
    }

    const idx = TODOS.findIndex((t) => t.id === id);
    if (idx === -1) return jsonResponse({ error: "Not found" }, 404);

    const existing = TODOS[idx];
    const updated: Todo = { ...existing } as Todo;

    if (typeof body.title === "string") {
      updated.title = body.title.trim();
    }
    if (typeof body.completed === "boolean") {
      updated.completed = body.completed;
    }
    if (Object.prototype.hasOwnProperty.call(body, "category")) {
      const c = (body as any).category;
      if (!isValidCategory(c)) return jsonResponse({ error: "Invalid category" }, 400);
      updated.category = c;
    }

    TODOS[idx] = updated;

    return jsonResponse({ todo: updated }, 200);
  } catch (err) {
    return jsonResponse({ error: "Server error" }, 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await delay(80 + Math.round(Math.random() * 150));

    const resolved = await resolveParams(context);
    const id = resolved?.id;
    if (!id) return jsonResponse({ error: "Missing id param" }, 400);

    const idx = TODOS.findIndex((t) => t.id === id);
    if (idx === -1) return jsonResponse({ error: "Not found" }, 404);

    TODOS.splice(idx, 1);

    // 204 No Content
    return new Response(null, { status: 204 });
  } catch (err) {
    return jsonResponse({ error: "Server error" }, 500);
  }
}

// Default export to satisfy repository rule that every file must end with an export default
export default {};
