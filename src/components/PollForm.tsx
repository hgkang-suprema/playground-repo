"use client";
import { motion } from "framer-motion";
import { useState } from "react";

interface PollFormProps {
  onVote: (option: string) => void;
}

const options = ["OptionA", "OptionB", "OptionC"];

const PollForm: React.FC<PollFormProps> = ({ onVote }) => {
  const [selectedOption, setSelectedOption] = useState<string>("");

  return (
    <div className="w-full max-w-md p-6 rounded-xl shadow-lg bg-white bg-opacity-60 backdrop-blur-md">
      <h3 className="text-xl font-semibold mb-4">투표 항목 선택</h3>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="poll"
              value={option}
              checked={selectedOption === option}
              onChange={() => setSelectedOption(option)}
              className="accent-blue-500"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={() => {
          if (selectedOption) {
            onVote(selectedOption);
            setSelectedOption("");
          }
        }}
        className="mt-6 w-full py-3 bg-blue-500 text-white rounded-full shadow-md transition-all"
      >
        투표하기
      </motion.button>
    </div>
  );
};

export default PollForm;