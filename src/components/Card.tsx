"use client";

import { FC, ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
}

const Card: FC<CardProps> = ({ title, children }) => (
  <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 transition-transform hover:scale-105">
    <div className="p-4">
      <h2 className="font-bold text-xl mb-2">{title}</h2>
      <p className="text-gray-700">{children}</p>
    </div>
  </div>
);

export default Card;
