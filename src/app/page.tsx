"use client";
import PollForm from "@/components/PollForm";
import PollResult from "@/components/PollResult";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center py-12 px-4 gap-8">
      <h1 className="text-4xl font-bold text-center">실시간 투표</h1>
      <div className="w-full max-w-xl bg-white/30 backdrop-blur-lg rounded-2xl p-8 shadow-lg transition-all hover:scale-105">
        <PollForm />
      </div>
      <div className="w-full max-w-xl bg-white/30 backdrop-blur-lg rounded-2xl p-8 shadow-lg transition-all hover:scale-105">
        <PollResult />
      </div>
      <Link href="/admin" className="text-blue-600 hover:underline">
        관리자 페이지로 이동
      </Link>
    </main>
  );
}