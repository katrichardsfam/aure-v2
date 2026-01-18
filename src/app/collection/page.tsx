// src/app/collection/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Scent family to gradient and accent color mapping
const scentFamilyStyles: Record<string, { gradient: string; accent: string; iconBg: string; iconGradient: string; emoji: string }> = {
  woody: { gradient: "from-amber-50 to-orange-50", accent: "bg-amber-100 text-amber-700", iconBg: "bg-amber-100", iconGradient: "from-amber-200 to-orange-200", emoji: "🪵" },
  fresh: { gradient: "from-emerald-50 to-teal-50", accent: "bg-emerald-100 text-emerald-700", iconBg: "bg-emerald-100", iconGradient: "from-emerald-200 to-teal-200", emoji: "🍃" },
  floral: { gradient: "from-rose-50 to-pink-50", accent: "bg-rose-100 text-rose-700", iconBg: "bg-rose-100", iconGradient: "from-rose-200 to-pink-200", emoji: "🌸" },
  amber: { gradient: "from-orange-50 to-amber-50", accent: "bg-orange-100 text-orange-700", iconBg: "bg-orange-100", iconGradient: "from-orange-200 to-amber-200", emoji: "✨" },
  oriental: { gradient: "from-amber-50 to-red-50", accent: "bg-red-100 text-red-700", iconBg: "bg-red-100", iconGradient: "from-amber-200 to-red-200", emoji: "🔮" },
  citrus: { gradient: "from-yellow-50 to-amber-50", accent: "bg-yellow-100 text-yellow-700", iconBg: "bg-yellow-100", iconGradient: "from-yellow-200 to-amber-200", emoji: "🍋" },
  aquatic: { gradient: "from-cyan-50 to-blue-50", accent: "bg-cyan-100 text-cyan-700", iconBg: "bg-cyan-100", iconGradient: "from-cyan-200 to-blue-200", emoji: "🌊" },
  gourmand: { gradient: "from-orange-50 to-amber-50", accent: "bg-orange-100 text-orange-700", iconBg: "bg-orange-100", iconGradient: "from-orange-200 to-amber-200", emoji: "🍯" },
  green: { gradient: "from-lime-50 to-emerald-50", accent: "bg-lime-100 text-lime-700", iconBg: "bg-lime-100", iconGradient: "from-lime-200 to-emerald-200", emoji: "🌿" },
  powdery: { gradient: "from-violet-50 to-pink-50", accent: "bg-violet-100 text-violet-700", iconBg: "bg-violet-100", iconGradient: "from-violet-200 to-pink-200", emoji: "☁️" },
  musky: { gradient: "from-stone-100 to-neutral-50", accent: "bg-stone-200 text-stone-700", iconBg: "bg-stone-200", iconGradient: "from-stone-300 to-neutral-200", emoji: "🌙" },
};

const defaultStyle = { gradient: "from-stone-50 to-amber-50", accent: "bg-stone-100 text-stone-600", iconBg: "bg-stone-100", iconGradient: "from-stone-200 to-amber-200", emoji: "✨" };

// Image component with loading state and error fallback
function FragranceImage({
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
    // Placeholder with scent family styling
    return (
      <div className={`aspect-square rounded-xl flex items-center justify-center bg-gradient-to-br ${styles.iconGradient}`}>
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl">{styles.emoji}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-xl overflow-hidden relative bg-stone-100">
      {isLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br ${styles.iconGradient} animate-pulse`} />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function CollectionPage() {
  const { user, isLoaded: isUserLoaded } = useUser();

  // Fetch user's perfume collection from Convex
  const collection = useQuery(
    api.userPerfumes.getCollection,
    user?.id ? { userId: user.id } : "skip"
  );

  const isLoading = !isUserLoaded || collection === undefined;
  const isEmpty = collection?.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Header */}
      <header className="px-6 pt-12 pb-8">
        <Link
          href="/"
          className="font-inter text-sm text-stone-500 mb-4 block hover:text-stone-700 transition-colors"
        >
          ← Home
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-cormorant font-light text-3xl text-stone-900"
        >
          Your Vault
        </motion.h1>
      </header>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
          <p className="font-inter text-stone-500 mt-4">Loading your vault...</p>
        </div>
      ) : isEmpty ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24 px-6 text-center"
        >
          <p className="font-inter text-stone-500 mb-8">
            Your collection starts here.
          </p>
          <Link href="/collection/add">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="font-inter text-stone-800 border-2 border-stone-300 px-8 py-3 rounded-full hover:border-stone-800 transition-colors"
            >
              [ + Add a fragrance ]
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        /* Collection Grid */
        <div className="px-6 pb-32">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {collection.map((item, index) => {
              const scentFamily = item.perfume?.scentFamily?.toLowerCase() || "";
              const styles = scentFamilyStyles[scentFamily] || defaultStyle;

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={`bg-gradient-to-br ${styles.gradient} rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                >
                  {/* Fragrance image or placeholder */}
                  <div className="mb-3">
                    <FragranceImage
                      src={item.perfume?.imageUrl}
                      alt={item.perfume?.name || "Fragrance"}
                      styles={styles}
                    />
                  </div>

                  {/* Name */}
                  <h3 className="font-cormorant font-normal text-lg text-stone-800 leading-tight line-clamp-2">
                    {item.perfume?.name}
                  </h3>

                  {/* House */}
                  <p className="font-inter text-sm text-stone-500 mt-1 truncate">
                    {item.perfume?.house}
                  </p>

                  {/* Scent family badge */}
                  {item.perfume?.scentFamily && (
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full font-inter text-xs capitalize ${styles.accent}`}>
                      {item.perfume.scentFamily}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Fixed bottom CTA - only show when collection has items */}
      {!isLoading && !isEmpty && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-amber-50/50 via-stone-50/80 to-transparent">
          <Link href="/collection/add">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-stone-800 text-white font-inter px-6 py-4 rounded-full hover:bg-stone-900 transition-colors"
            >
              Add a fragrance
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  );
}
