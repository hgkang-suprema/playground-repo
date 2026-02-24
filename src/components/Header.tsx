"use client";

import { FC } from "react";
import Link from "next/link";
import { Home } from "lucide-react";

const Header: FC = () => (
  <header className="flex items-center justify-between p-4 bg-blue-500 text-white">
    <h1 className="text-lg font-bold">아메리카노 정보</h1>
    <nav>
      <Link href="/">
        <a className="mr-4 hover:underline">
          <Home size={24} />
        </a>
      </Link>
      <Link href="/advantages">
        <a className="mr-4 hover:underline">장점</a>
      </Link>
      <Link href="/disadvantages">
        <a className="hover:underline">단점</a>
      </Link>
    </nav>
  </header>
);

export default Header;
