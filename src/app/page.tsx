"use client";

import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";

type Theme = "light" | "dark";

interface PageProps {}

export default function Page({}: PageProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-black">
        {/* Ambient gradient decorations */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 blur-3xl">
          <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-fuchsia-300/40 dark:bg-fuchsia-600/20" />
          <div className="absolute right-[-12%] bottom-[-12%] h-96 w-96 rounded-full bg-cyan-300/40 dark:bg-cyan-600/20" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <Header theme={theme} toggleTheme={toggleTheme} />
          <div className="mt-6">
            <Dashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
