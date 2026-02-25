"use client";
import PollForm from "@/components/PollForm";
import PollResults from "@/components/PollResults";
import React from "react";

export default function VotePage() {
  const [results, setResults] = React.useState<Record<string, number>>({
    OptionA: 0,
    OptionB: 0,
    OptionC: 0,
  });

  const handleVote = (option: string) => {
    setResults((prev) => ({ ...prev, [option]: prev[option] + 1 }));
  };

  return (
    <main className="py-12 flex flex-col items-center gap-8">
      <h2 className="text-3xl font-bold">실시간 투표</h2>
      <PollForm onVote={handleVote} />
      <PollResults results={results} />
    </main>
  );
}