// src/app/aura/page.tsx
"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Check, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import SaveVibeModal from "@/components/SaveVibeModal";
import { cn } from "@/lib/utils";

// ============================================
// SUSPENSE LOADING FALLBACK
// ============================================
function AuraLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 animate-pulse mx-auto mb-4" />
        <p className="text-stone-400 font-cormorant text-lg">Revealing your aura...</p>
      </div>
    </div>
  );
}

// Type for session data with augmented perfume info from sessions.get
interface SessionWithPerfume {
  _id: Id<"sessions">;
  userId: string;
  outfitStyles: string[];
  mood: string;
  scentDirections: string[];
  occasion: string;
  weather?: {
    temperature?: number;
    temperatureCategory: "hot" | "warm" | "mild" | "cool" | "cold";
    humidity?: number;
    humidityCategory?: "dry" | "moderate" | "humid";
    condition?: string;
    location?: string;
    isManual: boolean;
  };
  recommendedPerfumeId?: Id<"userPerfumes">;
  recommendationType?: string;
  matchScore?: number;
  editorialExplanation?: string;
  affirmation?: string;
  completedAt?: number;
  createdAt: number;
  // Augmented fields from sessions.get
  perfume?: {
    _id: Id<"perfumes">;
    name: string;
    house: string;
    scentFamily: string;
    auraWords?: string[];
  };
  userPerfume?: {
    _id: Id<"userPerfumes">;
    perfumeId: Id<"perfumes">;
    userId: string;
  };
}

// ============================================
// SCENT FAMILY GRADIENTS & STYLES
// ============================================
const SCENT_GRADIENTS: Record<string, {
  bg: string;
  accent: string;
  glow: string;
  orbPrimary: string;
  orbSecondary: string;
}> = {
  fresh: {
    bg: "from-emerald-50 via-teal-50 to-cyan-50",
    accent: "text-teal-700",
    glow: "bg-teal-400/20",
    orbPrimary: "bg-teal-300/30",
    orbSecondary: "bg-cyan-200/40",
  },
  floral: {
    bg: "from-rose-50 via-pink-50 to-fuchsia-50",
    accent: "text-rose-700",
    glow: "bg-rose-400/20",
    orbPrimary: "bg-rose-300/30",
    orbSecondary: "bg-pink-200/40",
  },
  woody: {
    bg: "from-amber-50 via-orange-50 to-yellow-50",
    accent: "text-amber-800",
    glow: "bg-amber-400/20",
    orbPrimary: "bg-amber-300/30",
    orbSecondary: "bg-orange-200/40",
  },
  amber: {
    bg: "from-orange-50 via-amber-50 to-red-50",
    accent: "text-orange-800",
    glow: "bg-orange-400/20",
    orbPrimary: "bg-orange-300/30",
    orbSecondary: "bg-amber-200/40",
  },
  gourmand: {
    bg: "from-amber-50 via-yellow-50 to-orange-50",
    accent: "text-amber-900",
    glow: "bg-amber-500/20",
    orbPrimary: "bg-amber-400/30",
    orbSecondary: "bg-yellow-200/40",
  },
  musky: {
    bg: "from-stone-100 via-zinc-50 to-warm-gray-50",
    accent: "text-stone-700",
    glow: "bg-stone-400/20",
    orbPrimary: "bg-stone-300/30",
    orbSecondary: "bg-zinc-200/40",
  },
  default: {
    bg: "from-stone-50 via-amber-50/30 to-stone-100",
    accent: "text-stone-700",
    glow: "bg-stone-400/20",
    orbPrimary: "bg-stone-300/30",
    orbSecondary: "bg-amber-100/40",
  },
};

// ============================================
// ANIMATION VARIANTS
// ============================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const orbVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.5, 0.3],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// ============================================
// FLOATING ORBS BACKGROUND
// ============================================
function FloatingOrbs({ scentFamily }: { scentFamily: string }) {
  const gradient = SCENT_GRADIENTS[scentFamily] || SCENT_GRADIENTS.default;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Large primary orb - top right */}
      <motion.div
        variants={orbVariants}
        animate="animate"
        className={cn(
          "absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl",
          gradient.orbPrimary
        )}
      />
      {/* Secondary orb - bottom left */}
      <motion.div
        variants={orbVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
        className={cn(
          "absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl",
          gradient.orbSecondary
        )}
      />
      {/* Accent orb - center */}
      <motion.div
        variants={orbVariants}
        animate="animate"
        style={{ animationDelay: "4s" }}
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl",
          gradient.glow
        )}
      />
    </div>
  );
}

// ============================================
// LOADING STATES
// ============================================
function LoadingState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 flex flex-col items-center justify-center px-6">
      <FloatingOrbs scentFamily="default" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative z-10"
      >
        <RefreshCw className="w-8 h-8 text-stone-400" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-stone-500 mt-4 font-cormorant text-lg text-center relative z-10"
      >
        {message}
      </motion.p>
    </div>
  );
}

