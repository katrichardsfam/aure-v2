// convex/sessions.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { weatherConditions, humidityLevels } from "./schema";

// Get user's session history
export const getHistory = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Fetch perfume details for each session
    const sessionsWithPerfumes = await Promise.all(
      sessions.map(async (session) => {
        if (session.recommendedPerfumeId) {
          const userPerfume = await ctx.db.get(session.recommendedPerfumeId);
          if (userPerfume) {
            const perfume = await ctx.db.get(userPerfume.perfumeId);
            return { ...session, perfume };
          }
        }
        return session;
      })
    );

    return sessionsWithPerfumes;
  },
});

// Get a specific session
export const get = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    
    if (!session) return null;

    if (session.recommendedPerfumeId) {
      const userPerfume = await ctx.db.get(session.recommendedPerfumeId);
      if (userPerfume) {
        const perfume = await ctx.db.get(userPerfume.perfumeId);
        return { ...session, perfume, userPerfume };
      }
    }

    return session;
  },
});

// Create a new Fit Check session
export const create = mutation({
  args: {
    userId: v.string(),
    outfitStyles: v.array(v.string()),
    mood: v.string(),
    scentDirections: v.array(v.string()),
    occasion: v.string(),
    weather: v.optional(v.object({
      temperature: v.optional(v.number()),
      temperatureCategory: weatherConditions,
      humidity: v.optional(v.number()),
      humidityCategory: v.optional(humidityLevels),
      condition: v.optional(v.string()),
      location: v.optional(v.string()),
      isManual: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      userId: args.userId,
      outfitStyles: args.outfitStyles,
      mood: args.mood,
      scentDirections: args.scentDirections,
      occasion: args.occasion,
      weather: args.weather,
      createdAt: Date.now(),
    });
  },
});

// Update session with recommendation
export const setRecommendation = mutation({
  args: {
    sessionId: v.id("sessions"),
    recommendedPerfumeId: v.id("userPerfumes"),
    recommendationType: v.string(),
    matchScore: v.number(),
    editorialExplanation: v.string(),
    affirmation: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      recommendedPerfumeId: args.recommendedPerfumeId,
      recommendationType: args.recommendationType,
      matchScore: args.matchScore,
      editorialExplanation: args.editorialExplanation,
      affirmation: args.affirmation,
      completedAt: Date.now(),
    });
  },
});

// Get today's session for user (if exists)
export const getTodaySession = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(1);

    const latestSession = sessions[0];

    if (latestSession && latestSession.createdAt >= startOfDay && latestSession.completedAt) {
      // Fetch perfume details
      if (latestSession.recommendedPerfumeId) {
        const userPerfume = await ctx.db.get(latestSession.recommendedPerfumeId);
        if (userPerfume) {
          const perfume = await ctx.db.get(userPerfume.perfumeId);
          return { ...latestSession, perfume, userPerfume };
        }
      }
      return latestSession;
    }

    return null;
  },
});

// ============================================
// COMBINED SESSION + RECOMMENDATION MUTATION
// ============================================

// Scoring weights for recommendation algorithm
const WEIGHTS = {
  scentFamily: 30,
  mood: 25,
  occasion: 20,
  weather: 15,
  outfitStyle: 10,
};

