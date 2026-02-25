"use client";
import AdminPollForm from "@/components/AdminPollForm";
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="flex flex-col items-center justify-center py-12 px-4 gap-8">
      <h1 className="text-4xl font-bold text-center">관리자 - 투표 관리</h1>
      <div className="w-full max-w-xl bg-white/30 backdrop-blur-lg rounded-2xl p-8 shadow-lg transition-all hover:scale-105">
        <AdminPollForm />
      </div>
      <Link href="/" className="text-blue-600 hover:underline">
        투표 페이지로 돌아가기
      </Link>
    </main>
  );
}