import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between">
      <Link href="/vote" className="text-lg font-semibold hover:text-blue-500 transition-all">
        Vote
      </Link>
      <Link href="/dashboard" className="text-lg font-semibold hover:text-blue-500 transition-all">
        Dashboard
      </Link>
    </nav>
  );
};

export default Navbar;