// Create session and generate recommendation in one step
export const createWithRecommendation = mutation({
  args: {
    userId: v.string(),
    outfitStyles: v.array(v.string()),
    mood: v.string(),
    scentDirections: v.array(v.string()),
    occasion: v.string(),
    weather: v.optional(v.object({
      temperature: v.optional(v.number()),
      temperatureCategory: weatherConditions,
      humidity: v.optional(v.number()),
      humidityCategory: v.optional(humidityLevels),
      condition: v.optional(v.string()),
      location: v.optional(v.string()),
      isManual: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    console.log("=== Creating session with recommendation ===");
    console.log("User ID:", args.userId);
    console.log("Outfit styles:", args.outfitStyles);
    console.log("Mood:", args.mood);
    console.log("Scent directions:", args.scentDirections);
    console.log("Occasion:", args.occasion);
    console.log("Weather:", args.weather);

    // Create the session first
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      outfitStyles: args.outfitStyles,
      mood: args.mood,
      scentDirections: args.scentDirections,
      occasion: args.occasion,
      weather: args.weather,
      createdAt: Date.now(),
    });

    // Get user's collection
    const userPerfumes = await ctx.db
      .query("userPerfumes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    console.log("User's perfume collection count:", userPerfumes.length);

    if (userPerfumes.length === 0) {
      console.log("No perfumes in collection - cannot generate recommendation");
      return sessionId;
    }

    // Get full perfume details and calculate scores
    const scoredPerfumes = await Promise.all(
      userPerfumes.map(async (up) => {
        const perfume = await ctx.db.get(up.perfumeId);
        if (!perfume) {
          console.log("Perfume not found for userPerfume:", up._id);
          return null;
        }

        let score = 0;
        const scoreBreakdown: Record<string, number> = {};

        // Scent family match
        console.log(`\n--- Scoring ${perfume.name} ---`);
        console.log("Perfume scent family:", perfume.scentFamily);
        console.log("User's scent directions:", args.scentDirections);

        if (args.scentDirections.includes(perfume.scentFamily)) {
          score += WEIGHTS.scentFamily;
          scoreBreakdown.scentFamily = WEIGHTS.scentFamily;
          console.log("  Primary scent family match! +", WEIGHTS.scentFamily);
        } else if (perfume.secondaryScentFamily &&
                   args.scentDirections.includes(perfume.secondaryScentFamily)) {
          score += WEIGHTS.scentFamily * 0.5;
          scoreBreakdown.scentFamily = WEIGHTS.scentFamily * 0.5;
          console.log("  Secondary scent family match! +", WEIGHTS.scentFamily * 0.5);
        } else {
          console.log("  No scent family match");
        }

        // Mood match
        console.log("Perfume moods:", perfume.moods);
        console.log("User's mood:", args.mood);
        if (perfume.moods && perfume.moods.includes(args.mood)) {
          score += WEIGHTS.mood;
          scoreBreakdown.mood = WEIGHTS.mood;
          console.log("  Mood match! +", WEIGHTS.mood);
        } else {
          console.log("  No mood match");
        }

        // Occasion match
        console.log("Perfume occasions:", perfume.occasions);
        console.log("User's occasion:", args.occasion);
        if (perfume.occasions && perfume.occasions.includes(args.occasion)) {
          score += WEIGHTS.occasion;
          scoreBreakdown.occasion = WEIGHTS.occasion;
          console.log("  Occasion match! +", WEIGHTS.occasion);
        } else {
          console.log("  No occasion match");
        }

        // Weather match
        const weatherCategory = args.weather?.temperatureCategory;
        console.log("Weather category:", weatherCategory);
        console.log("Perfume ideal temperatures:", perfume.weatherPerformance?.idealTemperature);
        if (weatherCategory &&
            perfume.weatherPerformance?.idealTemperature?.includes(weatherCategory)) {
          score += WEIGHTS.weather;
          scoreBreakdown.weather = WEIGHTS.weather;
          console.log("  Weather match! +", WEIGHTS.weather);
          if (perfume.weatherPerformance.temperatureBoost) {
            const boost = perfume.weatherPerformance.temperatureBoost * 5;
            score += boost;
            scoreBreakdown.weatherBoost = boost;
            console.log("  Weather boost! +", boost);
          }
        } else {
          console.log("  No weather match");
        }

        // Outfit style match
        console.log("Perfume outfit styles:", perfume.outfitStyles);
        console.log("User's outfit styles:", args.outfitStyles);
        if (perfume.outfitStyles && args.outfitStyles.length > 0) {
          const styleMatches = args.outfitStyles.filter(s =>
            perfume.outfitStyles.includes(s)
          ).length;
          const styleScore = (styleMatches / Math.max(args.outfitStyles.length, 1)) * WEIGHTS.outfitStyle;
          score += styleScore;
          scoreBreakdown.outfitStyle = styleScore;
          console.log(`  Outfit style matches: ${styleMatches}/${args.outfitStyles.length} +`, styleScore);
        }

        // Boost favorites slightly
        if (up.isFavorite) {
          score += 5;
          scoreBreakdown.favorite = 5;
          console.log("  Favorite bonus! +5");
        }

        // Stronger penalty if worn recently
        if (up.lastWornAt) {
          const daysSinceWorn = (Date.now() - up.lastWornAt) / (1000 * 60 * 60 * 24);
          if (daysSinceWorn < 1) {
            // Worn today - heavy penalty
            score -= 50;
            scoreBreakdown.recentlyWorn = -50;
            console.log("  Worn today penalty! -50");
          } else if (daysSinceWorn < 3) {
            score -= 25;
            scoreBreakdown.recentlyWorn = -25;
            console.log("  Worn in last 3 days penalty! -25");
          } else if (daysSinceWorn < 7) {
            score -= 10;
            scoreBreakdown.recentlyWorn = -10;
            console.log("  Worn this week penalty! -10");
          }
        } else {
          // Bonus for never-worn perfumes to encourage variety
          score += 5;
          scoreBreakdown.neverWorn = 5;
          console.log("  Never worn bonus! +5");
        }

        // Add small random factor (0-3) to break ties and add variety
        const randomFactor = Math.random() * 3;
        score += randomFactor;
        scoreBreakdown.random = randomFactor;
        console.log(`  Random factor: +${randomFactor.toFixed(2)}`);

        const finalScore = Math.max(0, score);
        console.log(`  TOTAL SCORE: ${finalScore.toFixed(2)}`);
        console.log("  Score breakdown:", scoreBreakdown);

        return {
          userPerfume: up,
          perfume,
          score: finalScore,
        };
      })
    );

    // Filter out nulls and sort by score (highest first)
    const validPerfumes = scoredPerfumes
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.score - a.score);

    console.log("\n=== Final Rankings ===");
    validPerfumes.forEach((p, i) => {
      console.log(`${i + 1}. ${p.perfume.name} - Score: ${p.score}`);
    });

    if (validPerfumes.length === 0) {
      console.log("No valid perfumes after scoring");
      return sessionId;
    }

    const topMatch = validPerfumes[0];
    const recommendationType = getRecommendationType(topMatch.score);

    console.log("\n=== Top Match ===");
    console.log("Perfume:", topMatch.perfume.name);
    console.log("Score:", topMatch.score);
    console.log("Recommendation type:", recommendationType);

    // Generate editorial explanation
    const editorialExplanation = generateEditorialExplanation(
      topMatch.perfume,
      args.mood,
      args.occasion,
      args.weather?.temperatureCategory
    );

    // Get affirmation for mood
    const affirmation = getAffirmationForMood(args.mood);

    // Update session with recommendation
    await ctx.db.patch(sessionId, {
      recommendedPerfumeId: topMatch.userPerfume._id,
      recommendationType,
      matchScore: topMatch.score,
      editorialExplanation,
      affirmation,
      completedAt: Date.now(),
    });

    console.log("Session updated with recommendation successfully!");
    return sessionId;
  },
});

function getRecommendationType(score: number): string {
  if (score >= 80) return "perfect-match";
  if (score >= 60) return "strong-match";
  if (score >= 40) return "good-match";
  return "suggested";
}

function generateEditorialExplanation(
  perfume: { name: string; scentFamily: string; moods?: string[]; auraWords?: string[] },
  mood: string,
  occasion: string,
  weatherCategory?: string
): string {
  const scentDescriptions: Record<string, string> = {
    fresh: "crisp and invigorating notes",
    floral: "soft, romantic florals",
    woody: "grounding, earthy woods",
    amber: "warm, resinous depth",
    gourmand: "comforting, delicious warmth",
    musky: "subtle, skin-like sensuality",
  };

  const occasionPhrases: Record<string, string> = {
    work: "professional yet memorable",
    date: "captivating and intimate",
    casual: "effortlessly chic",
    event: "statement-making",
    home: "comforting and personal",
  };

  const moodPhrases: Record<string, string> = {
    confident: "projects assured presence",
    soft: "wraps you in gentle warmth",
    playful: "sparks joy and spontaneity",
    mysterious: "leaves an intriguing trail",
  };

  const scentDesc = scentDescriptions[perfume.scentFamily] || "beautifully balanced notes";
  const occasionPhrase = occasionPhrases[occasion.toLowerCase()] || "perfect for the moment";
  const moodPhrase = moodPhrases[mood] || "matches your energy beautifully";

  let explanation = `${perfume.name}'s ${scentDesc} feel ${occasionPhrase} today. This scent ${moodPhrase}`;

  if (weatherCategory) {
    const weatherPhrases: Record<string, string> = {
      hot: ", and performs wonderfully in the heat",
      warm: ", enhanced by the warm weather",
      mild: ", perfect for today's comfortable weather",
      cool: ", adding warmth to the cool air",
      cold: ", providing cozy comfort against the cold",
    };
    explanation += weatherPhrases[weatherCategory] || "";
  }

  explanation += ".";
  return explanation;
}

function getAffirmationForMood(mood: string): string {
  const affirmations: Record<string, string> = {
    confident: "You carry your own warmth today.",
    soft: "Your gentleness is your strength.",
    playful: "Joy radiates from you effortlessly.",
    mysterious: "Let them wonder what your secret is.",
  };
  return affirmations[mood] || "You are exactly where you need to be.";
}
