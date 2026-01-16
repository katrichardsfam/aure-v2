// src/components/Wordmark.tsx
import { cn } from "@/lib/utils";

interface WordmarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl md:text-5xl",
  xl: "text-5xl md:text-6xl",
};

export function Wordmark({ size = "md", className }: WordmarkProps) {
  return (
    <span 
      className={cn(
        "font-cormorant font-light tracking-wide text-stone-900",
        sizes[size],
        className
      )}
    >
      aurë
    </span>
  );
}
