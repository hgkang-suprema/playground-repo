"use client";
import React, { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";
import { twMerge } from "tailwind-merge";

const PollForm: React.FC = () => {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: 실시간 투표 생성 API 연동 또는 실시간 채널 연결 추가
    console.log("새로운 투표 주제:", topic);
    // 추후 성공 메시지 처리 등을 추가할 수 있습니다.
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-16 p-8 bg-white/30 rounded-xl shadow-lg backdrop-blur-sm"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        실시간 투표 생성
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="relative mb-6">
          <Edit3 className="absolute top-1/2 transform -translate-y-1/2 left-3 text-slate-700" size={18} />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="투표 주제를 입력하세요"
            className={twMerge(
              "w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full outline-none focus:ring-2 focus:ring-blue-400 transition-all",
              "bg-white/60"
            )}
            required
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          type="submit"
          className="w-full py-2 bg-blue-500 text-white font-semibold rounded-full transition-all hover:bg-blue-600"
        >
          투표 생성하기
        </motion.button>
      </form>
    </motion.div>
  );
};

export default PollForm;
