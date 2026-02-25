"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AdminPollForm() {
  const [question, setQuestion] = useState("");
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  const handleAddOption = () => {
    if (optionInput.trim() !== "") {
      setOptions((prev) => [...prev, optionInput.trim()]);
      setOptionInput("");
    }
  };

  const handleSavePoll = () => {
    if (question && options.length > 0) {
      // 여기서 투표 폼 생성 로직 또는 API 호출 등을 처리합니다.
      alert("새로운 투표가 생성되었습니다!");
      setQuestion("");
      setOptions([]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col">
        투표 질문
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1 p-2 rounded-md border border-slate-300 bg-white/40 backdrop-blur-sm"
          placeholder="투표 질문을 입력하세요"
        />
      </label>
      <label className="flex flex-col">
        옵션 추가
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={optionInput}
            onChange={(e) => setOptionInput(e.target.value)}
            className="p-2 rounded-md border border-slate-300 flex-1 bg-white/40 backdrop-blur-sm"
            placeholder="옵션을 입력하세요"
          />
          <motion.button
            onClick={handleAddOption}
            whileHover={{ scale: 1.05 }}
            className="bg-blue-500 text-white p-2 rounded-md transition-all"
          >
            추가
          </motion.button>
        </div>
      </label>
      {options.length > 0 && (
        <ul className="list-disc pl-5">
          {options.map((opt, idx) => (
            <li key={idx}>{opt}</li>
          ))}
        </ul>
      )}
      <motion.button
        onClick={handleSavePoll}
        whileHover={{ scale: 1.05 }}
        className="bg-green-500 text-white p-4 rounded-xl transition-all mt-4"
      >
        투표 생성
      </motion.button>
    </div>
  );
}