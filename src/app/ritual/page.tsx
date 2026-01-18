// src/app/ritual/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import {
  fetchWeatherForCurrentLocation,
} from "@/lib/weather";
import { MOODS } from "@/lib/constants";
import OutfitInput, { type OutfitAnalysis } from "@/components/OutfitInput";
import { Sparkles } from "lucide-react";

const OCCASIONS = ["Work", "Date", "Casual", "Event", "Home"] as const;
const VENUES = ["Indoors", "Outdoors", "Both"] as const;

type RitualStep = "outfit" | "occasion" | "venue" | "weather";

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  location?: string;
}

export default function RitualPage() {
  const router = useRouter();
  const { user } = useUser();

  // Step management
  const [currentStep, setCurrentStep] = useState<RitualStep>("outfit");

  // AI analysis from outfit
  const [outfitAnalysis, setOutfitAnalysis] = useState<OutfitAnalysis | null>(null);
  const [outfitImageUrl, setOutfitImageUrl] = useState<string | null>(null);

  // User selections
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [selectedScentDirections, setSelectedScentDirections] = useState<string[]>([]);

  // Handle mood selection (up to 3)
  const handleMoodSelect = (mood: string) => {
    setSelectedMoods((prev) => {
      if (prev.includes(mood)) {
        // Remove if already selected
        return prev.filter((m) => m !== mood);
      }
      if (prev.length < 3) {
        // Add if under limit
        return [...prev, mood];
      }
      // At limit - replace oldest
      return [...prev.slice(1), mood];
    });
  };

  // Weather
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [editingWeather, setEditingWeather] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  const createSession = useMutation(api.sessions.createWithRecommendation);

  // Fetch weather on mount
  useEffect(() => {
    sessionStorage.removeItem("ritual_occasion");
    sessionStorage.removeItem("ritual_venue");
    sessionStorage.removeItem("ritual_weather");

    async function loadWeather() {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const weatherData = await fetchWeatherForCurrentLocation();
        if (weatherData) {
          const tempF = Math.round((weatherData.temperature * 9) / 5 + 32);
          setWeather({
            temperature: tempF,
            humidity: weatherData.humidity,
            condition: weatherData.condition,
            location: weatherData.location,
          });
        } else {
          setWeatherError("Could not detect location");
          setWeather({
            temperature: 68,
            humidity: 50,
            condition: "Partly cloudy",
          });
        }
      } catch {
        setWeatherError("Weather unavailable");
        setWeather({
          temperature: 68,
          humidity: 50,
          condition: "Partly cloudy",
        });
      } finally {
        setWeatherLoading(false);
      }
    }

    loadWeather();
  }, []);

  // Helper to get temperature category from Fahrenheit
  const getTemperatureCategory = (temp: number): "hot" | "warm" | "mild" | "cool" | "cold" => {
    if (temp >= 85) return "hot";
    if (temp >= 70) return "warm";
    if (temp >= 55) return "mild";
    if (temp >= 40) return "cool";
    return "cold";
  };

  // Handle outfit analysis complete
  const handleOutfitAnalysisComplete = (analysis: OutfitAnalysis, imageUrl: string | null) => {
    setOutfitAnalysis(analysis);
    setOutfitImageUrl(imageUrl);

    // Pre-fill from AI suggestions
    if (analysis.moodInference) {
      setSelectedMoods([analysis.moodInference]);
    }
    if (analysis.scentDirections.length > 0) {
      setSelectedScentDirections(analysis.scentDirections);
    }

    // Move to next step
    setCurrentStep("occasion");
  };

  // Handle skip outfit
  const handleSkipOutfit = () => {
    setCurrentStep("occasion");
  };

  // Handle reveal aura
  const handleRevealAura = async () => {
    if (!selectedOccasion || !user?.id) return;

    setIsLoading(true);
    try {
      const sessionId = await createSession({
        userId: user.id,
        outfitStyles: outfitAnalysis?.styleCategories || [],
        mood: selectedMoods[0] || "confident",
        scentDirections: selectedScentDirections,
        occasion: selectedOccasion,
        outfitImageUrl: outfitImageUrl || undefined,
        weather: weather ? {
          temperature: weather.temperature,
          temperatureCategory: getTemperatureCategory(weather.temperature),
          humidity: weather.humidity,
          condition: weather.condition,
          location: weather.location,
          isManual: editingWeather,
        } : undefined,
      });

      router.push(`/aura?session=${sessionId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      setIsLoading(false);
    }
  };

  // Calculate progress based on current step
  const getProgress = () => {
    switch (currentStep) {
      case "outfit": return 10;
      case "occasion": return selectedOccasion ? 50 : 30;
      case "venue": return 70;
      case "weather": return 90;
      default: return 10;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Progress indicator */}
      <div className="px-4 md:px-6 pt-6 flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-stone-800"
            initial={{ width: "0%" }}
            animate={{ width: `${getProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <Link
          href="/collection"
          className="ml-4 font-inter text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          Cancel
        </Link>
      </div>

      <div className="px-4 md:px-6 pt-8 pb-32 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Outfit Input */}
          {currentStep === "outfit" && (
            <motion.div
              key="outfit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OutfitInput
                onAnalysisComplete={handleOutfitAnalysisComplete}
                onSkip={handleSkipOutfit}
              />
            </motion.div>
          )}

          {/* Step 2+: Occasion, Venue, Weather */}
          {currentStep !== "outfit" && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-cormorant font-light text-3xl text-stone-900 mb-8"
              >
                What&apos;s the vibe today?
              </motion.h1>

              {/* AI Suggestion Banner */}
              {outfitAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-6 border border-amber-200/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-inter text-sm text-amber-800 font-medium">
                        AI detected your style
                      </p>
                      <p className="font-inter text-xs text-amber-700 mt-0.5">
                        {outfitAnalysis.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mood Selection (only if AI provided mood) */}
              {outfitAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-4"
                >
                  <div className="flex items-baseline justify-between mb-4">
                    <p className="font-inter text-sm text-stone-500">
                      How do you want to feel?
                      {outfitAnalysis && (
                        <span className="text-amber-600 ml-1">(AI suggested)</span>
                      )}
                    </p>
                    <span className="font-inter text-xs text-stone-400">
                      {selectedMoods.length}/3
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((mood) => (
                      <motion.button
                        key={mood.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMoodSelect(mood.value)}
                        data-selected={selectedMoods.includes(mood.value)}
                        data-ai-suggested={outfitAnalysis?.moodInference === mood.value}
                        className="px-5 py-2.5 rounded-full bg-white/50 backdrop-blur border-2 border-transparent font-inter text-sm text-stone-700 hover:border-stone-300 transition-all data-[selected=true]:bg-white data-[selected=true]:border-stone-800 data-[ai-suggested=true]:ring-2 data-[ai-suggested=true]:ring-amber-300 data-[ai-suggested=true]:ring-offset-1"
                      >
                        {mood.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Occasion card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-4"
              >
                <p className="font-inter text-sm text-stone-500 mb-4">
                  What are you doing?
                </p>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((occasion) => (
                    <motion.button
                      key={occasion}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedOccasion(occasion)}
                      data-selected={selectedOccasion === occasion}
                      className="px-5 py-2.5 rounded-full bg-white/50 backdrop-blur border-2 border-transparent font-inter text-sm text-stone-700 hover:border-stone-300 transition-all data-[selected=true]:bg-white data-[selected=true]:border-stone-800"
                    >
                      {occasion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Venue card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-4"
              >
                <p className="font-inter text-sm text-stone-500 mb-4">
                  Where will you be? <span className="text-stone-400">(optional)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {VENUES.map((venue) => (
                    <motion.button
                      key={venue}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedVenue(selectedVenue === venue ? null : venue)}
                      data-selected={selectedVenue === venue}
                      className="px-5 py-2.5 rounded-full bg-white/50 backdrop-blur border-2 border-transparent font-inter text-sm text-stone-700 hover:border-stone-300 transition-all data-[selected=true]:bg-white data-[selected=true]:border-stone-800"
                    >
                      {venue}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Weather card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-inter text-sm text-stone-500">Today&apos;s weather</p>
                    {weather?.location && !weatherLoading && (
                      <p className="font-inter text-xs text-stone-400 mt-0.5">{weather.location}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingWeather(!editingWeather)}
                    disabled={weatherLoading}
                    className="font-inter text-sm text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
                  >
                    {editingWeather ? "Done" : "Edit"}
                  </button>
                </div>
                {weatherLoading ? (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
                    <p className="font-inter text-sm text-stone-400">Detecting weather...</p>
                  </div>
                ) : weather && !editingWeather ? (
                  <div className="mt-4">
                    <p className="font-cormorant text-4xl text-stone-800">
                      {weather.temperature}°F
                    </p>
                    <p className="font-inter text-sm text-stone-500 mt-1">
                      {weather.condition} · {weather.humidity}% humidity
                    </p>
                    {weatherError && (
                      <p className="font-inter text-xs text-amber-600 mt-2">{weatherError}</p>
                    )}
                  </div>
                ) : editingWeather ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="font-inter text-xs text-stone-400 block mb-1">
                        Temperature (°F)
                      </label>
                      <input
                        type="number"
                        value={weather?.temperature || ""}
                        onChange={(e) =>
                          setWeather((prev) =>
                            prev ? { ...prev, temperature: parseInt(e.target.value) || 0 } : null
                          )
                        }
                        className="w-full border-b border-stone-200 py-2 font-inter text-stone-800 focus:outline-none focus:border-stone-400 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="font-inter text-xs text-stone-400 block mb-1">
                        Humidity (%)
                      </label>
                      <input
                        type="number"
                        value={weather?.humidity || ""}
                        onChange={(e) =>
                          setWeather((prev) =>
                            prev ? { ...prev, humidity: parseInt(e.target.value) || 0 } : null
                          )
                        }
                        className="w-full border-b border-stone-200 py-2 font-inter text-stone-800 focus:outline-none focus:border-stone-400 bg-transparent"
                      />
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed bottom CTA - only show after outfit step */}
      {currentStep !== "outfit" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white via-white to-white/0 pt-8 pb-28 px-6">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={selectedOccasion ? { scale: 1.02 } : {}}
            whileTap={selectedOccasion ? { scale: 0.98 } : {}}
            onClick={handleRevealAura}
            disabled={!selectedOccasion || isLoading}
            className={`w-full max-w-md mx-auto block font-inter py-4 px-8 rounded-full shadow-lg transition-all ${
              selectedOccasion && !isLoading
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                : "bg-gradient-to-r from-amber-500 to-amber-600 text-white opacity-50 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Revealing...
              </span>
            ) : (
              "Reveal Today's Aura"
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}
