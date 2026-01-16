// src/app/ritual/scent/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuraGradient } from "@/components/AuraGradient";
import { Wordmark } from "@/components/Wordmark";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SCENT_DIRECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ScentStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleScent = (value: string) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((s) => s !== value));
    } else if (selected.length < 2) {
      setSelected([...selected, value]);
    }
  };

  const handleContinue = () => {
    sessionStorage.setItem("ritual_scents", JSON.stringify(selected));
    router.push("/ritual/occasion");
  };

  return (
    <AuraGradient>
      <div className="min-h-screen px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/collection">
            <Wordmark size="sm" />
          </Link>
          <span className="text-stone-400 text-sm">3 of 5</span>
        </div>

        <ProgressBar currentStep={3} totalSteps={5} />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 pb-32"
        >
          <h1 className="font-cormorant text-3xl text-stone-800 mb-2">
            What direction are you leaning?
          </h1>
          <p className="text-stone-500 mb-8">
            Pick 1-2 scent families that feel right today.
          </p>

          <div className="grid gap-3">
            {SCENT_DIRECTIONS.map((scent) => (
              <motion.button
                key={scent.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleScent(scent.value)}
                disabled={!selected.includes(scent.value) && selected.length >= 2}
                className={cn(
                  "w-full p-4 rounded-2xl text-left transition-all duration-300",
                  "border-2 backdrop-blur-sm",
                  selected.includes(scent.value)
                    ? "border-stone-800 bg-stone-800/5"
                    : "border-stone-200 bg-white/50 hover:border-stone-300",
                  !selected.includes(scent.value) && selected.length >= 2 && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className={cn(
                  "font-cormorant text-lg block",
                  selected.includes(scent.value) ? "text-stone-900" : "text-stone-700"
                )}>
                  {scent.label}
                </span>
                <span className="text-sm text-stone-500 mt-1 block">
                  {scent.description}
                </span>
                <span className="text-xs text-stone-400 mt-1 block italic">
                  {scent.examples}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={() => router.push("/ritual/mood")}
              className="p-4 border-2 border-stone-300 rounded-full text-stone-600 hover:border-stone-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleContinue}
              disabled={selected.length === 0}
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
