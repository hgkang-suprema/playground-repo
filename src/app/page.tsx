import React from "react";
import ThemeToggle from "@/components/todo/ThemeToggle";

const Page: React.FC = () => {
  return (
    <main className="antialiased min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black transition-colors duration-500">
      <div className="w-full max-w-2xl mx-6">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              Todo Demo
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 max-w-xl">
              Lightweight demo showing a polished theme toggle with smooth transitions and modern UI language.
            </p>
          </div>

          <div className="ml-4">
            <ThemeToggle />
          </div>
        </header>

        <section className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-white/30 dark:border-black/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Today's tasks</h2>
            <span className="text-sm text-gray-500 dark:text-gray-300">3 items</span>
          </div>

          <ul className="space-y-3">
            <li className="p-4 rounded-xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-black/20 shadow-sm transition-transform hover:scale-[1.005]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Design landing page</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Polish hero section and CTA</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">Due today</div>
              </div>
            </li>

            <li className="p-4 rounded-xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-black/20 shadow-sm opacity-90">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Implement theme toggle</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Accessible, persisted & animated</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">Due tomorrow</div>
              </div>
            </li>

            <li className="px-4 py-6 rounded-xl border-dashed border-2 border-gray-100 dark:border-black/20 bg-gradient-to-b from-white/30 to-transparent dark:from-transparent">
              <div className="text-center text-gray-500 dark:text-gray-300">
                <strong className="block text-gray-800 dark:text-gray-100">Empty slot</strong>
                <span className="block text-sm mt-1">Add more tasks to keep your day productive</span>
              </div>
            </li>
          </ul>
        </section>

        <footer className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          Built with care — toggle the theme to see the glassmorphism and subtle shadows adapt.
        </footer>
      </div>
    </main>
  );
};

export default Page;
