// src/components/ui/WeatherCard.tsx
"use client";

import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Snowflake, MapPin } from "lucide-react";
import type { WeatherData } from "@/lib/weather";

interface WeatherCardProps {
  weather: WeatherData;
  onEdit?: () => void;
}

export function WeatherCard({ weather, onEdit }: WeatherCardProps) {
  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase();
    if (condition.includes("rain")) return <CloudRain className="w-8 h-8" />;
    if (condition.includes("snow")) return <Snowflake className="w-8 h-8" />;
    if (condition.includes("cloud")) return <Cloud className="w-8 h-8" />;
    return <Sun className="w-8 h-8" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-stone-200"
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
              {getWeatherIcon()}
            </div>
          </div>
          <p className="text-stone-500 text-sm mt-2">
            {weather.condition} · {weather.humidity}% humidity
          </p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-stone-400 hover:text-stone-600 text-sm underline"
          >
            Edit
          </button>
        )}
      </div>
    </motion.div>
  );
}
