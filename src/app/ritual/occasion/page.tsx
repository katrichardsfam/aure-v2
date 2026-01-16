// src/app/ritual/occasion/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Briefcase, Heart, Coffee, Sparkles, Home } from "lucide-react";
import Link from "next/link";
import { AuraGradient } from "@/components/AuraGradient";
import { Wordmark } from "@/components/Wordmark";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { OCCASIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
};

export default function OccasionStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem("ritual_occasion", selected);
      router.push("/ritual/weather");
    }
  };

  return (
    <AuraGradient>
      <div className="min-h-screen px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/collection">
            <Wordmark size="sm" />
          </Link>
          <span className="text-stone-400 text-sm">4 of 5</span>
        </div>

        <ProgressBar currentStep={4} totalSteps={5} />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <h1 className="font-cormorant text-3xl text-stone-800 mb-2">
            What&apos;s the occasion?
          </h1>
          <p className="text-stone-500 mb-8">
            This helps us match the right projection level.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {OCCASIONS.map((occasion) => (
              <motion.button
                key={occasion.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(occasion.value)}
                className={cn(
                  "p-6 rounded-2xl text-center transition-all duration-300",
                  "border-2 backdrop-blur-sm",
                  selected === occasion.value
                    ? "border-stone-800 bg-stone-800/5"
                    : "border-stone-200 bg-white/50 hover:border-stone-300"
                )}
              >
                <div className={cn(
                  "mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center",
                  selected === occasion.value 
                    ? "bg-stone-800 text-white" 
                    : "bg-stone-100 text-stone-500"
                )}>
                  {iconMap[occasion.icon]}
                </div>
                <span className={cn(
                  "font-cormorant text-lg block",
                  selected === occasion.value ? "text-stone-900" : "text-stone-700"
                )}>
                  {occasion.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={() => router.push("/ritual/scent")}
              className="p-4 border-2 border-stone-300 rounded-full text-stone-600 hover:border-stone-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleContinue}
              disabled={!selected}
              className="flex-1 py-4 bg-stone-800 text-white rounded-full font-cormorant text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700 transition-colors"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </AuraGradient>
  );
}
