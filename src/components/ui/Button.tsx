// src/components/ui/Button.tsx
"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-stone-800 text-white hover:bg-stone-700",
      secondary: "border-2 border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50",
      ghost: "text-stone-500 hover:text-stone-800",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 font-cormorant text-lg",
      lg: "px-8 py-4 font-cormorant text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        disabled={disabled}
        className={cn(
          "rounded-full transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
