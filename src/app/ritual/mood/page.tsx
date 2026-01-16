// src/app/ritual/mood/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuraGradient } from "@/components/AuraGradient";
import { Wordmark } from "@/components/Wordmark";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MOODS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function MoodStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem("ritual_mood", selected);
      router.push("/ritual/scent");
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
          <span className="text-stone-400 text-sm">2 of 5</span>
        </div>

        <ProgressBar currentStep={2} totalSteps={5} />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <h1 className="font-cormorant text-3xl text-stone-800 mb-2">
            How do you want to feel?
          </h1>
          <p className="text-stone-500 mb-8">
            Choose the energy you want to carry today.
          </p>

          <div className="grid gap-4">
            {MOODS.map((mood) => (
              <motion.button
                key={mood.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(mood.value)}
                className={cn(
                  "w-full p-6 rounded-3xl text-left transition-all duration-300",
                  "border-2 backdrop-blur-sm relative overflow-hidden",
                  selected === mood.value
                    ? "border-stone-800 bg-stone-800/5"
                    : "border-stone-200 bg-white/50 hover:border-stone-300"
                )}
              >
                {/* Subtle gradient accent */}
                <div className={cn(
                  "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2",
                  `bg-gradient-to-br ${mood.gradient}`
                )} />
                
                <span className={cn(
                  "font-cormorant text-2xl block relative z-10",
                  selected === mood.value ? "text-stone-900" : "text-stone-700"
                )}>
                  {mood.label}
                </span>
                <span className="text-sm text-stone-500 mt-1 block relative z-10">
                  {mood.description}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={() => router.push("/ritual/style")}
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
