import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variants = {
  default: "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900",
  secondary: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
  outline: "border border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
  destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeProps };
