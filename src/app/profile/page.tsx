"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";

// ===========================================
// COMING SOON PLACEHOLDER
// Enable the full implementation below once
// the wearLog Convex functions are deployed
// ===========================================

export default function AuraProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
      {/* Atmospheric background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-56 h-56 bg-rose-100/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Icon */}
          <div className="w-20 h-20 bg-white/60 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/80">
            <Sparkles className="w-10 h-10 text-amber-600" />
          </div>

          {/* Title */}
          <h1 className="font-cormorant font-light text-3xl text-stone-900 mb-3">
            Aura Profile
          </h1>

          {/* Subtitle */}
          <p className="font-inter text-stone-500 mb-2">
            Coming soon
          </p>
          <p className="font-inter text-sm text-stone-400 max-w-xs mx-auto mb-8">
            Discover your evolving scent story and see patterns in your fragrance choices
          </p>

          {/* CTA */}
          <Link href="/ritual">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-inter rounded-full hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
            >
              Start a Ritual
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// ===========================================
// FULL IMPLEMENTATION (ENABLE WHEN READY)
// ===========================================
/*
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, TrendingUp, Calendar, Droplets } from "lucide-react";

// Scent family metadata
const SCENT_FAMILIES: Record<
  string,
  {
    emoji: string;
    color: string;
    gradient: string;
    trait: string;
    description: string;
  }
> = {
  fresh: {
    emoji: "\u{1F343}",
    color: "text-emerald-600",
    gradient: "from-lime-100 to-emerald-100",
    trait: "clarity-seeking",
    description: "drawn to brightness and energy",
  },
  floral: {
    emoji: "\u{1F338}",
    color: "text-pink-600",
    gradient: "from-pink-100 to-rose-100",
    trait: "romantic",
    description: "drawn to softness and beauty",
  },
  woody: {
    emoji: "\u{1FAB5}",
    color: "text-amber-700",
    gradient: "from-amber-100 to-orange-100",
    trait: "grounded",
    description: "drawn to depth and stability",
  },
  amber: {
    emoji: "\u{2728}",
    color: "text-orange-600",
    gradient: "from-orange-100 to-yellow-100",
    trait: "warm-hearted",
    description: "drawn to warmth and comfort",
  },
  gourmand: {
    emoji: "\u{1F36F}",
    color: "text-amber-600",
    gradient: "from-amber-100 to-rose-100",
    trait: "sensual",
    description: "drawn to indulgence and pleasure",
  },
  musky: {
    emoji: "\u{1F319}",
    color: "text-slate-600",
    gradient: "from-stone-100 to-zinc-100",
    trait: "intimate",
    description: "drawn to subtlety and closeness",
  },
  oriental: {
    emoji: "\u{1F52E}",
    color: "text-purple-600",
    gradient: "from-purple-100 to-pink-100",
    trait: "mysterious",
    description: "drawn to complexity and intrigue",
  },
  aquatic: {
    emoji: "\u{1F30A}",
    color: "text-cyan-600",
    gradient: "from-cyan-100 to-blue-100",
    trait: "free-spirited",
    description: "drawn to openness and freedom",
  },
  green: {
    emoji: "\u{1F33F}",
    color: "text-green-600",
    gradient: "from-green-100 to-emerald-100",
    trait: "natural",
    description: "drawn to authentic freshness",
  },
  powdery: {
    emoji: "\u{2601}",
    color: "text-violet-500",
    gradient: "from-violet-100 to-pink-100",
    trait: "gentle",
    description: "drawn to softness and nostalgia",
  },
};

// Type for stats
interface WearStats {
  totalWears: number;
  familyCounts: Record<string, number>;
  sortedFamilies: { family: string; count: number }[];
  mostWorn: { perfumeId: string; count: number; name: string; house?: string }[];
  firstWear: number | null;
  lastWear: number | null;
  uniquePerfumes: number;
}

// Generate narrative based on stats
function generateNarrative(stats: WearStats | null): string {
  if (!stats || stats.totalWears === 0) {
    return "Your scent story is just beginning. Each fragrance you wear adds another layer to your evolving aura.";
  }

  const topFamily = stats.sortedFamilies[0];
  const secondFamily = stats.sortedFamilies[1];
  const topPerfume = stats.mostWorn[0];

  const topMeta = SCENT_FAMILIES[topFamily?.family] || SCENT_FAMILIES.amber;

  // Calculate days since first wear
  const daysSinceFirst = stats.firstWear
    ? Math.floor((Date.now() - stats.firstWear) / (1000 * 60 * 60 * 24))
    : 0;
  const timePhrase =
    daysSinceFirst < 7
      ? "this week"
      : daysSinceFirst < 30
        ? "this month"
        : daysSinceFirst < 90
          ? "recently"
          : "over time";

  let narrative = `Your aura speaks of someone ${topMeta.trait}\u2014${topMeta.description}. `;

  if (secondFamily) {
    const secondMeta = SCENT_FAMILIES[secondFamily.family] || SCENT_FAMILIES.woody;
    narrative += `There's also a ${secondMeta.trait} undercurrent in your choices. `;
  }

  if (topPerfume && topPerfume.count > 1) {
    narrative += `${topPerfume.name} has become a signature, worn ${topPerfume.count} times ${timePhrase}. `;
  }

  narrative += `You've dressed your presence ${stats.totalWears} times across ${stats.uniquePerfumes} different fragrances.`;

  return narrative;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = stats && stats.totalWears > 0;
  const narrative = generateNarrative(stats);
  const topFamily = stats?.sortedFamilies?.[0];
  const topMeta = topFamily ? SCENT_FAMILIES[topFamily.family] : null;

  // Determine background gradient based on dominant family
  const bgGradient = topMeta?.gradient || "from-stone-50 to-stone-100";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-56 h-56 bg-amber-100/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      </div>

      <motion.main
        className="relative z-10 px-6 pt-16 pb-32 max-w-lg mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="font-inter text-sm text-stone-600">Your Aura</span>
          </div>
          <h1 className="font-cormorant font-light text-4xl md:text-5xl text-stone-900 leading-tight">
            {hasData ? "Your Scent Story" : "Begin Your Story"}
          </h1>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/60"
        >
          <p className="font-cormorant text-xl text-stone-700 leading-relaxed text-center">
            {narrative}
          </p>
        </motion.div>

        {hasData && stats && (
          <>
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-stone-500" />
                <span className="font-inter text-sm text-stone-500 uppercase tracking-wide">
                  Your Scent Signatures
                </span>
              </div>

              <div className="space-y-3">
                {stats.sortedFamilies.slice(0, 4).map((family, index) => {
                  const meta = SCENT_FAMILIES[family.family] || SCENT_FAMILIES.amber;
                  const percentage = Math.round(
                    (family.count / stats.totalWears) * 100
                  );

                  return (
                    <div
                      key={family.family}
                      className="bg-white/40 backdrop-blur rounded-2xl p-4 border border-white/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{meta.emoji}</span>
                          <div>
                            <p className="font-cormorant text-lg text-stone-800 capitalize">
                              {family.family}
                            </p>
                            <p className="font-inter text-xs text-stone-500">
                              {meta.trait}
                            </p>
                          </div>
                        </div>
                        <span className="font-cormorant text-2xl text-stone-700">
                          {percentage}%
                        </span>
                      </div>

                      <div className="h-1.5 bg-stone-200/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                          className={`h-full bg-gradient-to-r ${meta.gradient.replace("to-", "via-")} to-transparent rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white/40 backdrop-blur rounded-2xl p-4 text-center border border-white/50">
                <p className="font-cormorant text-3xl text-stone-800">
                  {stats.totalWears}
                </p>
                <p className="font-inter text-xs text-stone-500 mt-1">days dressed</p>
              </div>
              <div className="bg-white/40 backdrop-blur rounded-2xl p-4 text-center border border-white/50">
                <p className="font-cormorant text-3xl text-stone-800">
                  {stats.uniquePerfumes}
                </p>
                <p className="font-inter text-xs text-stone-500 mt-1">fragrances</p>
              </div>
              <div className="bg-white/40 backdrop-blur rounded-2xl p-4 text-center border border-white/50">
                <p className="font-cormorant text-3xl text-stone-800">
                  {stats.sortedFamilies.length}
                </p>
                <p className="font-inter text-xs text-stone-500 mt-1">families</p>
              </div>
            </motion.div>

            {stats.mostWorn.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-4">
                  <Droplets className="w-4 h-4 text-stone-500" />
                  <span className="font-inter text-sm text-stone-500 uppercase tracking-wide">
                    Your Signatures
                  </span>
                </div>

                <div className="space-y-2">
                  {stats.mostWorn.slice(0, 3).map((perfume, index) => (
                    <div
                      key={perfume.perfumeId}
                      className="bg-white/30 backdrop-blur rounded-xl p-3 flex items-center justify-between border border-white/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center font-inter text-xs text-amber-700">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-cormorant text-stone-800">
                            {perfume.name}
                          </p>
                          {perfume.house && (
                            <p className="font-inter text-xs text-stone-500">
                              {perfume.house}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-inter text-sm text-stone-500">
                        {perfume.count}&times;
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {!hasData && (
          <motion.div variants={itemVariants} className="text-center">
            <p className="font-inter text-stone-500 mb-6">
              Start wearing fragrances to build your aura profile
            </p>
            <Link href="/ritual">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-stone-800 text-white font-inter px-8 py-3 rounded-full"
              >
                Get your first recommendation
              </motion.button>
            </Link>
          </motion.div>
        )}

        {hasData && stats?.firstWear && (
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <div className="flex items-center justify-center gap-2 text-stone-400">
              <Calendar className="w-4 h-4" />
              <span className="font-inter text-sm">
                Journey started{" "}
                {new Date(stats.firstWear).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}
*/
