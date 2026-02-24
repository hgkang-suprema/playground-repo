"use client";

import React from 'react';
import { motion } from 'framer-motion';

const DashboardChart: React.FC = () => {
  // Dummy data for illustration
  const data = [
    { label: 'Option 1', value: 40 },
    { label: 'Option 2', value: 30 },
    { label: 'Option 3', value: 30 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Results</h2>
      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div 
            key={index} 
            className="flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span>{item.label}</span>
            <span>{item.value}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardChart;