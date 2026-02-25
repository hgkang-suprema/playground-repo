"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function PollForm() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const options = ["옵션 1", "옵션 2", "옵션 3"];

  const handleVote = () => {
    if (selectedOption) {
      setSubmitted(true);
      // 여기서 실시간 서버 전송 또는 소켓 업데이트 로직 추가
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">투표 항목을 선택해주세요.</p>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <motion.button
            key={option}
            onClick={() => setSelectedOption(option)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className={`p-4 rounded-xl border ${
              selectedOption === option
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white/40 text-slate-800 border-slate-300"
            }`}
          >
            {option}
          </motion.button>
        ))}
      </div>
      <motion.button
        onClick={handleVote}
        whileHover={{ scale: 1.05 }}
        className="flex items-center justify-center gap-2 bg-green-500 text-white p-4 rounded-xl mt-4 transition-all hover:scale-105"
      >
        <CheckCircle size={20} />
        투표하기
      </motion.button>
      {submitted && <p className="text-green-600 font-medium">투표가 접수되었습니다.</p>}
    </div>
  );
}