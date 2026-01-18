"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Sparkles, Plus, Droplets } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Scent family to gradient and placeholder mapping
const scentFamilyStyles: Record<string, { gradient: string; placeholderBg: string; accent: string }> = {
  woody: { gradient: "from-amber-50 to-orange-50", placeholderBg: "from-amber-100 to-orange-100", accent: "text-amber-700" },
  fresh: { gradient: "from-emerald-50 to-teal-50", placeholderBg: "from-emerald-100 to-teal-100", accent: "text-emerald-700" },
  floral: { gradient: "from-rose-50 to-pink-50", placeholderBg: "from-rose-100 to-pink-100", accent: "text-rose-700" },
  amber: { gradient: "from-orange-50 to-amber-50", placeholderBg: "from-orange-100 to-amber-100", accent: "text-orange-700" },
  oriental: { gradient: "from-amber-50 to-red-50", placeholderBg: "from-amber-100 to-red-100", accent: "text-red-700" },
  citrus: { gradient: "from-yellow-50 to-amber-50", placeholderBg: "from-yellow-100 to-amber-100", accent: "text-yellow-700" },
  aquatic: { gradient: "from-cyan-50 to-blue-50", placeholderBg: "from-cyan-100 to-blue-100", accent: "text-cyan-700" },
  gourmand: { gradient: "from-orange-50 to-amber-50", placeholderBg: "from-orange-100 to-amber-100", accent: "text-orange-700" },
  green: { gradient: "from-lime-50 to-emerald-50", placeholderBg: "from-lime-100 to-emerald-100", accent: "text-lime-700" },
  powdery: { gradient: "from-violet-50 to-pink-50", placeholderBg: "from-violet-100 to-pink-100", accent: "text-violet-700" },
  musky: { gradient: "from-stone-100 to-neutral-100", placeholderBg: "from-stone-200 to-neutral-200", accent: "text-stone-600" },
};

const defaultStyle = { gradient: "from-stone-50 to-amber-50", placeholderBg: "from-stone-100 to-amber-100", accent: "text-stone-600" };

// Image component with loading state and fallback
function VibeImage({
  src,
  alt,
  styles
}: {
  src?: string;
  alt: string;
  styles: typeof defaultStyle;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`h-full rounded-lg flex items-center justify-center bg-gradient-to-br ${styles.placeholderBg} relative overflow-hidden`}>
        <Droplets className={`w-8 h-8 ${styles.accent} opacity-40`} />
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg overflow-hidden relative bg-white/80">
      {isLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br ${styles.placeholderBg} animate-pulse`} />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 20vw"
        className={`object-contain p-1 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function VibesPage() {
  const vibes = useQuery(api.vibes.getUserVibes);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30">
      <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-4 md:px-6 pt-12 pb-6">
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
      <div className="px-4 md:px-6 pb-24">
        {vibes === undefined ? (
          // Loading state
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-full aspect-square bg-stone-100 rounded-lg animate-pulse"
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
          // Vibes grid - compact square cards
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {vibes.map((vibe, index) => {
              const styles =
                scentFamilyStyles[vibe.scentFamily?.toLowerCase()] || defaultStyle;

              return (
                <motion.div
                  key={vibe._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="w-full"
                >
                  <Link href={`/vibes/${vibe._id}`}>
                    <div
                      className={`bg-gradient-to-br ${styles.gradient} rounded-xl p-3 border border-white/60 shadow-sm hover:shadow-md transition-all aspect-square flex flex-col`}
                    >
                      {/* Vibe name */}
                      <p className="font-cormorant font-medium text-sm text-stone-800 line-clamp-1 mb-2">
                        {vibe.name}
                      </p>

                      {/* Perfume image - larger in square card */}
                      <div className="flex-1 min-h-0">
                        <VibeImage
                          src={vibe.imageUrl}
                          alt={vibe.perfumeName}
                          styles={styles}
                        />
                      </div>

                      {/* Perfume name */}
                      <p className="font-inter text-[11px] text-stone-600 truncate mt-2">
                        {vibe.perfumeName}
                      </p>

                      {/* Aura words */}
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {vibe.auraWords.slice(0, 2).map((word, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 bg-white/60 rounded-full text-stone-500"
                          >
                            {word}
                          </span>
                        ))}
                      </div>

                      {/* Occasion badge */}
                      {vibe.occasion && (
                        <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 bg-stone-800/10 rounded text-stone-600">
                          {vibe.occasion}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      </div>
    </div>
  );
}
