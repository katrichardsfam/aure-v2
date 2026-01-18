// src/app/collection/page.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Loader2, X, Droplets } from "lucide-react";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

// Scent family to gradient and accent color mapping
const scentFamilyStyles: Record<string, { gradient: string; accent: string; placeholderBg: string; emoji: string }> = {
  woody: { gradient: "from-amber-50 to-orange-50", accent: "text-amber-700", placeholderBg: "from-amber-100 to-orange-100", emoji: "🪵" },
  fresh: { gradient: "from-emerald-50 to-teal-50", accent: "text-emerald-700", placeholderBg: "from-emerald-100 to-teal-100", emoji: "🍃" },
  floral: { gradient: "from-rose-50 to-pink-50", accent: "text-rose-700", placeholderBg: "from-rose-100 to-pink-100", emoji: "🌸" },
  amber: { gradient: "from-orange-50 to-amber-50", accent: "text-orange-700", placeholderBg: "from-orange-100 to-amber-100", emoji: "✨" },
  oriental: { gradient: "from-amber-50 to-red-50", accent: "text-red-700", placeholderBg: "from-amber-100 to-red-100", emoji: "🔮" },
  citrus: { gradient: "from-yellow-50 to-amber-50", accent: "text-yellow-700", placeholderBg: "from-yellow-100 to-amber-100", emoji: "🍋" },
  aquatic: { gradient: "from-cyan-50 to-blue-50", accent: "text-cyan-700", placeholderBg: "from-cyan-100 to-blue-100", emoji: "🌊" },
  gourmand: { gradient: "from-orange-50 to-amber-50", accent: "text-orange-700", placeholderBg: "from-orange-100 to-amber-100", emoji: "🍯" },
  green: { gradient: "from-lime-50 to-emerald-50", accent: "text-lime-700", placeholderBg: "from-lime-100 to-emerald-100", emoji: "🌿" },
  powdery: { gradient: "from-violet-50 to-pink-50", accent: "text-violet-700", placeholderBg: "from-violet-100 to-pink-100", emoji: "☁️" },
  musky: { gradient: "from-stone-100 to-neutral-100", accent: "text-stone-600", placeholderBg: "from-stone-200 to-neutral-200", emoji: "🌙" },
};

const defaultStyle = { gradient: "from-stone-50 to-amber-50", accent: "text-stone-600", placeholderBg: "from-stone-100 to-amber-100", emoji: "✨" };

// Image component with loading state and nice placeholder
function FragranceImage({
  src,
  alt,
  name,
  styles
}: {
  src?: string;
  alt: string;
  name?: string;
  styles: typeof defaultStyle;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    // Nice placeholder with bottle icon
    return (
      <div className={`h-20 rounded-md flex items-center justify-center bg-gradient-to-br ${styles.placeholderBg} relative overflow-hidden`}>
        <Droplets className={`w-6 h-6 ${styles.accent} opacity-40`} />
      </div>
    );
  }

  return (
    <div className="h-20 rounded-md overflow-hidden relative bg-white">
      {isLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br ${styles.placeholderBg} animate-pulse`} />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
        className={`object-contain p-1.5 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

// Delete confirmation modal
function DeleteConfirmModal({
  isOpen,
  perfumeName,
  onConfirm,
  onCancel,
  isDeleting
}: {
  isOpen: boolean;
  perfumeName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
      >
        <h3 className="font-cormorant text-xl text-stone-800 mb-2">Remove fragrance?</h3>
        <p className="font-inter text-sm text-stone-500 mb-6">
          <span className="font-medium text-stone-700">{perfumeName}</span> will be removed from your vault.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-full border border-stone-200 font-inter text-sm text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-full bg-red-500 font-inter text-sm text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CollectionPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const removeFromCollection = useMutation(api.userPerfumes.remove);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: Id<"userPerfumes">;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user's perfume collection from Convex
  const collection = useQuery(
    api.userPerfumes.getCollection,
    user?.id ? { userId: user.id } : "skip"
  );

  const isLoading = !isUserLoaded || collection === undefined;

  // Filter out invalid items (no perfume data or no name)
  const validCollection = collection?.filter(
    (item) => item.perfume && item.perfume.name
  ) || [];

  const isEmpty = validCollection.length === 0;

  const handleDeleteClick = (id: Id<"userPerfumes">, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !user?.id) return;

    setIsDeleting(true);
    try {
      await removeFromCollection({
        userId: user.id,
        userPerfumeId: deleteTarget.id,
      });
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Header */}
      <header className="px-4 pt-12 pb-6">
        <Link
          href="/"
          className="font-inter text-sm text-stone-500 mb-3 block hover:text-stone-700 transition-colors"
        >
          ← Home
        </Link>
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-cormorant font-light text-2xl text-stone-900"
          >
            Your Vault
          </motion.h1>
          {!isLoading && !isEmpty && (
            <span className="font-inter text-xs text-stone-400">
              {validCollection.length} fragrance{validCollection.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
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
          <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
            <Droplets className="w-10 h-10 text-stone-300" />
          </div>
          <p className="font-inter text-stone-500 mb-8">
            Your collection starts here.
          </p>
          <Link href="/collection/add">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="font-inter text-stone-800 border-2 border-stone-300 px-8 py-3 rounded-full hover:border-stone-800 transition-colors"
            >
              + Add a fragrance
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        /* Collection Grid */
        <div className="px-3 pb-28">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2"
          >
            <AnimatePresence mode="popLayout">
              {validCollection.map((item, index) => {
                const scentFamily = item.perfume?.scentFamily?.toLowerCase() || "";
                const styles = scentFamilyStyles[scentFamily] || defaultStyle;

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.02 * Math.min(index, 12) }}
                    className={`bg-gradient-to-br ${styles.gradient} rounded-lg p-2 border border-white/60 shadow-sm hover:shadow transition-all group relative`}
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteClick(item._id, item.perfume?.name || "Fragrance", e)}
                      className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-white/90 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-stone-400 hover:text-red-500" />
                    </button>

                    {/* Fragrance image or placeholder */}
                    <FragranceImage
                      src={item.perfume?.imageUrl}
                      alt={item.perfume?.name || "Fragrance"}
                      name={item.perfume?.name}
                      styles={styles}
                    />

                    {/* Info section */}
                    <div className="mt-1.5">
                      {/* Name */}
                      <h3 className="font-cormorant font-medium text-xs text-stone-800 leading-tight line-clamp-2">
                        {item.perfume?.name}
                      </h3>

                      {/* House */}
                      <p className="font-inter text-[10px] text-stone-500 truncate">
                        {item.perfume?.house}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Fixed bottom CTA - only show when collection has items */}
      {!isLoading && !isEmpty && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent">
          <Link href="/collection/add">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-stone-800 text-white font-inter px-5 py-3 rounded-full hover:bg-stone-900 transition-colors text-sm"
            >
              + Add fragrance
            </motion.button>
          </Link>
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            isOpen={!!deleteTarget}
            perfumeName={deleteTarget.name}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
