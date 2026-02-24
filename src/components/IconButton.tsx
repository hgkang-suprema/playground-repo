"use client";

import { FC } from "react";
import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
}

const IconButton: FC<IconButtonProps> = ({ icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
  >
    <Icon size={24} />
  </button>
);

export default IconButton;
