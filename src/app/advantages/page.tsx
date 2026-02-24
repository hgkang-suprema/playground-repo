"use client";

import { FC } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Card from "../../components/Card";

const AdvantagesPage: FC = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow p-8">
      <h1 className="text-3xl font-bold mb-4">아메리카노의 장점</h1>
      <Card title="저칼로리">
        아메리카노는 칼로리가 낮아 다이어트에 좋습니다.
      </Card>
      <Card title="간편한 준비">
        간단하게 준비할 수 있어 바쁜 아침에 적합합니다.
      </Card>
    </main>
    <Footer />
  </div>
);

export default AdvantagesPage;
