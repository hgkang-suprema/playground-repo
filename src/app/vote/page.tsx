"use client";

import React from 'react';
import PollForm from '../../components/PollForm';

const VotePage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">Vote Now</h1>
      <PollForm />
    </div>
  );
};

export default VotePage;