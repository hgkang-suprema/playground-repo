"use client";
import AdminPollManager from "@/components/AdminPollManager";
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="py-12 flex flex-col items-center gap-8">
      <h2 className="text-3xl font-bold">관리자 페이지</h2>
      <AdminPollManager />
      <Link href="/" className="px-6 py-3 bg-slate-700 text-white rounded-full shadow-md transition-all hover:scale-105">
        메인으로 돌아가기
      </Link>
    </main>
  );
}