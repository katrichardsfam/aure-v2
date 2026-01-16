// src/app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { SCENT_DIRECTIONS } from "@/lib/constants";

type OnboardingStep = "welcome" | "scents" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [selectedScents, setSelectedScents] = useState<string[]>([]);

  const toggleScent = (value: string) => {
    if (selectedScents.includes(value)) {
      setSelectedScents(selectedScents.filter((s) => s !== value));
    } else if (selectedScents.length < 3) {
      setSelectedScents([...selectedScents, value]);
    }
  };

  const handleComplete = async () => {
    // TODO: Save preferences to Convex
    router.push("/collection");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-white px-6 py-12">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-[80vh] flex flex-col items-center justify-center text-center"
          >
            <span className="font-cormorant text-5xl font-light text-stone-800 mb-6">
              Welcome to aurë
            </span>
            <p className="text-stone-500 max-w-sm mb-4 leading-relaxed">
              We believe scent is the final layer of getting dressed — 
              an invisible accessory that shapes how you feel and how 
              you&apos;re perceived.
            </p>
            <p className="text-stone-500 max-w-sm mb-12 leading-relaxed">
              Let&apos;s learn a little about your scent preferences to 
              personalize your experience.
            </p>
            <button
              onClick={() => setStep("scents")}
              className="px-8 py-4 bg-stone-800 text-white rounded-full font-cormorant text-lg flex items-center gap-2 hover:bg-stone-700 transition-colors"
            >
              Begin
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === "scents" && (
          <motion.div
            key="scents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-8">
              <span className="font-cormorant text-3xl text-stone-800">
                What draws you in?
              </span>
              <p className="text-stone-500 mt-2">
                Select up to 3 scent directions you naturally gravitate toward.
              </p>
            </div>

            <div className="grid gap-3 mb-8">
              {SCENT_DIRECTIONS.map((scent) => (
                <button
                  key={scent.value}
                  onClick={() => toggleScent(scent.value)}
                  disabled={!selectedScents.includes(scent.value) && selectedScents.length >= 3}
                  className={`w-full p-4 rounded-2xl text-left transition-all duration-300 border-2 backdrop-blur-sm ${
                    selectedScents.includes(scent.value)
                      ? "border-stone-800 bg-stone-800/5"
                      : "border-stone-200 bg-white/50 hover:border-stone-300 disabled:opacity-50"
                  }`}
                >
                  <span className={`font-cormorant text-lg block ${
                    selectedScents.includes(scent.value) ? "text-stone-900" : "text-stone-700"
                  }`}>
                    {scent.label}
                  </span>
                  <span className="text-sm text-stone-500 block mt-1">
                    {scent.description}
                  </span>
                  <span className="text-xs text-stone-400 block mt-1 italic">
                    {scent.examples}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("complete")}
              disabled={selectedScents.length === 0}
              className="w-full py-4 bg-stone-800 text-white rounded-full font-cormorant text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700 transition-colors"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-[80vh] flex flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mb-8"
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>
            <span className="font-cormorant text-4xl font-light text-stone-800 mb-4">
              You&apos;re all set
            </span>
            <p className="text-stone-500 max-w-sm mb-12 leading-relaxed">
              Your preferences have been saved. Now let&apos;s build your 
              fragrance collection — your personal Aura Vault.
            </p>
            <button
              onClick={handleComplete}
              className="px-8 py-4 bg-stone-800 text-white rounded-full font-cormorant text-lg flex items-center gap-2 hover:bg-stone-700 transition-colors"
            >
              Enter Your Vault
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
