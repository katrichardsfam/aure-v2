// src/components/OutfitInput.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Camera,
  ImagePlus,
  FileText,
  Sparkles,
  ArrowRight,
  X,
  RefreshCw,
} from "lucide-react";

export interface OutfitAnalysis {
  styleCategories: string[];
  moodInference: string;
  colorPalette: string[];
  scentDirections: string[];
  description: string;
  confidence: number;
}

interface OutfitInputProps {
  onAnalysisComplete: (analysis: OutfitAnalysis, imageUrl: string | null) => void;
  onSkip: () => void;
}

type InputMode = "select" | "camera" | "upload" | "text" | "analyzing" | "result";

// Style category display names
const STYLE_LABELS: Record<string, string> = {
  clean: "Clean",
  minimalist: "Minimalist",
  streetwear: "Streetwear",
  romantic: "Romantic",
  glam: "Glam",
  cozy: "Cozy",
  corporate: "Corporate",
};

// Mood display with emoji
const MOOD_DISPLAY: Record<string, { label: string; emoji: string }> = {
  confident: { label: "Confident", emoji: "✨" },
  soft: { label: "Soft", emoji: "☁️" },
  playful: { label: "Playful", emoji: "🌈" },
  mysterious: { label: "Mysterious", emoji: "🌙" },
  grounded: { label: "Grounded", emoji: "🌿" },
  magnetic: { label: "Magnetic", emoji: "🧲" },
  powerful: { label: "Powerful", emoji: "⚡" },
  fresh: { label: "Fresh", emoji: "💨" },
  warm: { label: "Warm", emoji: "🔥" },
  sexy: { label: "Sexy", emoji: "💋" },
  creative: { label: "Creative", emoji: "🎨" },
};

// Scent direction labels
const SCENT_LABELS: Record<string, string> = {
  fresh: "Fresh",
  floral: "Floral",
  woody: "Woody",
  amber: "Amber",
  gourmand: "Gourmand",
  musky: "Musky",
};

