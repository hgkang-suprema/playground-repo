"use client";

import { FC } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Card from "../../components/Card";

const DisadvantagesPage: FC = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow p-8">
      <h1 className="text-3xl font-bold mb-4">아메리카노의 단점</h1>
      <Card title="쓴 맛">
        아메리카노는 쓴 맛이 강해 호불호가 갈릴 수 있습니다.
      </Card>
      <Card title="카페인 함량">
        카페인 함량이 높아 과다 섭취 시 주의가 필요합니다.
      </Card>
    </main>
    <Footer />
  </div>
);

export default DisadvantagesPage;
