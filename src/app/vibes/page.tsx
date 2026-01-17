"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import Link from "next/link";

// Scent family to gradient mapping
const scentFamilyColors: Record<string, string> = {
  woody: "from-amber-50 to-orange-50",
  fresh: "from-emerald-50 to-teal-50",
  floral: "from-rose-50 to-pink-50",
  amber: "from-orange-50 to-amber-50",
  oriental: "from-amber-50 to-red-50",
  citrus: "from-yellow-50 to-amber-50",
  aquatic: "from-cyan-50 to-blue-50",
  gourmand: "from-orange-50 to-amber-50",
  green: "from-lime-50 to-emerald-50",
  powdery: "from-violet-50 to-pink-50",
  musky: "from-stone-100 to-neutral-50",
};

export default function VibesPage() {
  const vibes = useQuery(api.vibes.getUserVibes);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-cormorant font-light text-3xl text-stone-900">
              Your Vibes
            </h1>
            <p className="text-stone-500 mt-1">Saved scent moments</p>
          </div>
          <Link
            href="/ritual"
            className="p-3 bg-stone-800 text-white rounded-full shadow-lg hover:bg-stone-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>

      {/* Vibes Grid */}
      <div className="px-6 pb-24">
        {vibes === undefined ? (
          // Loading state
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-stone-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : vibes.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="font-cormorant text-2xl text-stone-800 mb-2">
              No vibes saved yet
            </h2>
            <p className="text-stone-500 mb-8 max-w-xs mx-auto">
              Complete a ritual and save your first vibe to start your
              collection
            </p>
            <Link
              href="/ritual"
              className="inline-flex items-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-full hover:bg-stone-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Start a ritual
            </Link>
          </motion.div>
        ) : (
          // Vibes grid
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            {vibes.map((vibe, index) => {
              const gradient =
                scentFamilyColors[vibe.scentFamily?.toLowerCase()] ||
                scentFamilyColors.woody;

              return (
                <motion.div
                  key={vibe._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/vibes/${vibe._id}`}>
                    <div
                      className={`aspect-square bg-gradient-to-br ${gradient} rounded-2xl p-4 flex flex-col justify-between border border-white/60 shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <div>
                        <p className="font-cormorant text-lg text-stone-800 line-clamp-2">
                          {vibe.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 truncate">
                          {vibe.perfumeName}
                        </p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {vibe.auraWords.slice(0, 2).map((word, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-white/60 rounded-full text-stone-600"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
