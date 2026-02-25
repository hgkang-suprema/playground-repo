"use client";
import React from "react";
import PollForm from "@/components/PollForm";

const HomePage: React.FC = () => {
  return (
    <main className="flex-grow flex items-center justify-center">
      <PollForm />
    </main>
  );
};

export default HomePage;
