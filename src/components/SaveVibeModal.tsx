"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

interface SaveVibeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: Id<"sessions">;
  perfumeName: string;
  perfumeHouse: string;
  scentFamily: string;
  auraWords: string[];
  mood: string;
  occasion: string;
}

// Scent family to gradient mapping (matches recommendation screen)
const scentFamilyColors: Record<string, { bg: string; accent: string }> = {
  woody: { bg: "from-amber-50 to-orange-50", accent: "bg-amber-100" },
  fresh: { bg: "from-emerald-50 to-teal-50", accent: "bg-emerald-100" },
  floral: { bg: "from-rose-50 to-pink-50", accent: "bg-rose-100" },
  amber: { bg: "from-orange-50 to-amber-50", accent: "bg-orange-100" },
  oriental: { bg: "from-amber-50 to-red-50", accent: "bg-amber-100" },
  citrus: { bg: "from-yellow-50 to-amber-50", accent: "bg-yellow-100" },
  aquatic: { bg: "from-cyan-50 to-blue-50", accent: "bg-cyan-100" },
  gourmand: { bg: "from-orange-50 to-amber-50", accent: "bg-orange-100" },
  green: { bg: "from-lime-50 to-emerald-50", accent: "bg-lime-100" },
  powdery: { bg: "from-violet-50 to-pink-50", accent: "bg-violet-100" },
  musky: { bg: "from-stone-100 to-neutral-50", accent: "bg-stone-200" },
};

export default function SaveVibeModal({
  isOpen,
  onClose,
  sessionId,
  perfumeName,
  perfumeHouse,
  scentFamily,
  auraWords,
  mood,
  occasion,
}: SaveVibeModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vibeName, setVibeName] = useState("");
  const [notes, setNotes] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Get the mutation
  const saveVibe = useMutation(api.vibes.saveVibe);

  const colors =
    scentFamilyColors[scentFamily?.toLowerCase()] || scentFamilyColors.woody;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!vibeName.trim()) {
      setError("Give your vibe a name");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await saveVibe({
        sessionId,
        name: vibeName.trim(),
        notes: notes.trim() || undefined,
        hasImage: !!imagePreview,
        perfumeName,
        perfumeHouse,
        scentFamily,
        auraWords,
        mood,
        occasion,
      });

      // Success - close modal and navigate
      onClose();
      router.push("/vibes");
    } catch (err: unknown) {
      console.error("Failed to save vibe:", err);
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message.includes("authenticated") ? "Please log in to save vibes" : "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setVibeName("");
    setNotes("");
    setImagePreview(null);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleBackdropClick}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[90vh] overflow-y-auto isolate"
          >
            <div
              className="bg-white rounded-t-3xl shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-stone-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="font-cormorant font-light text-2xl text-stone-900">
                    Save this vibe
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 -mr-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Card */}
              <div className="mx-6 mb-6">
                <div
                  className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-4 border border-white/60`}
                >
                  <div className="flex items-start gap-3">
                    {/* Scent family indicator */}
                    <div
                      className={`w-12 h-12 ${colors.accent} rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-2xl">✨</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cormorant text-lg text-stone-800 truncate">
                        {perfumeName}
                      </p>
                      <p className="text-sm text-stone-500 truncate">
                        {perfumeHouse}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {auraWords.slice(0, 3).map((word, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 bg-white/60 rounded-full text-stone-600"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="px-6 space-y-5">
                {/* Vibe Name - Required */}
                <div>
                  <label className="block text-sm text-stone-500 mb-2">
                    Name this vibe <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={vibeName}
                    onChange={(e) => {
                      setVibeName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g., Weekend brunch energy"
                    className={`w-full border ${
                      error ? "border-red-300" : "border-stone-200"
                    } rounded-xl px-4 py-3.5 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all`}
                    maxLength={50}
                  />
                  {error && (
                    <p className="text-sm text-red-500 mt-1.5">{error}</p>
                  )}
                </div>

                {/* Outfit Image - Optional */}
                <div>
                  <label className="block text-sm text-stone-500 mb-2">
                    Add an outfit photo{" "}
                    <span className="text-stone-400">(optional)</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative bg-stone-100 rounded-xl p-2">
                      <img
                        src={imagePreview}
                        alt="Outfit preview"
                        className="w-full max-h-64 object-contain rounded-lg mx-auto"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-stone-200 rounded-xl p-6 text-center hover:border-stone-300 hover:bg-stone-50/50 transition-all group"
                    >
                      <Camera className="w-8 h-8 text-stone-300 mx-auto mb-2 group-hover:text-stone-400 transition-colors" />
                      <p className="text-sm text-stone-400 group-hover:text-stone-500 transition-colors">
                        Tap to upload
                      </p>
                    </button>
                  )}
                </div>

                {/* Notes - Optional */}
                <div>
                  <label className="block text-sm text-stone-500 mb-2">
                    Notes <span className="text-stone-400">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did this scent make you feel?"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none h-24"
                    maxLength={500}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="px-6 pt-6 pb-8">
                {error && !error.includes("name") && (
                  <p className="text-sm text-red-500 text-center mb-3">{error}</p>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-stone-800 hover:bg-stone-900 disabled:bg-stone-400 disabled:cursor-not-allowed text-white font-medium px-6 py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-stone-800/20"
                >
                  {isSaving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Save to your vibes
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
