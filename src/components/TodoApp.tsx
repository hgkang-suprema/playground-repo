"use client";

import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import type { Todo, TodosResponse, ErrorResponse, TodoResponse } from "../lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, Plus, Trash2, Check, X } from "lucide-react";

// -----------------------------
// Header
// -----------------------------
interface HeaderProps {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  count: number;
}
function Header({ theme, setTheme, count }: HeaderProps) {
  const isDark = theme === "dark";
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-3xl border-b border-white/50 bg-white/60 px-6 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/60">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-sky-500 text-white shadow-lg">
          <span className="text-lg font-bold">T</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Todo</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{count} task{count === 1 ? "" : "s"}</p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Toggle theme"
        aria-pressed={isDark}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="group inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-neutral-700 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-200"
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-300 transition-transform group-active:rotate-12" />
        ) : (
          <Moon className="h-4 w-4 text-sky-500 transition-transform group-active:rotate-12" />
        )}
        <span className="hidden sm:inline">{isDark ? "Light" : "Dark"} mode</span>
      </button>
    </header>
  );
}

// -----------------------------
// TodoForm
// -----------------------------
interface TodoFormProps {
  onAdd: (title: string) => Promise<void>;
  loading: boolean;
}
interface TodoFormHandle {
  focus: () => void;
}
const TodoForm = forwardRef<TodoFormHandle, TodoFormProps>(function TodoForm(
  { onAdd, loading }: TodoFormProps,
  ref
) {
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const value = title.trim();
    if (value.length === 0) {
      setError("Please enter a task title.");
      return;
    }
    if (value.length > 200) {
      setError("Title must be 200 characters or fewer.");
      return;
    }
    try {
      await onAdd(value);
      setTitle("");
      inputRef.current?.focus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add task.";
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/60 p-3 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-white/10 dark:bg-neutral-900/60">
      <label htmlFor="todo-input" className="sr-only">
        Add a task
      </label>
      <input
        id="todo-input"
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        placeholder="Add a new task and press Enter..."
        className="flex-1 rounded-xl bg-white/0 px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:outline-none focus:ring-0 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        disabled={loading}
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <Plus className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Add</span>
      </button>
      {error && (
        <div className="ml-2 rounded-lg border border-rose-300/50 bg-rose-50/70 px-2 py-1 text-xs text-rose-600 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-300">
          {error}
        </div>
      )}
    </form>
  );
});

// -----------------------------
// ErrorBanner
// -----------------------------
interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}
function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-300/50 bg-rose-50/70 px-4 py-3 text-rose-700 shadow-sm dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-200">
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-rose-400/40 px-3 py-1 text-xs text-rose-700 transition-all hover:scale-[1.02] hover:bg-rose-100/60 dark:border-rose-300/30 dark:text-rose-200 dark:hover:bg-rose-900/50"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// -----------------------------
// EmptyState
// -----------------------------
interface EmptyStateProps {
  onCreateFocus?: () => void;
}
function EmptyState({ onCreateFocus }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300/70 bg-white/50 px-6 py-12 text-center shadow-inner dark:border-neutral-700/60 dark:bg-neutral-900/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-sky-500 text-white shadow-md">
        <Plus className="h-6 w-6" />
      </div>
      <h3 className="mt-1 text-base font-semibold text-neutral-900 dark:text-neutral-100">No tasks yet</h3>
      <p className="max-w-sm text-sm text-neutral-600 dark:text-neutral-400">Add your first todo to get started. Keep it short and action-oriented.</p>
      <button
        type="button"
        onClick={onCreateFocus}
        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-4 py-2 text-sm text-neutral-700 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-200"
      >
        <Plus className="h-4 w-4" />
        Add a task
      </button>
    </div>
  );
}

// -----------------------------
// SkeletonList
// -----------------------------
interface SkeletonListProps {
  rows?: number;
}
function SkeletonList({ rows = 5 }: SkeletonListProps) {
  const items = useMemo(() => Array.from({ length: rows }), [rows]);
  return (
    <ul className="flex flex-col gap-2">
      {items.map((_, i) => (
        <li
          key={i}
          className="h-14 animate-pulse rounded-2xl border border-white/50 bg-white/60 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/60"
        />
      ))}
    </ul>
  );
}

