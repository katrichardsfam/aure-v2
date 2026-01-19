"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Droplets,
  Calendar,
  Sparkles,
  Trash2,
  Loader2,
} from "lucide-react";
import { getEnhancedPerfumeImage } from "@/lib/imageUtils";

// Scent family styling
const scentFamilyStyles: Record<
  string,
  { gradient: string; accent: string; emoji: string }
> = {
  woody: { gradient: "from-amber-50 to-orange-50", accent: "text-amber-700", emoji: "🪵" },
  fresh: { gradient: "from-emerald-50 to-teal-50", accent: "text-emerald-700", emoji: "🍃" },
  floral: { gradient: "from-rose-50 to-pink-50", accent: "text-rose-700", emoji: "🌸" },
  amber: { gradient: "from-orange-50 to-amber-50", accent: "text-orange-700", emoji: "✨" },
  oriental: { gradient: "from-amber-50 to-red-50", accent: "text-red-700", emoji: "🔮" },
  citrus: { gradient: "from-yellow-50 to-amber-50", accent: "text-yellow-700", emoji: "🍋" },
  aquatic: { gradient: "from-cyan-50 to-blue-50", accent: "text-cyan-700", emoji: "🌊" },
  gourmand: { gradient: "from-orange-50 to-amber-50", accent: "text-orange-700", emoji: "🍯" },
  green: { gradient: "from-lime-50 to-emerald-50", accent: "text-lime-700", emoji: "🌿" },
  powdery: { gradient: "from-violet-50 to-pink-50", accent: "text-violet-700", emoji: "☁️" },
  musky: { gradient: "from-stone-100 to-neutral-100", accent: "text-stone-600", emoji: "🌙" },
};

const defaultStyle = { gradient: "from-stone-50 to-amber-50", accent: "text-stone-600", emoji: "✨" };

// Perfume image component with Cloudinary fallback
function PerfumeImage({ src, alt, scentFamily }: { src?: string; alt: string; scentFamily?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);
  const styles = scentFamilyStyles[scentFamily?.toLowerCase() || ""] || defaultStyle;

  // Get the appropriate image URL (enhanced or original fallback)
  const imageUrl = useFallback ? (src || '') : getEnhancedPerfumeImage(src || '');

  if (!src || hasError) {
    return (
      <div className={`aspect-square w-full max-w-xs mx-auto rounded-2xl bg-gradient-to-br ${styles.gradient} flex items-center justify-center`}>
        <Droplets className={`w-16 h-16 ${styles.accent} opacity-40`} />
      </div>
    );
  }

  return (
    // Outer container with scent family gradient as frame
    <div className={`w-full max-w-sm mx-auto rounded-3xl p-3 bg-gradient-to-br ${styles.gradient} shadow-sm`}>
      {/* Inner white container for the image */}
      <div className="aspect-square w-full rounded-2xl overflow-hidden relative bg-white/90 backdrop-blur-sm">
        {isLoading && (
          <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} animate-pulse flex items-center justify-center`}>
            <Droplets className="w-12 h-12 text-stone-300" />
          </div>
        )}
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="384px"
          className={`object-contain p-4 transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            // If Cloudinary fails, try original URL before showing placeholder
            if (!useFallback) {
              setUseFallback(true);
              setIsLoading(true);
            } else {
              setHasError(true);
            }
          }}
        />
      </div>
    </div>
  );
}

// Format date
function formatDate(timestamp?: number): string {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Safely get display string from value that could be string or object with name property
function getDisplayName(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "name" in value) {
    return String((value as { name: unknown }).name);
  }
  return String(value || "");
}

