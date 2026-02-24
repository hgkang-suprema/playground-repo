"use client";

import React, { useState } from 'react';
import PollOption from './PollOption';

const PollForm: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption) {
      // API call or WebSocket logic here
      console.log(`Submitted: ${selectedOption}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Choose an option:</h2>
      <div className="space-y-2">
        {['Option 1', 'Option 2', 'Option 3'].map(option => (
          <PollOption 
            key={option} 
            option={option} 
            isSelected={selectedOption === option} 
            onSelect={() => setSelectedOption(option)}
          />
        ))}
      </div>
      <button 
        onClick={handleSubmit} 
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-all"
      >
        Submit
      </button>
    </div>
  );
};

export default PollForm;