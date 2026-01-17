// src/app/ritual/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

const OCCASIONS = ["Work", "Date", "Casual", "Event", "Home"] as const;
const VENUES = ["Indoors", "Outdoors", "Both"] as const;

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
}

export default function RitualPage() {
  const router = useRouter();
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [editingWeather, setEditingWeather] = useState(false);

  // Clear previous session and simulate weather fetch
  useEffect(() => {
    sessionStorage.removeItem("ritual_occasion");
    sessionStorage.removeItem("ritual_venue");
    sessionStorage.removeItem("ritual_weather");
    
    // Simulate auto-detected weather (replace with real API call)
    setWeather({
      temperature: 72,
      humidity: 45,
      condition: "Partly cloudy",
    });
  }, []);

  const handleFindScent = () => {
    console.log("Button clicked! selectedOccasion:", selectedOccasion);
    // Start the multi-step ritual flow
    router.push("/ritual/style");
  };

  // Calculate progress based on selections
  const progress = selectedOccasion ? (selectedVenue ? 75 : 50) : 25;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Progress indicator */}
      <div className="px-6 pt-6 flex items-center justify-between">
        <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-stone-800"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
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

      <div className="px-6 pt-12 pb-32">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-cormorant font-light text-3xl text-stone-900 mb-8"
        >
          What&apos;s the vibe today?
        </motion.h1>

        {/* Event card */}
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

        {/* Weather card (auto-filled) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6"
        >
          <div className="flex justify-between items-start">
            <p className="font-inter text-sm text-stone-500">Today&apos;s weather</p>
            <button
              onClick={() => setEditingWeather(!editingWeather)}
              className="font-inter text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              {editingWeather ? "Done" : "Edit"}
            </button>
          </div>
          {weather && !editingWeather && (
            <div className="mt-4">
              <p className="font-cormorant text-4xl text-stone-800">
                {weather.temperature}°F
              </p>
              <p className="font-inter text-sm text-stone-500 mt-1">
                {weather.condition} · {weather.humidity}% humidity
              </p>
            </div>
          )}
          {editingWeather && (
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
          )}
        </motion.div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFindScent}
          className="w-full font-inter px-6 py-4 rounded-full transition-colors bg-stone-800 text-white hover:bg-stone-900"
        >
          Find my scent
        </motion.button>
      </div>
    </div>
  );
}
