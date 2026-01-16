// src/app/ritual/style/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AuraGradient } from "@/components/AuraGradient";
import { Wordmark } from "@/components/Wordmark";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { OUTFIT_STYLES } from "@/lib/constants";

export default function StyleStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleStyle = (value: string) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((s) => s !== value));
    } else if (selected.length < 2) {
      setSelected([...selected, value]);
    }
  };

  const handleContinue = () => {
    // Store selection in session storage
    sessionStorage.setItem("ritual_styles", JSON.stringify(selected));
    router.push("/ritual/mood");
  };

  return (
    <AuraGradient>
      <div className="min-h-screen px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/collection">
            <Wordmark size="sm" />
          </Link>
          <span className="text-stone-400 text-sm">1 of 5</span>
        </div>

        <ProgressBar currentStep={1} totalSteps={5} />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <h1 className="font-cormorant text-3xl text-stone-800 mb-2">
            What are you wearing today?
          </h1>
          <p className="text-stone-500 mb-8">
            Pick up to 2 styles that fit your outfit.
          </p>

          <div className="grid gap-3">
            {OUTFIT_STYLES.map((style) => (
              <SelectableChip
                key={style.value}
                label={style.label}
                description={style.description}
                selected={selected.includes(style.value)}
                onSelect={() => toggleStyle(style.value)}
                disabled={!selected.includes(style.value) && selected.length >= 2}
              />
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selected.length > 0 ? 1 : 0.5 }}
          className="fixed bottom-8 left-6 right-6"
        >
          <button
            onClick={handleContinue}
            disabled={selected.length === 0}
            className="w-full py-4 bg-stone-800 text-white rounded-full font-cormorant text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700 transition-colors"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </AuraGradient>
  );
}
