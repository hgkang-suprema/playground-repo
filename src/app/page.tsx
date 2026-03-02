import Header from "@/components/layout/header";
import TodoApp from "@/components/todo/TodoApp";

export default function Home() {
  return (
    <>
      <Header title="Todo" />
      <main className="mx-auto max-w-3xl px-4 py-8 text-zinc-900 dark:text-zinc-100">
        <TodoApp />
      </main>
    </>
  );
}
