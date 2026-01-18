"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";

// ===========================================
// COMING SOON PLACEHOLDER
// Enable the full implementation below once
// the wearLog Convex functions are deployed
// ===========================================

export default function VibeCheckLogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
      {/* Atmospheric background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-48 h-48 bg-stone-200/30 rounded-full blur-3xl" />
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
            <BookOpen className="w-10 h-10 text-amber-600" />
          </div>

          {/* Title */}
          <h1 className="font-cormorant font-light text-3xl text-stone-900 mb-3">
            Scent Journal
          </h1>

          {/* Subtitle */}
          <p className="font-inter text-stone-500 mb-2">
            Coming soon
          </p>
          <p className="font-inter text-sm text-stone-400 max-w-xs mx-auto mb-8">
            Track your fragrance journey and see what you&apos;ve worn over time
          </p>

          {/* CTA */}
          <Link href="/collection">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-stone-800 text-white font-inter rounded-full hover:bg-stone-700 transition-colors"
            >
              Back to Collection
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
import { Calendar, Droplets } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

// Scent family to emoji mapping
const SCENT_EMOJI: Record<string, string> = {
  fresh: "\u{1F343}",
  floral: "\u{1F338}",
  woody: "\u{1FAB5}",
  amber: "\u{2728}",
  gourmand: "\u{1F36F}",
  musky: "\u{1F319}",
  oriental: "\u{1F52E}",
  aquatic: "\u{1F30A}",
  green: "\u{1F33F}",
  powdery: "\u{2601}",
};

// Soft background colors by scent family
const SCENT_BG: Record<string, string> = {
  fresh: "bg-gradient-to-br from-lime-50 to-emerald-50",
  floral: "bg-gradient-to-br from-pink-50 to-rose-50",
  woody: "bg-gradient-to-br from-amber-50 to-orange-50",
  amber: "bg-gradient-to-br from-orange-50 to-yellow-50",
  gourmand: "bg-gradient-to-br from-amber-50 to-rose-50",
  musky: "bg-gradient-to-br from-stone-100 to-zinc-50",
  oriental: "bg-gradient-to-br from-purple-50 to-pink-50",
  aquatic: "bg-gradient-to-br from-cyan-50 to-blue-50",
  green: "bg-gradient-to-br from-green-50 to-emerald-50",
  powdery: "bg-gradient-to-br from-violet-50 to-pink-50",
  default: "bg-gradient-to-br from-stone-50 to-stone-100",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// Format date nicely
function formatDate(timestamp: number): {
  day: string;
  monthYear: string;
  relative: string;
} {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  let relative = "";
  if (diffDays === 0) relative = "Today";
  else if (diffDays === 1) relative = "Yesterday";
  else if (diffDays < 7) relative = `${diffDays} days ago`;
  else if (diffDays < 30) relative = `${Math.floor(diffDays / 7)} weeks ago`;
  else
    relative = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return {
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    monthYear: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    relative,
  };
}

// Type for wear log entry
interface WearLogEntry {
  _id: Id<"wearLog">;
  userId: string;
  perfumeId: Id<"perfumes">;
  perfumeName: string;
  perfumeHouse?: string;
  scentFamily?: string;
  vibeId?: Id<"vibes">;
  sessionId?: Id<"sessions">;
  notes?: string;
  wornAt: number;
}

// Group entries by date
function groupByDate(entries: WearLogEntry[]): Record<string, WearLogEntry[]> {
  const groups: Record<string, WearLogEntry[]> = {};

  entries.forEach((entry) => {
    const date = new Date(entry.wornAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
  });

  return groups;
}

export default function VibeCheckLogPage() {
  const wearHistory = useQuery(api.wearLog.getWearHistory, { limit: 100 });

  // Loading state
  if (wearHistory === undefined) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  const groupedEntries = groupByDate(wearHistory);
  const dateKeys = Object.keys(groupedEntries);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-cormorant font-light text-3xl text-stone-900 mb-2">
            Your Scent Journal
          </h1>
          <p className="font-inter text-stone-500 text-sm">
            A record of how you&apos;ve dressed your presence
          </p>
        </motion.div>
      </header>

      {wearHistory.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 px-6 text-center"
        >
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6">
            <Droplets className="w-8 h-8 text-stone-400" />
          </div>
          <p className="font-inter text-stone-500 mb-2">
            Your scent journal is empty
          </p>
          <p className="font-inter text-sm text-stone-400 mb-8">
            Start by getting a recommendation and logging what you wear
          </p>
          <Link href="/ritual">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-stone-800 text-white font-inter px-8 py-3 rounded-full"
            >
              Get a recommendation
            </motion.button>
          </Link>
        </motion.div>
      )}

      {wearHistory.length > 0 && (
        <motion.div
          className="px-6 pb-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {dateKeys.map((dateKey) => {
            const entries = groupedEntries[dateKey];
            const dateInfo = formatDate(entries[0].wornAt);

            return (
              <motion.div key={dateKey} variants={itemVariants} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Calendar className="w-4 h-4" />
                    <span className="font-inter text-sm font-medium">
                      {dateInfo.relative}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                <div className="space-y-3">
                  {entries.map((entry, entryIndex) => {
                    const bg =
                      SCENT_BG[entry.scentFamily || "default"] ||
                      SCENT_BG.default;
                    const emoji =
                      SCENT_EMOJI[entry.scentFamily || "default"] || "\u{2728}";

                    return (
                      <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: entryIndex * 0.05 }}
                        className={`${bg} rounded-2xl p-4 border border-white/50`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-white/60 backdrop-blur rounded-xl flex items-center justify-center text-2xl shrink-0">
                            {emoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-cormorant text-lg text-stone-800 truncate">
                              {entry.perfumeName}
                            </p>
                            {entry.perfumeHouse && (
                              <p className="font-inter text-sm text-stone-500">
                                {entry.perfumeHouse}
                              </p>
                            )}
                            {entry.notes && (
                              <p className="font-inter text-sm text-stone-600 mt-2 italic line-clamp-2">
                                &ldquo;{entry.notes}&rdquo;
                              </p>
                            )}
                          </div>

                          {entry.scentFamily && (
                            <span className="px-3 py-1 bg-white/60 backdrop-blur rounded-full text-xs font-inter text-stone-600 capitalize shrink-0">
                              {entry.scentFamily}
                            </span>
                          )}
                        </div>

                        {entry.vibeId && (
                          <Link
                            href={`/vibes/${entry.vibeId}`}
                            className="mt-3 inline-flex items-center gap-1 text-amber-600 font-inter text-sm hover:text-amber-700"
                          >
                            View saved vibe &rarr;
                          </Link>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="h-20" />
    </div>
  );
}
*/