export default function PerfumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const userPerfumeId = params.id as string;

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch the userPerfume with perfume details
  const userPerfume = useQuery(api.userPerfumes.getById, {
    userPerfumeId: userPerfumeId as Id<"userPerfumes">,
  });

  // Mutations
  const toggleFavorite = useMutation(api.userPerfumes.toggleFavorite);
  const removeFromCollection = useMutation(api.userPerfumes.remove);

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!userPerfume || !user?.id) return;
    await toggleFavorite({
      userId: user.id,
      userPerfumeId: userPerfume._id,
    });
  };

  // Handle delete
  const handleDelete = async () => {
    if (!userPerfume || !user?.id) return;
    setIsDeleting(true);
    try {
      await removeFromCollection({
        userId: user.id,
        userPerfumeId: userPerfume._id,
      });
      router.push("/collection");
    } catch (error) {
      console.error("Failed to delete:", error);
      setIsDeleting(false);
    }
  };

  // Loading state
  if (userPerfume === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-stone-400 animate-spin mx-auto mb-4" />
          <p className="font-inter text-stone-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (userPerfume === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30 flex flex-col items-center justify-center px-6">
        <Droplets className="w-12 h-12 text-stone-300 mb-4" />
        <h1 className="font-cormorant text-2xl text-stone-800 mb-2">Perfume not found</h1>
        <p className="font-inter text-stone-500 mb-6">This fragrance isn&apos;t in your collection.</p>
        <Link
          href="/collection"
          className="font-inter text-amber-600 hover:text-amber-700 transition-colors"
        >
          ← Back to Vault
        </Link>
      </div>
    );
  }

  const perfume = userPerfume.perfume;
  const scentFamily = perfume?.scentFamily?.toLowerCase() || "";
  const styles = scentFamilyStyles[scentFamily] || defaultStyle;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${styles.gradient}`}>
      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-32">
        {/* Header */}
        <header className="pt-12 pb-6">
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 font-inter text-sm text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vault
          </Link>
        </header>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Perfume Image */}
          <PerfumeImage
            src={typeof perfume?.imageUrl === "string" ? perfume.imageUrl : undefined}
            alt={getDisplayName(perfume?.name) || "Perfume"}
            scentFamily={scentFamily}
          />

          {/* Name & House */}
          <div className="text-center">
            <h1 className="font-cormorant font-light text-4xl text-stone-900 mb-2">
              {getDisplayName(perfume?.name)}
            </h1>
            <p className="font-inter text-lg text-stone-500">
              {getDisplayName(perfume?.house)}
            </p>

            {/* Scent Family Badge */}
            {scentFamily && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-white/80">
                <span className="text-lg">{styles.emoji}</span>
                <span className={`font-inter text-sm capitalize ${styles.accent}`}>
                  {scentFamily}
                </span>
              </div>
            )}
          </div>

          {/* Favorite Button */}
          <div className="flex justify-center">
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                userPerfume.isFavorite
                  ? "bg-rose-100 text-rose-600 border border-rose-200"
                  : "bg-white/60 text-stone-600 border border-stone-200 hover:border-rose-300 hover:text-rose-500"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${userPerfume.isFavorite ? "fill-current" : ""}`}
              />
              <span className="font-inter text-sm">
                {userPerfume.isFavorite ? "Favorited" : "Add to favorites"}
              </span>
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-white/50 rounded-2xl p-5 border border-white/60">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="font-cormorant text-3xl text-stone-800">
                  {userPerfume.wearCount || 0}
                </p>
                <p className="font-inter text-xs text-stone-500 mt-1">times worn</p>
              </div>
              <div className="text-center">
                <p className="font-cormorant text-lg text-stone-800">
                  {userPerfume.lastWornAt ? formatDate(userPerfume.lastWornAt) : "Never"}
                </p>
                <p className="font-inter text-xs text-stone-500 mt-1">last worn</p>
              </div>
            </div>
          </div>

          {/* Aura Words */}
          {perfume?.auraWords && perfume.auraWords.length > 0 && (
            <div className="bg-white/50 rounded-2xl p-5 border border-white/60">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-inter text-sm text-stone-500 uppercase tracking-wide">
                  Aura
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {perfume.auraWords.map((word, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-white/70 rounded-full font-inter text-sm text-stone-600"
                  >
                    {getDisplayName(word)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {perfume?.notes && (
            <div className="bg-white/50 rounded-2xl p-5 border border-white/60">
              <p className="font-inter text-sm text-stone-500 uppercase tracking-wide mb-4">
                Fragrance Notes
              </p>
              <div className="space-y-4">
                {perfume.notes.top && perfume.notes.top.length > 0 && (
                  <div>
                    <p className="font-inter text-xs text-stone-400 mb-2">Top Notes</p>
                    <div className="flex flex-wrap gap-2">
                      {perfume.notes.top.map((note, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-50 rounded-full text-xs text-amber-700">
                          {getDisplayName(note)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {perfume.notes.heart && perfume.notes.heart.length > 0 && (
                  <div>
                    <p className="font-inter text-xs text-stone-400 mb-2">Heart Notes</p>
                    <div className="flex flex-wrap gap-2">
                      {perfume.notes.heart.map((note, i) => (
                        <span key={i} className="px-3 py-1 bg-rose-50 rounded-full text-xs text-rose-700">
                          {getDisplayName(note)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {perfume.notes.base && perfume.notes.base.length > 0 && (
                  <div>
                    <p className="font-inter text-xs text-stone-400 mb-2">Base Notes</p>
                    <div className="flex flex-wrap gap-2">
                      {perfume.notes.base.map((note, i) => (
                        <span key={i} className="px-3 py-1 bg-stone-100 rounded-full text-xs text-stone-700">
                          {getDisplayName(note)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personal Notes */}
          {userPerfume.personalNotes && (
            <div className="bg-white/50 rounded-2xl p-5 border border-white/60">
              <p className="font-inter text-sm text-stone-500 mb-3">Your Notes</p>
              <p className="font-inter text-stone-700 italic">
                &ldquo;{userPerfume.personalNotes}&rdquo;
              </p>
            </div>
          )}

          {/* Added Date */}
          {userPerfume.createdAt && (
            <div className="flex items-center justify-center gap-2 text-stone-400">
              <Calendar className="w-4 h-4" />
              <span className="font-inter text-sm">
                Added {formatDate(userPerfume.createdAt)}
              </span>
            </div>
          )}

          {/* Delete Button */}
          <div className="pt-8">
            {showDeleteConfirm ? (
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                <p className="font-inter text-sm text-stone-700 mb-4">
                  Remove <span className="font-medium">{getDisplayName(perfume?.name)}</span> from your collection?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 px-4 rounded-full border border-stone-200 font-inter text-sm text-stone-600 hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 rounded-full bg-red-500 font-inter text-sm text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 text-stone-400 font-inter text-sm hover:text-red-500 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove from collection
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
