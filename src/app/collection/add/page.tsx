// src/app/collection/add/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const MOOD_TAGS = ["Confident", "Soft", "Playful", "Mysterious"] as const;

interface FragranceResult {
  id: string;
  name: string;
  house: string;
  scentFamily: string;
  imageUrl?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AddFragrancePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FragranceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFragrance, setSelectedFragrance] = useState<FragranceResult | null>(null);
  const [fragranceName, setFragranceName] = useState("");
  const [house, setHouse] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search for fragrances when debounced query changes
  const searchFragrances = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/fragrances/search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      
      if (data.results) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      searchFragrances(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, searchFragrances]);

  const handleSelectFragrance = (fragrance: FragranceResult) => {
    setSelectedFragrance(fragrance);
    setSearchQuery("");
    setSearchResults([]);
    // Clear manual fields when selecting from search
    setFragranceName("");
    setHouse("");
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleSave = () => {
    // TODO: Save to Convex
    router.push("/collection");
  };

  const canSave = selectedFragrance !== null || fragranceName.trim() !== "";

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <Link
          href="/collection"
          className="font-inter text-sm text-stone-500 mb-4 block hover:text-stone-700 transition-colors"
        >
          ← Back to Vault
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-cormorant font-light text-3xl text-stone-900"
        >
          Add a fragrance
        </motion.h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 pb-32 space-y-6"
      >
        {/* Search */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Clear selected fragrance when typing new search
                if (selectedFragrance) {
                  setSelectedFragrance(null);
                }
              }}
              placeholder="Search by name or brand..."
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 font-inter text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden"
            >
              {searchResults.map((fragrance) => (
                <button
                  key={fragrance.id}
                  onClick={() => handleSelectFragrance(fragrance)}
                  className="w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-b-0"
                >
                  <p className="font-cormorant text-lg text-stone-800">
                    {fragrance.name}
                  </p>
                  <p className="font-inter text-sm text-stone-500">
                    {fragrance.house}
                  </p>
                </button>
              ))}
            </motion.div>
          )}

          {/* Selected Fragrance Display */}
          {selectedFragrance && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white rounded-2xl p-4 border border-stone-200 flex items-center justify-between"
            >
              <div>
                <p className="font-cormorant text-xl text-stone-800">
                  {selectedFragrance.name}
                </p>
                <p className="font-inter text-sm text-stone-500">
                  {selectedFragrance.house}
                </p>
                <span className="inline-block mt-1 px-3 py-1 bg-stone-100 rounded-full font-inter text-xs text-stone-600">
                  {selectedFragrance.scentFamily}
                </span>
              </div>
              <button
                onClick={() => setSelectedFragrance(null)}
                className="font-inter text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                Remove
              </button>
            </motion.div>
          )}
        </div>

        {/* Manual add section */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100">
          <p className="font-inter text-sm text-stone-500 mb-4">Or add manually</p>

          <div className="space-y-4">
            <input
              type="text"
              value={fragranceName}
              onChange={(e) => setFragranceName(e.target.value)}
              placeholder="Fragrance name"
              className="w-full border-b border-stone-200 py-2 font-inter text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 bg-transparent transition-colors"
            />
            <input
              type="text"
              value={house}
              onChange={(e) => setHouse(e.target.value)}
              placeholder="Brand / House"
              className="w-full border-b border-stone-200 py-2 font-inter text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 bg-transparent transition-colors"
            />
          </div>
        </div>

        {/* Optional mood tags */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100">
          <p className="font-inter text-sm text-stone-500 mb-4">
            This scent makes me feel...{" "}
            <span className="text-stone-400">(optional)</span>
          </p>

          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map((mood) => (
              <motion.button
                key={mood}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleMood(mood)}
                className={`px-4 py-2 rounded-full border font-inter text-sm transition-colors ${
                  selectedMoods.includes(mood)
                    ? "border-stone-800 bg-stone-800 text-white"
                    : "border-stone-200 text-stone-600 hover:border-stone-400"
                }`}
              >
                {mood}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Fixed bottom save button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
        <motion.button
          whileHover={{ scale: canSave ? 1.02 : 1 }}
          whileTap={{ scale: canSave ? 0.98 : 1 }}
          onClick={handleSave}
          disabled={!canSave}
          className={`w-full font-inter px-6 py-4 rounded-full transition-colors ${
            canSave
              ? "bg-stone-800 text-white hover:bg-stone-900"
              : "bg-stone-300 text-stone-500 cursor-not-allowed"
          }`}
        >
          Save to Vault
        </motion.button>
      </div>
    </div>
  );
}
