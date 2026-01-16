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
