"use client";

import { useEffect, useState } from "react";
import TodoApp from "../components/TodoApp";

type Theme = "light" | "dark";

interface Props {}

const THEME_STORAGE_KEY = "theme";

export default function Page({}: Props) {
  const [theme, setTheme] = useState<Theme>("light");

  // Initialize theme from localStorage or prefers-color-scheme
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        return;
      }
    } catch {
      // ignore storage errors
    }
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  // Persist theme
  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="relative min-h-screen transition-colors duration-300 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        {/* Ambient gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl dark:bg-fuchsia-600/20" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl dark:bg-sky-600/20" />
        </div>

        <main className="relative z-10 mx-auto w-full max-w-3xl px-6 py-10" role="main" aria-label="Todo Application">
          <div className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-white/10 dark:bg-neutral-900/60">
            <TodoApp theme={theme} setTheme={setTheme} />
          </div>

          <footer className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
            <span>Todo demo • App Router • In-memory API</span>
          </footer>
        </main>
      </div>
    </div>
  );
}