export default function OutfitInput({ onAnalysisComplete, onSkip }: OutfitInputProps) {
  const [mode, setMode] = useState<InputMode>("select");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState("");
  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = useAction(api.gemini.analyzeOutfitImage);
  const analyzeText = useAction(api.gemini.analyzeOutfitText);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setMode("analyzing");

      try {
        // Extract base64 data
        const base64 = dataUrl.split(",")[1];
        const result = await analyzeImage({
          imageBase64: base64,
          mimeType: file.type,
        });
        setAnalysis(result);
        setMode("result");
      } catch (err) {
        console.error("Analysis failed:", err);
        setError("Failed to analyze image. Please try again.");
        setMode("select");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle text analysis
  const handleTextAnalyze = async () => {
    if (!textDescription.trim()) return;

    setMode("analyzing");
    setError(null);

    try {
      const result = await analyzeText({ description: textDescription });
      setAnalysis(result);
      setMode("result");
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze description. Please try again.");
      setMode("text");
    }
  };

  // Reset to selection
  const handleReset = () => {
    setMode("select");
    setImagePreview(null);
    setTextDescription("");
    setAnalysis(null);
    setError(null);
  };

  // Use the AI suggestions
  const handleUseSuggestions = () => {
    if (analysis) {
      onAnalysisComplete(analysis, imagePreview);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Selection Mode */}
        {mode === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h2 className="font-cormorant font-light text-2xl text-stone-800 mb-2">
                Show us your outfit
              </h2>
              <p className="font-inter text-sm text-stone-500">
                Let AI suggest scents that match your style
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl font-inter text-sm mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {/* Camera button */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 hover:bg-white/80 transition-all flex flex-col items-center gap-2"
              >
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-inter text-xs text-stone-700">Photo</span>
              </button>

              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 hover:bg-white/80 transition-all flex flex-col items-center gap-2"
              >
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center">
                  <ImagePlus className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-inter text-xs text-stone-700">Upload</span>
              </button>

              {/* Text description button */}
              <button
                onClick={() => setMode("text")}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 hover:bg-white/80 transition-all flex flex-col items-center gap-2"
              >
                <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-stone-600" />
                </div>
                <span className="font-inter text-xs text-stone-700">Describe</span>
              </button>
            </div>

            {/* Skip link */}
            <button
              onClick={onSkip}
              className="w-full pt-4 flex items-center justify-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <span className="font-inter text-sm">Skip</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        )}

        {/* Text Description Mode */}
        {mode === "text" && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cormorant text-xl text-stone-800">
                Describe your outfit
              </h3>
              <button
                onClick={handleReset}
                className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80">
              <textarea
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder="e.g. Black turtleneck with dark jeans and white sneakers, going for a minimalist vibe..."
                className="w-full h-32 bg-transparent font-inter text-stone-700 placeholder:text-stone-400 resize-none focus:outline-none"
              />
            </div>

            <button
              onClick={handleTextAnalyze}
              disabled={!textDescription.trim()}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-inter rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Analyze Outfit
            </button>
          </motion.div>
        )}

        {/* Analyzing Mode */}
        {mode === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12"
          >
            {imagePreview && (
              <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Outfit preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4"
            >
              <RefreshCw className="w-12 h-12 text-amber-500" />
            </motion.div>

            <p className="font-cormorant text-xl text-stone-700 mb-2">
              Reading your vibe...
            </p>
            <p className="font-inter text-sm text-stone-500">
              AI is analyzing your outfit
            </p>
          </motion.div>
        )}

        {/* Results Mode */}
        {mode === "result" && analysis && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-cormorant text-xl text-stone-800">
                  AI Analysis
                </h3>
              </div>
              <button
                onClick={handleReset}
                className="font-inter text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                Try again
              </button>
            </div>

            {/* Image preview if available */}
            {imagePreview && (
              <div className="w-full bg-stone-100/50 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Your outfit"
                  className="max-w-full max-h-72 object-contain"
                />
              </div>
            )}

            {/* Analysis card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/50 space-y-4">
              {/* Description */}
              <p className="font-inter text-stone-700 italic">
                &ldquo;{analysis.description}&rdquo;
              </p>

              {/* Style */}
              <div>
                <p className="font-inter text-xs text-stone-500 uppercase tracking-wide mb-2">
                  Style
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.styleCategories.map((style) => (
                    <span
                      key={style}
                      className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full font-inter text-sm"
                    >
                      {STYLE_LABELS[style] || style}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <p className="font-inter text-xs text-stone-500 uppercase tracking-wide mb-2">
                  Mood
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200">
                  <span className="text-lg">
                    {MOOD_DISPLAY[analysis.moodInference]?.emoji || "✨"}
                  </span>
                  <span className="font-inter text-stone-700">
                    {MOOD_DISPLAY[analysis.moodInference]?.label || analysis.moodInference}
                  </span>
                </span>
              </div>

              {/* Scent Directions */}
              <div>
                <p className="font-inter text-xs text-stone-500 uppercase tracking-wide mb-2">
                  Suggested Scents
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.scentDirections.map((scent) => (
                    <span
                      key={scent}
                      className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-full font-inter text-sm"
                    >
                      {SCENT_LABELS[scent] || scent}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color palette */}
              {analysis.colorPalette.length > 0 && (
                <div>
                  <p className="font-inter text-xs text-stone-500 uppercase tracking-wide mb-2">
                    Colors Detected
                  </p>
                  <div className="flex gap-2">
                    {analysis.colorPalette.map((color, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white rounded-full font-inter text-xs text-stone-600 border border-stone-200"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence */}
              <div className="pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="font-inter text-xs text-stone-400">
                    Confidence
                  </span>
                  <span className="font-inter text-xs text-stone-500">
                    {Math.round(analysis.confidence * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    style={{ width: `${analysis.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleUseSuggestions}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-inter rounded-full hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Use these suggestions
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onSkip}
                className="w-full py-3 text-stone-500 font-inter text-sm hover:text-stone-700 transition-colors"
              >
                Choose manually instead
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
