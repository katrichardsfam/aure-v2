"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Flame, Calendar, Heart } from "lucide-react";

// Scent family metadata for narrative generation and styling
const SCENT_FAMILIES: Record<
  string,
  {
    emoji: string;
    gradient: string;
    barGradient: string;
    bgGradient: string;
    trait: string;
    narrative: string;
  }
> = {
  fresh: {
    emoji: "\u{1F343}",
    gradient: "from-emerald-400 to-cyan-400",
    barGradient: "from-emerald-400 via-cyan-400 to-emerald-200",
    bgGradient: "from-emerald-50 via-cyan-50/30 to-stone-50",
    trait: "clarity-seeking",
    narrative: "You carry the bright energy of citrus and green notes — refreshing, optimistic, with a clarity that awakens the senses.",
  },
  floral: {
    emoji: "\u{1F338}",
    gradient: "from-pink-400 to-rose-400",
    barGradient: "from-pink-400 via-rose-400 to-pink-200",
    bgGradient: "from-pink-50 via-rose-50/30 to-stone-50",
    trait: "romantic",
    narrative: "Your aura blooms with floral elegance — soft, romantic, with a beauty that unfolds like petals in morning light.",
  },
  woody: {
    emoji: "\u{1FAB5}",
    gradient: "from-amber-500 to-orange-400",
    barGradient: "from-amber-500 via-orange-400 to-amber-200",
    bgGradient: "from-amber-50 via-orange-50/30 to-stone-50",
    trait: "grounded",
    narrative: "You carry the quiet confidence of woods and earth — grounding, warm, with a depth that lingers long after you've gone.",
  },
  amber: {
    emoji: "\u{2728}",
    gradient: "from-orange-400 to-amber-400",
    barGradient: "from-orange-400 via-amber-400 to-yellow-200",
    bgGradient: "from-orange-50 via-amber-50/30 to-stone-50",
    trait: "warm-hearted",
    narrative: "Your presence radiates amber warmth — inviting, comforting, like golden light on a late afternoon.",
  },
  gourmand: {
    emoji: "\u{1F36F}",
    gradient: "from-amber-400 to-rose-400",
    barGradient: "from-amber-400 via-rose-300 to-amber-200",
    bgGradient: "from-amber-50 via-rose-50/20 to-stone-50",
    trait: "sensual",
    narrative: "You embody indulgence — sweet, sensual notes that speak of pleasure and the art of savoring life's richness.",
  },
  musky: {
    emoji: "\u{1F319}",
    gradient: "from-slate-400 to-zinc-400",
    barGradient: "from-slate-400 via-zinc-400 to-slate-200",
    bgGradient: "from-stone-100 via-zinc-50/30 to-stone-50",
    trait: "intimate",
    narrative: "Your scent signature whispers rather than shouts — intimate, subtle, drawing others closer to discover your mystery.",
  },
  oriental: {
    emoji: "\u{1F52E}",
    gradient: "from-purple-400 to-pink-400",
    barGradient: "from-purple-400 via-pink-400 to-purple-200",
    bgGradient: "from-purple-50 via-pink-50/30 to-stone-50",
    trait: "mysterious",
    narrative: "You wear mystery like a second skin — complex, intriguing, with layers that reveal themselves slowly over time.",
  },
  aquatic: {
    emoji: "\u{1F30A}",
    gradient: "from-cyan-400 to-blue-400",
    barGradient: "from-cyan-400 via-blue-400 to-cyan-200",
    bgGradient: "from-cyan-50 via-blue-50/30 to-stone-50",
    trait: "free-spirited",
    narrative: "Your aura flows with oceanic freedom — fresh, boundless, like an endless horizon calling to adventure.",
  },
  green: {
    emoji: "\u{1F33F}",
    gradient: "from-green-400 to-emerald-400",
    barGradient: "from-green-400 via-emerald-400 to-green-200",
    bgGradient: "from-green-50 via-emerald-50/30 to-stone-50",
    trait: "natural",
    narrative: "You carry nature's authenticity — verdant, alive, with the honest freshness of a garden after rain.",
  },
  powdery: {
    emoji: "\u{2601}",
    gradient: "from-violet-400 to-pink-300",
    barGradient: "from-violet-400 via-pink-300 to-violet-200",
    bgGradient: "from-violet-50 via-pink-50/30 to-stone-50",
    trait: "gentle",
    narrative: "Your presence is soft as clouds — gentle, nostalgic, evoking tender memories and quiet comfort.",
  },
};

const DEFAULT_FAMILY = {
  emoji: "\u{2728}",
  gradient: "from-amber-400 to-stone-400",
  barGradient: "from-amber-400 via-stone-400 to-amber-200",
  bgGradient: "from-stone-50 via-amber-50/20 to-stone-100",
  trait: "evolving",
  narrative: "Your scent story is beautifully unique — a blend of influences that defies easy categorization.",
};

