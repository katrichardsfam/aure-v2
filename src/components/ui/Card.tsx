// src/components/ui/Card.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

export function Card({ children, className, onClick, animate = true }: CardProps) {
  const Component = animate ? motion.div : "div";
  
  const baseProps = {
    className: cn(
      "bg-white/60 backdrop-blur-sm rounded-3xl border border-stone-200",
      onClick && "cursor-pointer hover:border-stone-300 transition-colors",
      className
    ),
    onClick,
  };

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        {...baseProps}
      >
        {children}
      </motion.div>
    );
  }

  return <div {...baseProps}>{children}</div>;
}
