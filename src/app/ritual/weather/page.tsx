// src/app/ritual/weather/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, MapPin, Cloud, Sun, Loader2 } from "lucide-react";
import Link from "next/link";
import { AuraGradient } from "@/components/AuraGradient";
import { Wordmark } from "@/components/Wordmark";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fetchWeatherForCurrentLocation, type WeatherData } from "@/lib/weather";
import { TEMPERATURE_CATEGORIES, WEATHER_SCENT_RECOMMENDATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type WeatherMode = "auto" | "manual" | "skip";

export default function WeatherStep() {
  const router = useRouter();
  const [mode, setMode] = useState<WeatherMode>("auto");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualTemp, setManualTemp] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "auto") {
      fetchWeather();
    }
  }, [mode]);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherForCurrentLocation();
      if (data) {
        setWeather(data);
      } else {
        setError("Could not detect location. Please set manually or skip.");
        setMode("manual");
      }
    } catch {
      setError("Weather service unavailable.");
      setMode("manual");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (mode === "skip") {
      sessionStorage.setItem("ritual_weather", JSON.stringify(null));
    } else if (weather) {
      sessionStorage.setItem("ritual_weather", JSON.stringify({
        temperature: weather.temperature,
        temperatureCategory: weather.temperatureCategory,
        humidity: weather.humidity,
        humidityCategory: weather.humidityCategory,
        condition: weather.condition,
        location: weather.location,
        isManual: mode === "manual",
      }));
    } else if (manualTemp) {
      sessionStorage.setItem("ritual_weather", JSON.stringify({
        temperatureCategory: manualTemp,
        isManual: true,
      }));
    }
    
    // Navigate to aura result
    router.push("/aura");
  };

  const weatherTip = weather 
    ? WEATHER_SCENT_RECOMMENDATIONS[weather.temperatureCategory]
    : manualTemp 
    ? WEATHER_SCENT_RECOMMENDATIONS[manualTemp as keyof typeof WEATHER_SCENT_RECOMMENDATIONS]
    : null;

  const canContinue = mode === "skip" || weather || manualTemp;

  return (
    <AuraGradient>
      <div className="min-h-screen px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/collection">
            <Wordmark size="sm" />
          </Link>
          <span className="text-stone-400 text-sm">5 of 5</span>
        </div>

        <ProgressBar currentStep={5} totalSteps={5} />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 pb-32"
        >
          <h1 className="font-cormorant text-3xl text-stone-800 mb-2">
            What&apos;s the weather?
          </h1>
          <p className="text-stone-500 mb-8">
            Weather affects how fragrance performs. This is optional.
          </p>

          {/* Auto-detected weather */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
            </div>
          )}

          {weather && mode === "auto" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-stone-200 mb-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    {weather.location}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-cormorant text-stone-800">
                      {Math.round(weather.temperature)}°
                    </span>
                    <div className="text-stone-600">
                      {weather.condition.toLowerCase().includes("cloud") 
                        ? <Cloud className="w-8 h-8" />
                        : <Sun className="w-8 h-8" />
                      }
                    </div>
                  </div>
                  <p className="text-stone-500 text-sm mt-2">
                    {weather.condition} · {weather.humidity}% humidity
                  </p>
                </div>
                <button
                  onClick={() => setMode("manual")}
                  className="text-stone-400 hover:text-stone-600 text-sm underline"
                >
                  Edit
                </button>
              </div>
            </motion.div>
          )}

          {/* Manual selection */}
          {(mode === "manual" || error) && !loading && (
            <div className="space-y-3 mb-6">
              <p className="text-stone-500 text-sm mb-4">
                {error || "Select the weather condition:"}
              </p>
              {Object.entries(TEMPERATURE_CATEGORIES).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setManualTemp(key)}
                  className={cn(
                    "w-full p-4 rounded-2xl text-left transition-all duration-300",
                    "border-2 backdrop-blur-sm",
                    manualTemp === key
                      ? "border-stone-800 bg-stone-800/5"
                      : "border-stone-200 bg-white/50 hover:border-stone-300"
                  )}
                >
                  <span className={cn(
                    "font-cormorant text-lg block",
                    manualTemp === key ? "text-stone-900" : "text-stone-700"
                  )}>
                    {data.label}
                  </span>
                  <span className="text-sm text-stone-500">
                    {data.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Weather tip */}
          {weatherTip && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/50"
            >
              <p className="text-amber-800 text-sm">
                <span className="font-medium">Tip:</span> {weatherTip.note}
              </p>
            </motion.div>
          )}

          {/* Skip option */}
          {!weather && mode !== "skip" && (
            <button
              onClick={() => setMode("skip")}
              className="w-full mt-6 py-3 text-stone-400 hover:text-stone-600 text-sm transition-colors"
            >
              Skip weather context
            </button>
          )}

          {mode === "skip" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-2xl bg-stone-100/50 border border-stone-200 text-center"
            >
              <p className="text-stone-500 text-sm">
                No weather context will be used for your recommendation.
              </p>
              <button
                onClick={() => setMode("auto")}
                className="text-stone-600 hover:text-stone-800 text-sm underline mt-2"
              >
                Try detecting again
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={() => router.push("/ritual/occasion")}
              className="p-4 border-2 border-stone-300 rounded-full text-stone-600 hover:border-stone-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="flex-1 py-4 bg-stone-800 text-white rounded-full font-cormorant text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700 transition-colors"
            >
              See My Aura
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </AuraGradient>
  );
}
