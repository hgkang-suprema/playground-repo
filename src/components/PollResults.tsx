"use client";
import { motion } from "framer-motion";

interface PollResultsProps {
  results: Record<string, number>;
}

const PollResults: React.FC<PollResultsProps> = ({ results }) => {
  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full max-w-md p-6 rounded-xl shadow-lg bg-white bg-opacity-60 backdrop-blur-md">
      <h3 className="text-xl font-semibold mb-4">실시간 결과</h3>
      <ul className="flex flex-col gap-4">
        {Object.entries(results).map(([option, count]) => {
          const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          return (
            <li key={option}>
              <div className="flex justify-between mb-1">
                <span>{option}</span>
                <span>{count}표</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  className="h-4 bg-blue-500 rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PollResults;