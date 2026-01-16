// src/components/ui/SelectableChip.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SelectableChipProps {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function SelectableChip({
  label,
  description,
  selected,
  onSelect,
  disabled = false,
}: SelectableChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full p-4 rounded-2xl text-left transition-all duration-300",
        "border-2 backdrop-blur-sm",
        selected
          ? "border-stone-800 bg-stone-800/5"
          : "border-stone-200 bg-white/50 hover:border-stone-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "font-cormorant text-lg block",
        selected ? "text-stone-900" : "text-stone-700"
      )}>
        {label}
      </span>
      {description && (
        <span className="text-sm text-stone-500 mt-1 block">
          {description}
        </span>
      )}
    </motion.button>
  );
}
