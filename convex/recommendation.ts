// convex/recommendation.ts
import { v } from "convex/values";
import { query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Scoring weights for recommendation algorithm
const WEIGHTS = {
  scentFamily: 30,
  mood: 25,
  occasion: 20,
  weather: 15,
  outfitStyle: 10,
};

// Get recommendation based on session inputs
export const getRecommendation = query({
  args: {
    userId: v.string(),
    outfitStyles: v.array(v.string()),
    mood: v.string(),
    scentDirections: v.array(v.string()),
    occasion: v.string(),
    weatherCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user's collection
    const userPerfumes = await ctx.db
      .query("userPerfumes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (userPerfumes.length === 0) {
      return null;
    }

    // Get full perfume details and calculate scores
    const scoredPerfumes = await Promise.all(
      userPerfumes.map(async (up) => {
        const perfume = await ctx.db.get(up.perfumeId);
        if (!perfume) return null;

        let score = 0;

        // Scent family match
        if (args.scentDirections.includes(perfume.scentFamily)) {
          score += WEIGHTS.scentFamily;
        } else if (perfume.secondaryScentFamily && 
                   args.scentDirections.includes(perfume.secondaryScentFamily)) {
          score += WEIGHTS.scentFamily * 0.5;
        }

        // Mood match
        if (perfume.moods.includes(args.mood)) {
          score += WEIGHTS.mood;
        }

        // Occasion match
        if (perfume.occasions.includes(args.occasion)) {
          score += WEIGHTS.occasion;
        }

        // Weather match
        if (args.weatherCategory && 
            perfume.weatherPerformance.idealTemperature.includes(args.weatherCategory as "hot" | "warm" | "mild" | "cool" | "cold")) {
          score += WEIGHTS.weather;
          // Apply weather boost if defined
          if (perfume.weatherPerformance.temperatureBoost) {
            score += perfume.weatherPerformance.temperatureBoost * 5;
          }
        }

        // Outfit style match
        const styleMatches = args.outfitStyles.filter(s => 
          perfume.outfitStyles.includes(s)
        ).length;
        score += (styleMatches / Math.max(args.outfitStyles.length, 1)) * WEIGHTS.outfitStyle;

        // Boost favorites slightly
        if (up.isFavorite) {
          score += 5;
        }

        // Slight penalty if worn recently (encourage variety)
        if (up.lastWornAt) {
          const daysSinceWorn = (Date.now() - up.lastWornAt) / (1000 * 60 * 60 * 24);
          if (daysSinceWorn < 2) {
            score -= 10;
          } else if (daysSinceWorn < 7) {
            score -= 5;
          }
        }

        return {
          userPerfume: up,
          perfume,
          score: Math.max(0, score),
        };
      })
    );

    // Filter out nulls and sort by score
    const validPerfumes = scoredPerfumes
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.score - a.score);

    if (validPerfumes.length === 0) {
      return null;
    }

    const topMatch = validPerfumes[0];

    return {
      userPerfumeId: topMatch.userPerfume._id,
      perfume: topMatch.perfume,
      matchScore: topMatch.score,
      recommendationType: getRecommendationType(topMatch.score),
      auraWords: topMatch.perfume.auraWords.slice(0, 3),
    };
  },
});

function getRecommendationType(score: number): string {
  if (score >= 80) return "perfect-match";
  if (score >= 60) return "strong-match";
  if (score >= 40) return "good-match";
  return "suggested";
}

// Get aura words for a mood
export const getAuraWords = query({
  args: { mood: v.string() },
  handler: async (_, args) => {
    const moodWords: Record<string, string[]> = {
      confident: ["Grounded", "Bold", "Assured"],
      soft: ["Gentle", "Approachable", "Serene"],
      playful: ["Spirited", "Light", "Joyful"],
      mysterious: ["Intriguing", "Subtle", "Deep"],
    };
    return moodWords[args.mood] || ["Balanced", "Present", "Authentic"];
  },
});

// Get affirmation for a mood
export const getAffirmation = query({
  args: { mood: v.string() },
  handler: async (_, args) => {
    const affirmations: Record<string, string> = {
      confident: "You carry your own warmth today.",
      soft: "Your gentleness is your strength.",
      playful: "Joy radiates from you effortlessly.",
      mysterious: "Let them wonder what your secret is.",
    };
    return affirmations[args.mood] || "You are exactly where you need to be.";
  },
});
