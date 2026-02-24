"use client";

import { FC } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HomePage: FC = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow p-8">
      <h1 className="text-3xl font-bold mb-4">아메리카노 정보</h1>
      <p className="mb-4">아메리카노의 장단점을 알아보세요.</p>
      <div className="flex space-x-4">
        <Link href="/advantages">
          <a className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">장점 보기</a>
        </Link>
        <Link href="/disadvantages">
          <a className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">단점 보기</a>
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default HomePage;
