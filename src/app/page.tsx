"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-4xl font-bold">실시간 투표 시스템</h1>
      <div className="flex gap-4">
        <Link href="/vote" className="px-6 py-3 bg-blue-500 text-white rounded-full shadow-md transition-all hover:scale-105">
          투표하러 가기
        </Link>
        <Link href="/admin" className="px-6 py-3 bg-green-500 text-white rounded-full shadow-md transition-all hover:scale-105">
          관리자 페이지
        </Link>
      </div>
    </main>
  );
}