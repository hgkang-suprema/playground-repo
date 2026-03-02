"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  DeleteTodoRequest,
  ApiError,
} from "@/lib/types";
import { Loader2, Plus, Save, X, Trash2, Edit3 } from "lucide-react";

interface Props {}

export default function TodoApp({}: Props) {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const [listBusy, setListBusy] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const fetchTodos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/todos", { cache: "no-store" });
        if (!res.ok) {
          const body = (await safeJson(res)) as ApiError | undefined;
          throw new Error(body?.error || "할 일을 불러오지 못했습니다");
        }
        const data = (await res.json()) as Todo[];
        if (mounted) setTodos(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "문제가 발생했습니다");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTodos();
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const addTodo = async (title: string) => {
    setListBusy(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title } as CreateTodoRequest),
      });
      if (!res.ok) {
        const body = (await safeJson(res)) as ApiError | undefined;
        throw new Error(body?.error || "추가에 실패했습니다");
      }
      const created = (await res.json()) as Todo;
      setTodos((prev) => (prev ? [created, ...prev] : [created]));
    } finally {
      setListBusy(false);
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    setBusyIds((b) => ({ ...b, [id]: true }));
    const prev = todos;
    setTodos((cur) => (cur ? cur.map((t) => (t.id === id ? { ...t, completed } : t)) : cur));
    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed } as UpdateTodoRequest),
      });
      if (!res.ok) {
        const body = (await safeJson(res)) as ApiError | undefined;
        throw new Error(body?.error || "업데이트 실패");
      }
      // no-op, state already updated
    } catch (e) {
      // revert
      setTodos(prev || null);
      setError(e instanceof Error ? e.message : "업데이트 중 오류");
    } finally {
      setBusyIds((b) => {
        const { [id]: _omit, ...rest } = b;
        return rest;
      });
    }
  };

  const editTitle = async (id: string, title: string) => {
    setBusyIds((b) => ({ ...b, [id]: true }));
    const snapshot = todos;
    setTodos((cur) => (cur ? cur.map((t) => (t.id === id ? { ...t, title } : t)) : cur));
    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title } as UpdateTodoRequest),
      });
      if (!res.ok) {
        const body = (await safeJson(res)) as ApiError | undefined;
        throw new Error(body?.error || "제목 수정 실패");
      }
    } catch (e) {
      setTodos(snapshot || null);
      setError(e instanceof Error ? e.message : "제목 수정 중 오류");
    } finally {
      setBusyIds((b) => {
        const { [id]: _omit, ...rest } = b;
        return rest;
      });
    }
  };

  const deleteTodo = async (id: string) => {
    setBusyIds((b) => ({ ...b, [id]: true }));
    const snapshot = todos;
    setTodos((cur) => (cur ? cur.filter((t) => t.id !== id) : cur));
    try {
      const res = await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id } as DeleteTodoRequest),
      });
      if (!res.ok) {
        const body = (await safeJson(res)) as ApiError | undefined;
        throw new Error(body?.error || "삭제 실패");
      }
    } catch (e) {
      setTodos(snapshot || null);
      setError(e instanceof Error ? e.message : "삭제 중 오류");
    } finally {
      setBusyIds((b) => {
        const { [id]: _omit, ...rest } = b;
        return rest;
      });
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-zinc-700 dark:text-zinc-300">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              className="transition-all active:scale-95"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              재시도
            </Button>
          </div>
        </div>
      )}

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/100 backdrop-blur-sm shadow-lg dark:shadow-none">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">할 일 추가</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <NewTodoForm onAdd={addTodo} pending={listBusy} />
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/100 backdrop-blur-sm shadow-lg dark:shadow-none">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">내 할 일</CardTitle>
            {Array.isArray(todos) && todos.length > 0 && (
              <Badge className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:opacity-90 transition-all" variant="default">
                {todos.filter((t) => t.completed).length}/{todos.length} 완료
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <SkeletonList />
          ) : !todos || todos.length === 0 ? (
            <EmptyState />
          ) : (
            <TodoList
              todos={todos}
              busyIds={busyIds}
              onToggle={toggleComplete}
              onDelete={deleteTodo}
              onEdit={editTitle}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Utils
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

// New Todo Form
interface NewTodoFormProps {
  onAdd: (title: string) => Promise<void>;
  pending?: boolean;
}

function NewTodoForm({ onAdd, pending = false }: NewTodoFormProps) {
  const [title, setTitle] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || pending) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setLocalError("할 일 내용을 입력하세요");
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setTitle("");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "추가 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
      <div className="flex-1">
        <Input
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="예: 장보기, 이메일 답장 보내기"
          aria-label="새 할 일 입력"
          className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
        />
        {localError && (
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{localError}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={submitting || pending}
        className={cn(
          "transition-all active:scale-95",
          "bg-zinc-900 text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-950"
        )}
      >
        {submitting || pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-white dark:text-zinc-950" />
            추가 중
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> 추가
          </span>
        )}
      </Button>
    </form>
  );
}

// Todo List
interface TodoListProps {
  todos: Todo[];
  busyIds: Record<string, boolean>;
  onToggle: (id: string, completed: boolean) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onEdit: (id: string, title: string) => Promise<void> | void;
}

function TodoList({ todos, busyIds, onToggle, onDelete, onEdit }: TodoListProps) {
  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {todos.map((todo) => (
          <motion.li
            key={todo.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <TodoItem
              todo={todo}
              busy={!!busyIds[todo.id]}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

// Single Todo Item
interface TodoItemProps {
  todo: Todo;
  busy: boolean;
  onToggle: (id: string, completed: boolean) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onEdit: (id: string, title: string) => Promise<void> | void;
}

function TodoItem({ todo, busy, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [localTitle, setLocalTitle] = useState<string>(todo.title);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setLocalTitle(todo.title);
  }, [todo.title]);

  const handleSave = async () => {
    const trimmed = localTitle.trim();
    if (!trimmed || trimmed === todo.title) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onEdit(todo.id, trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setLocalTitle(todo.title);
      setEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full rounded-xl border bg-white shadow-sm transition-all",
        "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700",
        "dark:bg-zinc-950/100"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <label className="mt-1 inline-flex items-center">
          <input
            type="checkbox"
            checked={todo.completed}
            disabled={busy || saving}
            onChange={(e) => onToggle(todo.id, e.target.checked)}
            className={cn(
              "h-4 w-4 rounded border",
              "border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600",
              "dark:border-zinc-700 bg-white dark:bg-zinc-900"
            )}
            aria-label={`Complete todo: ${todo.title}`}
          />
        </label>

        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={localTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalTitle(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              <Button
                size="icon"
                variant="secondary"
                onClick={() => void handleSave()}
                disabled={saving}
                className="transition-all active:scale-95"
                aria-label={`Save todo: ${todo.title}`}
                title="저장"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-900 dark:text-zinc-950" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setLocalTitle(todo.title);
                  setEditing(false);
                }}
                className="transition-all active:scale-95"
                aria-label={`Cancel edit: ${todo.title}`}
                title="취소"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="flex flex-wrap items-center gap-2"
              onDoubleClick={() => setEditing(true)}
            >
              <p
                className={cn(
                  "text-sm text-zinc-900 dark:text-zinc-100",
                  todo.completed && "line-through text-zinc-500 dark:text-zinc-400"
                )}
              >
                {todo.title}
              </p>
              {todo.completed && (
                <Badge
                  variant="secondary"
                  className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900"
                >
                  완료
                </Badge>
              )}
            </div>
          )}
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {new Date(todo.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {!editing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(true)}
              disabled={busy}
              className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all active:scale-95"
              aria-label={`Edit todo: ${todo.title}`}
              title="편집"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(todo.id)}
            disabled={busy || saving}
            className="transition-all active:scale-95"
            aria-label={`Delete todo: ${todo.title}`}
            title="삭제"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function SkeletonList() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-4 flex-1 rounded bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-10 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="mb-3 h-8 w-8 text-zinc-500 dark:text-zinc-400"
        aria-hidden="true"
      >
        <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="4" width="18" height="16" rx="2" className="opacity-40" />
      </svg>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">아직 등록된 할 일이 없습니다.</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">상단 입력창에서 첫 번째 할 일을 추가해보세요.</p>
    </div>
  );
}