// Type for stats from Convex
interface WearStats {
  totalWears: number;
  currentStreak: number;
  favoriteFamily: string | null;
  favoritePerfume: { name: string; house: string; wearCount: number } | null;
  familyBreakdown: Array<{ family: string; percentage: number }>;
  uniquePerfumes: number;
  firstWear: number | null;
  lastWear: number | null;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function AuraProfilePage() {
  const stats = useQuery(api.wearLog.getWearStats) as WearStats | null | undefined;

  // Loading state
  if (stats === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 animate-pulse mx-auto mb-4" />
          <p className="text-stone-400 font-inter text-sm">Revealing your aura...</p>
        </div>
      </div>
    );
  }

  // Check if user has data
  const hasData = stats && stats.totalWears > 0;

  // Get dominant family styling
  const dominantFamily = stats?.favoriteFamily || null;
  const familyMeta = dominantFamily
    ? (SCENT_FAMILIES[dominantFamily] || DEFAULT_FAMILY)
    : DEFAULT_FAMILY;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${familyMeta.bgGradient}`}>
      {/* Atmospheric background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-56 h-56 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      </div>

      <motion.main
        className="relative z-10 px-6 pt-12 pb-32 max-w-lg mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full mb-6 border border-white/60">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-inter text-sm text-stone-600">Your Aura</span>
          </div>
          <h1 className="font-cormorant font-light text-4xl text-stone-900 leading-tight">
            {hasData ? "Your Scent Story" : "Your Aura Awaits"}
          </h1>
        </motion.div>

        {/* Empty State */}
        {!hasData && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="w-24 h-24 bg-white/60 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-white/80">
              <span className="text-5xl">✨</span>
            </div>
            <h2 className="font-cormorant text-2xl text-stone-800 mb-3">
              Your aura is still forming...
            </h2>
            <p className="font-inter text-stone-500 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
              Wear some scents and your profile will evolve into a beautiful reflection of your fragrance journey.
            </p>
            <Link href="/ritual">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-inter rounded-full hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
              >
                Start your journey
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Content when user has data */}
        {hasData && stats && (
          <>
            {/* Hero Narrative */}
            <motion.div
              variants={itemVariants}
              className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/60 shadow-sm"
            >
              <p className="font-cormorant text-xl text-stone-700 leading-relaxed text-center italic">
                &ldquo;{familyMeta.narrative}&rdquo;
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/60">
                <p className="font-cormorant text-3xl text-stone-800">
                  {stats.totalWears}
                </p>
                <p className="font-inter text-xs text-stone-500 mt-1">wears</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/60">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <p className="font-cormorant text-3xl text-stone-800">
                    {stats.currentStreak}
                  </p>
                </div>
                <p className="font-inter text-xs text-stone-500 mt-1">day streak</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/60">
                <p className="font-cormorant text-3xl text-stone-800">
                  {stats.uniquePerfumes}
                </p>
                <p className="font-inter text-xs text-stone-500 mt-1">fragrances</p>
              </div>
            </motion.div>

            {/* Scent Family Breakdown */}
            {stats.familyBreakdown.length > 0 && (
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="font-inter text-xs text-stone-500 uppercase tracking-widest mb-4">
                  Your Scent Signatures
                </h2>
                <div className="space-y-3">
                  {stats.familyBreakdown.slice(0, 4).map((item, index) => {
                    const meta = SCENT_FAMILIES[item.family] || DEFAULT_FAMILY;
                    return (
                      <div
                        key={item.family}
                        className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{meta.emoji}</span>
                            <div>
                              <p className="font-cormorant text-lg text-stone-800 capitalize">
                                {item.family}
                              </p>
                              <p className="font-inter text-xs text-stone-500">
                                {meta.trait}
                              </p>
                            </div>
                          </div>
                          <span className="font-cormorant text-2xl text-stone-700">
                            {item.percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-stone-200/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                            className={`h-full bg-gradient-to-r ${meta.barGradient} rounded-full`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Signature Perfume */}
            {stats.favoritePerfume && (
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="font-inter text-xs text-stone-500 uppercase tracking-widest mb-4">
                  Your Signature
                </h2>
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-white/60">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center shadow-sm">
                      <Heart className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-cormorant text-xl text-stone-800">
                        {stats.favoritePerfume.name}
                      </p>
                      <p className="font-inter text-sm text-stone-500">
                        {stats.favoritePerfume.house}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-cormorant text-2xl text-amber-600">
                        {stats.favoritePerfume.wearCount}
                      </p>
                      <p className="font-inter text-xs text-stone-400">wears</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Journey Start Date */}
            {stats.firstWear && (
              <motion.div variants={itemVariants} className="text-center pt-4">
                <div className="inline-flex items-center gap-2 text-stone-400">
                  <Calendar className="w-4 h-4" />
                  <span className="font-inter text-sm">
                    Journey began{" "}
                    {new Date(stats.firstWear).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.main>
    </div>
  );
}