function ErrorState({
  title,
  message,
  actionLabel,
  actionHref
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 flex flex-col items-center justify-center px-6">
      <FloatingOrbs scentFamily="default" />
      <div className="relative z-10 text-center">
        <h1 className="font-cormorant text-2xl text-stone-800 mb-2">{title}</h1>
        <p className="text-stone-500 mb-6">{message}</p>
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-full font-cormorant text-lg hover:bg-stone-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT (uses useSearchParams)
// ============================================
function AuraContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isLoggingWorn, setIsLoggingWorn] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  // Get session ID from URL
  const sessionIdParam = searchParams.get("session");
  const sessionId = sessionIdParam as Id<"sessions"> | null;

  // Fetch session data from Convex
  // The sessions.get query returns session data augmented with perfume and userPerfume
  const session = useQuery(
    api.sessions.get,
    sessionId ? { sessionId } : "skip"
  ) as SessionWithPerfume | null | undefined;

  // Mutations for marking as worn
  const markWorn = useMutation(api.userPerfumes.markWorn);
  const logWear = useMutation(api.wearLog.logWear);

  // Handle "Log as worn" action
  const handleLogAsWorn = async () => {
    if (!session?.userPerfume?._id || !user?.id || !session?.perfume || isLogged) return;

    setIsLoggingWorn(true);
    try {
      // Update the userPerfume wear count
      await markWorn({
        userId: user.id,
        userPerfumeId: session.userPerfume._id,
      });

      // Log to the wear journal
      await logWear({
        perfumeId: session.perfume._id,
        perfumeName: session.perfume.name,
        perfumeHouse: session.perfume.house,
        scentFamily: session.perfume.scentFamily,
        sessionId: session._id,
      });

      // Success - show logged state, stay on page
      setIsLogged(true);
    } catch (error) {
      console.error("Failed to log as worn:", error);
    } finally {
      setIsLoggingWorn(false);
    }
  };

  // Handle "Save this vibe" action
  const handleSaveVibe = () => {
    setShowSaveModal(true);
  };

  // Handle "New ritual" action
  const handleNewRitual = () => {
    router.push("/ritual");
  };

  // ============================================
  // LOADING & ERROR STATES
  // ============================================

  // No session ID in URL
  if (!sessionId) {
    return (
      <ErrorState
        title="No session found"
        message="Start a new ritual to discover your perfect scent."
        actionLabel="Begin Ritual"
        actionHref="/ritual"
      />
    );
  }

  // Still loading user or session
  if (!isUserLoaded || session === undefined) {
    return <LoadingState message="Revealing your aura..." />;
  }

  // Session not found
  if (session === null) {
    return (
      <ErrorState
        title="Session not found"
        message="This ritual has expired or doesn't exist."
        actionLabel="Start Fresh"
        actionHref="/ritual"
      />
    );
  }

  // No perfume recommendation
  if (!session.perfume) {
    return (
      <ErrorState
        title="No recommendation found"
        message="We couldn't find the perfect match. Try again?"
        actionLabel="Try Again"
        actionHref="/ritual"
      />
    );
  }

  // ============================================
  // RENDER RECOMMENDATION
  // ============================================
  const { perfume, editorialExplanation, affirmation, mood } = session;
  const scentFamily = perfume.scentFamily || "default";
  const gradient = SCENT_GRADIENTS[scentFamily] || SCENT_GRADIENTS.default;
  const auraWords = perfume.auraWords?.slice(0, 3) || getDefaultAuraWords(mood);

  return (
    <div className={cn("min-h-screen bg-gradient-to-br", gradient.bg)}>
      <FloatingOrbs scentFamily={scentFamily} />

      <div className="relative z-10 px-4 md:px-6 py-8 pb-40 max-w-2xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-12"
        >
          <Link href="/collection">
            <Wordmark size="sm" />
          </Link>
          <span className="text-stone-400 text-sm tracking-wide">
            Today&apos;s Aura
          </span>
        </motion.header>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Scent Family Badge - only show if we have a real scent family */}
          {scentFamily && scentFamily !== "default" && (
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/80">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    scentFamily === "fresh" && "bg-teal-500",
                    scentFamily === "floral" && "bg-rose-500",
                    scentFamily === "woody" && "bg-amber-600",
                    scentFamily === "amber" && "bg-orange-500",
                    scentFamily === "gourmand" && "bg-amber-500",
                    scentFamily === "musky" && "bg-stone-500",
                    !["fresh", "floral", "woody", "amber", "gourmand", "musky"].includes(scentFamily) && "bg-stone-400"
                  )}
                />
                <span className={cn("text-sm font-medium capitalize", gradient.accent)}>
                  {scentFamily}
                </span>
              </div>
            </motion.div>
          )}

          {/* Perfume Name & House */}
          <motion.div variants={itemVariants} className="text-center py-2">
            <h1 className="font-cormorant font-light text-4xl md:text-5xl text-stone-800 mb-2 leading-tight">
              {perfume.name}
            </h1>
            <p className="text-stone-500 text-lg tracking-wide">
              {perfume.house}
            </p>
          </motion.div>

          {/* Aura Words */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center flex-wrap gap-3"
          >
            {auraWords.map((word) => (
              <span
                key={word}
                className="px-5 py-2.5 bg-white/60 backdrop-blur-sm rounded-full text-stone-700 text-sm font-medium border border-white/80 shadow-sm"
              >
                {word}
              </span>
            ))}
          </motion.div>

          {/* Editorial Explanation */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-white/60 shadow-sm">
              <p className="text-stone-500 text-xs uppercase tracking-widest mb-3">
                Why this works today
              </p>
              {editorialExplanation ? (
                <p className="font-cormorant text-lg text-stone-700 leading-relaxed">
                  {editorialExplanation}
                </p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-stone-400"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Crafting your story...</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Affirmation */}
          <motion.div variants={itemVariants} className="text-center py-4">
            <p className="font-cormorant text-xl text-stone-600 italic leading-relaxed">
              &ldquo;{affirmation || getDefaultAffirmation(mood)}&rdquo;
            </p>
          </motion.div>

          {/* Weather Context (if available) */}
          {session.weather && session.weather.temperatureCategory && (
            <motion.div
              variants={itemVariants}
              className="text-center text-stone-400 text-sm"
            >
              {session.weather.temperature && session.weather.location ? (
                <span>
                  {Math.round(session.weather.temperature)}° in {session.weather.location}
                </span>
              ) : (
                <span className="capitalize">{session.weather.temperatureCategory} weather</span>
              )}
            </motion.div>
          )}

          {/* Action Buttons - contained width */}
          <motion.div variants={itemVariants} className="pt-6 space-y-3 max-w-md mx-auto">
            {/* Primary CTA - Save this vibe */}
            <button
              onClick={handleSaveVibe}
              disabled={isSaved}
              className={cn(
                "w-full py-4 rounded-full font-inter font-medium text-base transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2",
                isSaved
                  ? "bg-emerald-500 text-white cursor-default"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
              )}
            >
              {isSaved ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved
                </>
              ) : (
                "Save this vibe"
              )}
            </button>

            {/* Secondary CTA - Log as worn (works independently) */}
            <button
              onClick={handleLogAsWorn}
              disabled={isLoggingWorn || isLogged}
              className={cn(
                "w-full py-3 rounded-full font-inter text-sm font-medium transition-colors border flex items-center justify-center gap-2 active:scale-[0.98]",
                isLogged
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default"
                  : "bg-white/80 backdrop-blur-sm text-stone-700 border-stone-300 hover:bg-white disabled:opacity-50"
              )}
            >
              {isLoggingWorn ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isLogged ? "Logged" : "Log as worn"}
            </button>

            {/* Tertiary - New ritual link */}
            <button
              onClick={handleNewRitual}
              className="w-full py-3 text-stone-500 font-inter text-sm hover:text-stone-700 transition-colors"
            >
              Start a new ritual
            </button>

            {/* Back to Vault link */}
            <Link
              href="/collection"
              className="w-full py-2 text-stone-400 font-inter text-sm hover:text-stone-600 transition-colors block text-center"
            >
              Back to Vault
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Save Vibe Modal */}
      <SaveVibeModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        sessionId={sessionId as Id<"sessions">}
        perfumeName={perfume.name || ""}
        perfumeHouse={perfume.house || ""}
        scentFamily={scentFamily}
        auraWords={auraWords}
        mood={mood || ""}
        occasion={session.occasion || ""}
        onSaveSuccess={() => setIsSaved(true)}
      />
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getDefaultAuraWords(mood?: string): string[] {
  const moodWords: Record<string, string[]> = {
    confident: ["Grounded", "Bold", "Assured"],
    soft: ["Gentle", "Approachable", "Serene"],
    playful: ["Spirited", "Light", "Joyful"],
    mysterious: ["Intriguing", "Subtle", "Deep"],
  };
  return moodWords[mood || ""] || ["Balanced", "Present", "Authentic"];
}

function getDefaultAffirmation(mood?: string): string {
  const affirmations: Record<string, string> = {
    confident: "You carry your own warmth today.",
    soft: "Your gentleness is your strength.",
    playful: "Joy radiates from you effortlessly.",
    mysterious: "Let them wonder what your secret is.",
  };
  return affirmations[mood || ""] || "You are exactly where you need to be.";
}

// ============================================
// DEFAULT EXPORT WITH SUSPENSE BOUNDARY
// ============================================
export default function AuraPage() {
  return (
    <Suspense fallback={<AuraLoading />}>
      <AuraContent />
    </Suspense>
  );
}
