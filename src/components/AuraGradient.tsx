// src/components/AuraGradient.tsx
"use client";

import { motion } from "framer-motion";
import { AURA_GRADIENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AuraGradientProps {
  scentFamily?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuraGradient({ 
  scentFamily = "default", 
  children,
  className = ""
}: AuraGradientProps) {
  const gradient = AURA_GRADIENTS[scentFamily] || AURA_GRADIENTS.default;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={cn("min-h-screen bg-gradient-to-br", gradient, className)}
    >
      {children}
    </motion.div>
  );
}