// -----------------------------
// TodoItem
// -----------------------------
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, next: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (id: string, title: string) => Promise<void>;
}
function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>(todo.title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setTempTitle(todo.title);
    }
  };

  const commitEdit = async () => {
    const next = tempTitle.trim();
    if (!onEdit) {
      setIsEditing(false);
      return;
    }
    if (next.length === 0 || next.length > 200 || next === todo.title) {
      setIsEditing(false);
      setTempTitle(todo.title);
      return;
    }
    await onEdit(todo.id, next);
    setIsEditing(false);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-white/10 dark:bg-neutral-900/60"
    >
      <div className="flex flex-1 items-center gap-3">
        <input
          id={`chk-${todo.id}`}
          type="checkbox"
          checked={todo.completed}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onToggle(todo.id, e.target.checked)}
          className="h-5 w-5 cursor-pointer accent-fuchsia-500"
        />
        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              ref={inputRef}
              value={tempTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitEdit}
              className="flex-1 rounded-lg border border-transparent bg-white/50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300/40 dark:bg-neutral-800/60 dark:text-neutral-100 dark:focus:border-fuchsia-500"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={commitEdit}
              aria-label="Save"
              className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-2 text-emerald-600 transition-all hover:scale-105 hover:bg-emerald-500/20 dark:border-emerald-400/20 dark:text-emerald-300"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setIsEditing(false);
                setTempTitle(todo.title);
              }}
              aria-label="Cancel"
              className="rounded-lg border border-neutral-400/40 bg-neutral-500/10 p-2 text-neutral-600 transition-all hover:scale-105 hover:bg-neutral-500/20 dark:border-neutral-400/20 dark:text-neutral-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor={`chk-${todo.id}`}
            onDoubleClick={() => setIsEditing(true)}
            className={`flex-1 cursor-text select-text text-sm transition-colors ${
              todo.completed
                ? "text-neutral-400 line-through dark:text-neutral-500"
                : "text-neutral-800 dark:text-neutral-100"
            }`}
          >
            {todo.title}
          </label>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg border border-white/60 bg-white/80 px-3 py-1 text-xs text-neutral-700 shadow-sm transition-all hover:scale-105 hover:shadow-md dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-300"
          >
            Edit
          </button>
        )}
        <button
          type="button"
          aria-label="Delete task"
          onClick={async () => {
            const ok = window.confirm("Delete this task?");
            if (!ok) return;
            await onDelete(todo.id);
          }}
          className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-2 text-rose-600 transition-all hover:scale-105 hover:bg-rose-500/20 dark:border-rose-400/20 dark:text-rose-300"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.li>
  );
}

// -----------------------------
// TodoList
// -----------------------------
interface TodoListProps {
  onCountChange?: (count: number) => void;
  onRequestAddFocus?: () => void;
}
interface TodoListHandle {
  refresh: () => Promise<void>;
}
const TodoList = forwardRef<TodoListHandle, TodoListProps>(function TodoList(
  { onCountChange, onRequestAddFocus }: TodoListProps,
  ref
) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/todos", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load todos");
      }
      const data = (await res.json()) as TodosResponse;
      setTodos(data.todos);
      onCountChange?.(data.todos.length);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load todos";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [onCountChange]);

  useImperativeHandle(ref, () => ({ refresh: fetchTodos }), [fetchTodos]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const optimisticUpdate = (updater: (prev: Todo[]) => Todo[]) => {
    setTodos((prev) => {
      const next = updater(prev);
      onCountChange?.(next.length);
      return next;
    });
  };

  const onToggle = async (id: string, next: boolean) => {
    const prev = todos;
    optimisticUpdate((p) => p.map((t) => (t.id === id ? { ...t, completed: next } : t)));
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({ error: "Update failed" }))) as ErrorResponse;
        throw new Error(err.error || "Update failed");
      }
      // optional: ensure canonical state
      await fetchTodos();
    } catch (e) {
      setTodos(prev); // rollback
      onCountChange?.(prev.length);
      setError(e instanceof Error ? e.message : "Failed to update task");
    }
  };

  const onDelete = async (id: string) => {
    const prev = todos;
    const nextList = prev.filter((t) => t.id !== id);
    optimisticUpdate(() => nextList);
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({ error: "Delete failed" }))) as ErrorResponse;
        throw new Error(err.error || "Delete failed");
      }
      await fetchTodos();
    } catch (e) {
      setTodos(prev); // rollback
      onCountChange?.(prev.length);
      setError(e instanceof Error ? e.message : "Failed to delete task");
    }
  };

  const onEdit = async (id: string, title: string) => {
    const prev = todos;
    optimisticUpdate((p) => p.map((t) => (t.id === id ? { ...t, title } : t)));
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({ error: "Update failed" }))) as ErrorResponse;
        throw new Error(err.error || "Update failed");
      }
      await fetchTodos();
    } catch (e) {
      setTodos(prev); // rollback
      onCountChange?.(prev.length);
      setError(e instanceof Error ? e.message : "Failed to update task");
    }
  };

  return (
    <section className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} onRetry={fetchTodos} />}

      {isLoading ? (
        <SkeletonList rows={5} />
      ) : todos.length === 0 ? (
        <EmptyState onCreateFocus={onRequestAddFocus} />
      ) : (
        <motion.ul layout className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {todos.map((t) => (
              <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />)
            )}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
});

// -----------------------------
// TodoApp (default export)
// -----------------------------
interface Props {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}

export default function TodoApp({ theme, setTheme }: Props) {
  const [count, setCount] = useState<number>(0);
  const [addLoading, setAddLoading] = useState<boolean>(false);

  const listRef = useRef<TodoListHandle | null>(null);
  const formRef = useRef<TodoFormHandle | null>(null);

  const handleAdd = useCallback(async (title: string) => {
    setAddLoading(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({ error: "Failed to add" }))) as ErrorResponse;
        throw new Error(err.error || "Failed to add");
      }
      // refresh authoritative list
      await listRef.current?.refresh();
    } finally {
      setAddLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col">
      <Header theme={theme} setTheme={setTheme} count={count} />

      <div className="space-y-4 p-6">
        <TodoForm ref={formRef} onAdd={handleAdd} loading={addLoading} />

        <TodoList
          ref={listRef}
          onCountChange={(n) => setCount(n)}
          onRequestAddFocus={() => formRef.current?.focus()}
        />
      </div>
    </div>
  );
}
