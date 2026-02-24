"use client";

import React from 'react';
import DashboardChart from '../../components/DashboardChart';

const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">Dashboard</h1>
      <DashboardChart />
    </div>
  );
};

export default DashboardPage;