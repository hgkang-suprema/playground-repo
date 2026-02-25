"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const AdminPollManager: React.FC = () => {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>([""]);
  
  const handleOptionChange = (value: string, index: number) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => setOptions((prev) => [...prev, ""]);
  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    alert("투표 폼이 저장되었습니다!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg p-8 rounded-xl shadow-lg bg-white bg-opacity-60 backdrop-blur-md flex flex-col gap-6"
    >
      <h3 className="text-2xl font-semibold">투표 폼 관리</h3>
      <div className="flex flex-col gap-3">
        <label className="font-medium">질문</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="투표 질문을 입력하세요"
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      <div className="flex flex-col gap-3">
        <label className="font-medium">옵션</label>
        {options.map((option, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(e.target.value, idx)}
              placeholder={`옵션 ${idx + 1}`}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {options.length > 1 && (
              <button onClick={() => handleRemoveOption(idx)} className="text-red-500">
                삭제
              </button>
            )}
          </div>
        ))}
        <button onClick={handleAddOption} className="w-fit px-4 py-2 bg-green-500 text-white rounded-full transition-all hover:scale-105">
          옵션 추가
        </button>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={handleSave}
        className="mt-4 w-full py-3 bg-blue-500 text-white rounded-full shadow-md transition-all"
      >
        저장하기
      </motion.button>
    </motion.div>
  );
};

export default AdminPollManager;