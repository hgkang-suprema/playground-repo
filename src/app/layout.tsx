import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;