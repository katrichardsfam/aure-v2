// src/app/aura/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AuraGradient } from "@/components/AuraGradient";
import { Wordmark } from "@/components/Wordmark";

interface SessionData {
  styles: string[];
  mood: string;
  scents: string[];
  occasion: string;
  weather: {
    temperatureCategory?: string;
    temperature?: number;
    condition?: string;
    location?: string;
    isManual?: boolean;
  } | null;
}

export default function TodaysAura() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve session data from sessionStorage
    const styles = sessionStorage.getItem("ritual_styles");
    const mood = sessionStorage.getItem("ritual_mood");
    const scents = sessionStorage.getItem("ritual_scents");
    const occasion = sessionStorage.getItem("ritual_occasion");
    const weather = sessionStorage.getItem("ritual_weather");

    if (styles && mood && scents && occasion) {
      setSessionData({
        styles: JSON.parse(styles),
        mood,
        scents: JSON.parse(scents),
        occasion,
        weather: weather ? JSON.parse(weather) : null,
      });
    }

    // Simulate loading for recommendation generation
    setTimeout(() => setLoading(false), 1500);
  }, []);

  // TODO: Replace with actual Convex query for recommendation
  // This is placeholder data based on the session inputs
  const session = sessionData ? {
    perfume: {
      name: "Santal 33",
      house: "Le Labo",
      scentFamily: sessionData.scents[0] || "woody",
    },
    auraWords: getAuraWords(sessionData.mood),
    editorialExplanation: generateEditorialExplanation(sessionData),
    affirmation: getAffirmation(sessionData.mood),
    weather: sessionData.weather,
  } : null;

  if (loading || !session) {
    return (
      <AuraGradient>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-stone-400" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-stone-500 mt-4 font-cormorant text-lg"
          >
            Finding your aura...
          </motion.p>
        </div>
      </AuraGradient>
    );
  }

  return (
    <AuraGradient scentFamily={session.perfume.scentFamily}>
      <div className="min-h-screen px-6 py-8 pb-40">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <Link href="/collection">
            <Wordmark size="sm" />
          </Link>
          <span className="text-stone-400 text-sm">Today&apos;s Aura</span>
        </header>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Perfume Recommendation */}
          <div className="text-center py-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-stone-500 text-sm uppercase tracking-widest mb-4"
            >
              Your scent for today
            </motion.p>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-cormorant text-4xl text-stone-800 mb-2"
            >
              {session.perfume.name}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-stone-500"
            >
              {session.perfume.house}
            </motion.p>
          </div>

          {/* Aura Words */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center flex-wrap gap-3"
          >
            {session.auraWords.map((word) => (
              <span
                key={word}
                className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-stone-700 text-sm font-medium"
              >
                {word}
              </span>
            ))}
          </motion.div>

          {/* Editorial Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-white/60"
          >
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-3">
              Why this works today
            </p>
            <p className="font-cormorant text-lg text-stone-700 leading-relaxed">
              {session.editorialExplanation}
            </p>
          </motion.div>

          {/* Weather Context */}
          {session.weather && session.weather.temperatureCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-center text-stone-500 text-sm"
            >
              {session.weather.temperature && session.weather.location ? (
                <span>
                  {Math.round(session.weather.temperature)}° in {session.weather.location}
                </span>
              ) : (
                <span className="capitalize">{session.weather.temperatureCategory} weather</span>
              )}
            </motion.div>
          )}

          {/* Affirmation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center py-6"
          >
            <p className="font-cormorant text-xl text-stone-600 italic">
              &ldquo;{session.affirmation}&rdquo;
            </p>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-50 via-stone-50/80 to-transparent"
        >
          <div className="max-w-lg mx-auto space-y-3">
            <button
              onClick={() => {
                // TODO: Mark as worn in Convex
                router.push("/collection");
              }}
              className="w-full py-4 bg-stone-800 text-white rounded-full font-cormorant text-lg flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors"
            >
              <Check className="w-5 h-5" />
              Wear This Today
            </button>
            
            <button
              onClick={() => router.push("/ritual")}
              className="w-full py-3 text-stone-500 hover:text-stone-700 text-sm transition-colors"
            >
              Try a different vibe
            </button>
          </div>
        </motion.div>
      </div>
    </AuraGradient>
  );
}

// Helper functions for generating placeholder content
function getAuraWords(mood: string): string[] {
  const moodWords: Record<string, string[]> = {
    confident: ["Grounded", "Bold", "Assured"],
    soft: ["Gentle", "Approachable", "Serene"],
    playful: ["Spirited", "Light", "Joyful"],
    mysterious: ["Intriguing", "Subtle", "Deep"],
  };
  return moodWords[mood] || ["Balanced", "Present", "Authentic"];
}

function getAffirmation(mood: string): string {
  const affirmations: Record<string, string> = {
    confident: "You carry your own warmth today.",
    soft: "Your gentleness is your strength.",
    playful: "Joy radiates from you effortlessly.",
    mysterious: "Let them wonder what your secret is.",
  };
  return affirmations[mood] || "You are exactly where you need to be.";
}

function generateEditorialExplanation(data: SessionData): string {
  const { mood, scents, occasion } = data;
  
  // Placeholder editorial copy - in production, this would come from Claude API
  const templates: Record<string, string> = {
    confident: `Today calls for something that anchors you without demanding attention. A ${scents[0]} foundation creates a quiet confidence — like wearing your favorite armor, but softer.`,
    soft: `There's beauty in subtlety today. Let the ${scents[0]} notes wrap around you like a familiar comfort, present but never overwhelming.`,
    playful: `Your energy today deserves a scent that keeps up. The ${scents[0]} character here adds just enough intrigue without taking itself too seriously.`,
    mysterious: `Some days call for a little enigma. This ${scents[0]} composition reveals itself slowly, letting others lean in to discover more.`,
  };

  const base = templates[mood] || templates.confident;
  
  if (occasion === "work") {
    return base + " Perfect for professional settings where you want to be remembered, not overwhelming.";
  } else if (occasion === "date") {
    return base + " It leaves just enough mystery for someone to want to come closer.";
  }
  
  return base;
}
