"use client";

import React from "react";
import clsx from "clsx";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        type={props.type ?? "button"}
        className={clsx(
          // visual style: glassmorphism + subtle shadow + focus ring
          "inline-flex items-center justify-center w-10 h-10 rounded-full",
          "bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm",
          "shadow-sm dark:shadow-black/30",
          "border border-white/30 dark:border-black/20",
          "transition-transform duration-200 ease-in-out",
          "hover:scale-105 active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400",
          className
        )}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
