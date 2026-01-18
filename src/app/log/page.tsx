"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Droplets, Sparkles, ChevronRight } from "lucide-react";
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

export default function ScentJournalPage() {
  const router = useRouter();
  const wearHistory = useQuery(api.wearLog.getWearHistory, { limit: 100 });
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // Loading state
  if (wearHistory === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-400 font-inter text-sm">Loading your journal...</p>
        </div>
      </div>
    );
  }

  const groupedEntries = groupByDate(wearHistory);
  const dateKeys = Object.keys(groupedEntries);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
      {/* Atmospheric background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-48 h-48 bg-stone-200/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 md:px-6 pt-12 pb-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-amber-600 font-inter text-sm tracking-wide">Your Journey</span>
          </div>
          <h1 className="font-cormorant font-light text-3xl text-stone-900 mb-2">
            Scent Journal
          </h1>
          <p className="font-inter text-stone-500 text-sm">
            A record of how you&apos;ve dressed your presence
          </p>
        </motion.div>
      </header>

      {/* Empty state */}
      {wearHistory.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center justify-center py-24 px-4 md:px-6 text-center max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 bg-white/60 backdrop-blur rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/80">
            <Droplets className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="font-cormorant font-light text-2xl text-stone-800 mb-2">
            No scents logged yet
          </h2>
          <p className="font-inter text-sm text-stone-400 max-w-xs mb-8">
            Start your fragrance journey by getting a recommendation and logging what you wear
          </p>
          <Link href="/ritual">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-inter rounded-full hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
            >
              Log your first scent
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* Wear history feed */}
      {wearHistory.length > 0 && (
        <motion.div
          className="relative z-10 px-4 md:px-6 pb-32 max-w-2xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {dateKeys.map((dateKey) => {
            const entries = groupedEntries[dateKey];
            const dateInfo = formatDate(entries[0].wornAt);

            return (
              <motion.div key={dateKey} variants={itemVariants} className="mb-8">
                {/* Date header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Calendar className="w-4 h-4" />
                    <span className="font-inter text-sm font-medium">
                      {dateInfo.relative}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-stone-200/60" />
                </div>

                {/* Entries for this date */}
                <div className="space-y-3">
                  {entries.map((entry, entryIndex) => {
                    const bg =
                      SCENT_BG[entry.scentFamily || "default"] ||
                      SCENT_BG.default;
                    const emoji =
                      SCENT_EMOJI[entry.scentFamily || "default"] || "\u{2728}";
                    const isExpanded = expandedEntry === entry._id;
                    const hasVibe = !!entry.vibeId;
                    const hasNotes = !!entry.notes;

                    const handleClick = () => {
                      if (hasVibe) {
                        router.push(`/vibes/${entry.vibeId}`);
                      } else if (hasNotes) {
                        setExpandedEntry(isExpanded ? null : entry._id);
                      }
                    };

                    return (
                      <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: entryIndex * 0.05 }}
                        onClick={handleClick}
                        className={`${bg} rounded-2xl p-4 border border-white/50 shadow-sm ${
                          hasVibe || hasNotes
                            ? "cursor-pointer hover:shadow-md hover:border-white/80 active:scale-[0.99] transition-all"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Emoji icon */}
                          <div className="w-12 h-12 bg-white/60 backdrop-blur rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm">
                            {emoji}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="font-cormorant text-lg text-stone-800 truncate">
                              {entry.perfumeName}
                            </p>
                            {entry.perfumeHouse && (
                              <p className="font-inter text-sm text-stone-500">
                                {entry.perfumeHouse}
                              </p>
                            )}
                            {/* Show truncated notes when not expanded */}
                            {entry.notes && !isExpanded && (
                              <p className="font-inter text-sm text-stone-600 mt-2 italic line-clamp-2">
                                &ldquo;{entry.notes}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Right side: badge + chevron */}
                          <div className="flex items-center gap-2 shrink-0">
                            {entry.scentFamily && (
                              <span className="px-3 py-1 bg-white/60 backdrop-blur rounded-full text-xs font-inter text-stone-600 capitalize">
                                {entry.scentFamily}
                              </span>
                            )}
                            {(hasVibe || hasNotes) && (
                              <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            )}
                          </div>
                        </div>

                        {/* Expanded notes section */}
                        <AnimatePresence>
                          {isExpanded && entry.notes && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-white/40">
                                <p className="font-inter text-sm text-stone-600 italic leading-relaxed">
                                  &ldquo;{entry.notes}&rdquo;
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Link indicator for vibes */}
                        {entry.vibeId && (
                          <div className="mt-3 flex items-center gap-1 text-amber-600 font-inter text-sm">
                            <Sparkles className="w-3 h-3" />
                            <span>Tap to view saved vibe</span>
                          </div>
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
    </div>
  );
}
