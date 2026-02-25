"use client";
import { useEffect, useState } from "react";

type VoteResult = {
  option: string;
  count: number;
};

export default function PollResult() {
  const [results, setResults] = useState<VoteResult[]>([
    { option: "옵션 1", count: 0 },
    { option: "옵션 2", count: 0 },
    { option: "옵션 3", count: 0 },
  ]);

  // 여기에 실시간 업데이트 (예: polling, WebSocket) 로직 추가 가능
  useEffect(() => {
    const interval = setInterval(() => {
      setResults((prev) =>
        prev.map((item) => ({
          ...item,
          count: item.count + Math.floor(Math.random() * 3),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p className="mb-4 text-lg">실시간 투표 결과</p>
      <div className="flex flex-col gap-2">
        {results.map(({ option, count }) => (
          <div key={option} className="flex items-center justify-between bg-white/30 p-2 rounded-lg">
            <span>{option}</span>
            <span className="font-bold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}