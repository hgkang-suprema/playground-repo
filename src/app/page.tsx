import Header from "@/components/layout/header";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <>
      <Header title="Revenue Dashboard" />
      <main className="mx-auto max-w-5xl px-4 py-8 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
        <Dashboard />
      </main>
    </>
  );
}
