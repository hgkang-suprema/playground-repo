"use client";

import { Sun, Moon, Plus } from "lucide-react";

interface Props {
  theme: "light" | "dark";
  toggleTheme: () => void;
  onCreateKpi?: () => void;
}

function Header({ theme, toggleTheme, onCreateKpi }: Props) {
  return (
    <header
      className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/60 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
    >
      {/* soft gradient sheen */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute -left-10 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-fuchsia-400/40 to-cyan-400/30 blur-2xl dark:from-fuchsia-700/30 dark:to-cyan-700/30" />
      </div>

      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Revenue Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Monitor monthly sales and key performance metrics in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white/80 text-slate-700 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? (
              <Sun className="h-[18px] w-[18px] transition-transform duration-300 group-active:scale-90" />
            ) : (
              <Moon className="h-[18px] w-[18px] transition-transform duration-300 group-active:scale-90" />
            )}
          </button>

          {onCreateKpi && (
            <button
              type="button"
              onClick={onCreateKpi}
              aria-label="Create new KPI"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40 dark:from-cyan-600 dark:to-fuchsia-600"
            >
              <Plus className="h-4 w-4" />
              <span>New KPI</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
