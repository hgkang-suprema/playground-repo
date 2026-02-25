"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";

function cx(...list: Array<string | false | null | undefined>): string {
  return list.filter(Boolean).join(" ");
}

export interface RevenueItem {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface RevenueFormProps {
  initial: RevenueItem | null;
  onClose: () => void;
}

function formatDateYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function RevenueForm({ initial, onClose }: RevenueFormProps) {
  const isEdit = Boolean(initial);
  const [title, setTitle] = React.useState<string>(initial?.title ?? "");
  const [amount, setAmount] = React.useState<string>(
    initial ? String(initial.amount) : ""
  );
  const [date, setDate] = React.useState<string>(
    initial?.date ?? formatDateYYYYMMDD(new Date())
  );
  const [notes, setNotes] = React.useState<string>(initial?.notes ?? "");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Close on ESC
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsed = Number.parseFloat(amount);
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!Number.isFinite(parsed)) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setSubmitting(true);
      const body = {
        id: initial?.id,
        title: title.trim(),
        amount: parsed,
        date,
        notes: notes.trim() || undefined,
      };

      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch("/api/revenues", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      // Notify globally that the list may need to refresh
      try {
        window.dispatchEvent(new Event("revenues:updated"));
      } catch {}

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cx(
        "fixed inset-0 z-50 flex items-center justify-center",
        "p-4 sm:p-8"
      )}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={cx(
          "absolute inset-0 cursor-default",
          "bg-black/40 backdrop-blur-sm",
          "transition-opacity"
        )}
      />

      {/* Modal Card */}
      <div
        className={cx(
          "relative w-full max-w-lg",
          "rounded-2xl border border-white/20 dark:border-gray-800",
          "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-xl",
          "overflow-hidden"
        )}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEdit ? "Edit Revenue" : "Add Revenue"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEdit
                ? "Update the details of this revenue entry."
                : "Fill in the details to record a new revenue."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cx(
              "inline-flex h-9 w-9 items-center justify-center rounded-full",
              "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
              "hover:bg-gray-100/80 dark:hover:bg-gray-800/60",
              "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4">
          {error && (
            <div className="mt-3 rounded-lg border border-rose-200/50 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/40 px-4 py-2 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="rev-title" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Title
              </label>
              <input
                id="rev-title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Subscription Upgrade"
                className={cx(
                  "w-full rounded-xl border border-gray-200/70 dark:border-gray-800/70",
                  "bg-white/80 dark:bg-gray-900/60 px-3.5 py-2.5",
                  "text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500"
                )}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rev-amount" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Amount
              </label>
              <input
                id="rev-amount"
                name="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={cx(
                  "w-full rounded-xl border border-gray-200/70 dark:border-gray-800/70",
                  "bg-white/80 dark:bg-gray-900/60 px-3.5 py-2.5",
                  "text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500"
                )}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rev-date" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Date
              </label>
              <input
                id="rev-date"
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cx(
                  "w-full rounded-xl border border-gray-200/70 dark:border-gray-800/70",
                  "bg-white/80 dark:bg-gray-900/60 px-3.5 py-2.5",
                  "text-gray-900 dark:text-gray-100",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500"
                )}
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="rev-notes" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Notes (optional)
              </label>
              <textarea
                id="rev-notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context or a short memo"
                className={cx(
                  "w-full rounded-xl border border-gray-200/70 dark:border-gray-800/70",
                  "bg-white/80 dark:bg-gray-900/60 px-3.5 py-2.5",
                  "text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500"
                )}
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cx(
                "inline-flex items-center justify-center rounded-xl px-4 py-2.5",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-100/80 dark:hover:bg-gray-800/60",
                "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              )}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cx(
                "inline-flex items-center justify-center rounded-xl px-4 py-2.5",
                "bg-gradient-to-br from-indigo-600 to-rose-500 text-white",
                "shadow-sm hover:shadow-md transition-all",
                submitting && "opacity-80 cursor-not-allowed"
              )}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>{isEdit ? "Save Changes" : "Add Revenue"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RevenueForm;
