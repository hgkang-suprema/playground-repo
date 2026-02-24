"use client";

import React from 'react';
import clsx from 'clsx';

type PollOptionProps = {
  option: string;
  isSelected: boolean;
  onSelect: () => void;
};

const PollOption: React.FC<PollOptionProps> = ({ option, isSelected, onSelect }) => {
  return (
    <button 
      onClick={onSelect} 
      className={clsx(
        'w-full text-left p-2 rounded transition-all',
        isSelected ? 'bg-blue-100' : 'bg-white hover:bg-gray-100'
      )}
    >
      {option}
    </button>
  );
};

export default PollOption;