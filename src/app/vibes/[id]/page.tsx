"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Sparkles, Calendar } from "lucide-react";

const AURA_GRADIENTS: Record<string, string> = {
  fresh: "from-lime-50 via-emerald-50 to-cyan-50",
  floral: "from-pink-50 via-rose-50 to-fuchsia-50",
  woody: "from-amber-50 via-stone-100 to-orange-50",
  amber: "from-orange-50 via-amber-50 to-yellow-50",
  gourmand: "from-amber-50 via-orange-50 to-rose-50",
  musky: "from-stone-100 via-zinc-50 to-slate-50",
  default: "from-stone-50 via-white to-stone-100",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function VibeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vibeId = params.id as string;

  const vibe = useQuery(api.vibes.getVibe, {
    vibeId: vibeId as Id<"vibes">,
  });

  // Loading state
  if (vibe === undefined) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Not found state
  if (vibe === null) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6">
        <p className="font-inter text-stone-500 mb-4">
          This vibe couldn&apos;t be found.
        </p>
        <Link
          href="/vibes"
          className="font-inter text-amber-600 hover:text-amber-700"
        >
          &larr; Back to your vibes
        </Link>
      </div>
    );
  }

  const gradient =
    AURA_GRADIENTS[vibe.scentFamily?.toLowerCase() || "default"] ||
    AURA_GRADIENTS.default;

  const formattedDate = vibe.createdAt
    ? new Date(vibe.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleStyleAgain = () => {
    router.push("/ritual");
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient}`}>
      {/* Floating orbs for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-48 h-48 bg-amber-100/30 rounded-full blur-3xl" />
      </div>

      {/* Header with back navigation */}
      <header className="relative z-10 px-6 pt-12 pb-4">
        <Link
          href="/vibes"
          className="inline-flex items-center gap-2 font-inter text-sm text-stone-600 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to vibes
        </Link>
      </header>

      {/* Main content */}
      <motion.main
        className="relative z-10 px-6 pt-4 pb-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title and date */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-cormorant font-light text-4xl text-stone-900 mb-2">
            {vibe.name}
          </h1>
          {formattedDate && (
            <div className="flex items-center gap-2 text-stone-500">
              <Calendar className="w-4 h-4" />
              <span className="font-inter text-sm">{formattedDate}</span>
            </div>
          )}
        </motion.div>

        {/* Visual board - glass card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-white/50 shadow-lg"
        >
          {/* Perfume display */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="font-inter text-sm text-stone-500 uppercase tracking-wide">
                The Scent
              </span>
            </div>

            {/* Main perfume card */}
            <div className="flex items-center gap-4 bg-white/60 rounded-2xl p-4">
              {/* Perfume visual */}
              <div className="w-16 h-16 bg-gradient-to-br from-stone-100 to-stone-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl">
                  {vibe.scentFamily === "floral"
                    ? "\u{1F338}"
                    : vibe.scentFamily === "fresh"
                      ? "\u{1F343}"
                      : vibe.scentFamily === "woody"
                        ? "\u{1FAB5}"
                        : vibe.scentFamily === "amber"
                          ? "\u{2728}"
                          : vibe.scentFamily === "gourmand"
                            ? "\u{1F36B}"
                            : vibe.scentFamily === "musky"
                              ? "\u{1F311}"
                              : "\u{2728}"}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-cormorant text-xl text-stone-800">
                  {vibe.perfumeName}
                </p>
                <p className="font-inter text-sm text-stone-500">
                  {vibe.perfumeHouse}
                </p>
                {vibe.scentFamily && (
                  <span className="inline-block mt-2 px-3 py-1 bg-white/60 rounded-full text-xs font-inter text-stone-600 capitalize">
                    {vibe.scentFamily}
                  </span>
                )}
              </div>
            </div>

            {/* Aura words */}
            {vibe.auraWords && vibe.auraWords.length > 0 && (
              <div className="pt-2">
                <p className="font-inter text-xs text-stone-400 uppercase tracking-wide mb-2">
                  Aura
                </p>
                <div className="flex flex-wrap gap-2">
                  {vibe.auraWords.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-white/50 rounded-full font-inter text-sm text-stone-600"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Notes section */}
        {vibe.notes && (
          <motion.div
            variants={itemVariants}
            className="bg-white/30 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/40"
          >
            <p className="font-inter text-sm text-stone-500 mb-2">Your notes</p>
            <p className="font-inter text-stone-700 italic leading-relaxed">
              &ldquo;{vibe.notes}&rdquo;
            </p>
          </motion.div>
        )}

        {/* Context tags */}
        {(vibe.occasion || vibe.mood) && (
          <motion.div variants={itemVariants}>
            <p className="font-inter text-sm text-stone-500 mb-3">
              The vibe was...
            </p>
            <div className="flex flex-wrap gap-2">
              {vibe.mood && (
                <span className="px-4 py-2 bg-white/40 backdrop-blur rounded-full font-inter text-sm text-stone-600 capitalize">
                  {vibe.mood}
                </span>
              )}
              {vibe.occasion && (
                <span className="px-4 py-2 bg-white/40 backdrop-blur rounded-full font-inter text-sm text-stone-600 capitalize">
                  {vibe.occasion}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </motion.main>

      {/* Fixed CTA at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStyleAgain}
          className="w-full bg-stone-800 text-white font-inter px-6 py-4 rounded-full shadow-lg hover:bg-stone-900 transition-colors"
        >
          Style this vibe again
        </motion.button>
      </div>
    </div>
  );
}
