import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user's wear history (most recent first)
export const getWearHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const limit = args.limit || 50;

    const entries = await ctx.db
      .query("wearLog")
      .withIndex("by_user_date", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit);

    return entries;
  },
});

// Log a fragrance as worn
export const logWear = mutation({
  args: {
    perfumeId: v.id("perfumes"),
    perfumeName: v.string(),
    perfumeHouse: v.optional(v.string()),
    scentFamily: v.optional(v.string()),
    vibeId: v.optional(v.id("vibes")),
    sessionId: v.optional(v.id("sessions")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("wearLog", {
      userId: identity.subject,
      perfumeId: args.perfumeId,
      perfumeName: args.perfumeName,
      perfumeHouse: args.perfumeHouse,
      scentFamily: args.scentFamily,
      vibeId: args.vibeId,
      sessionId: args.sessionId,
      notes: args.notes,
      wornAt: Date.now(),
    });
  },
});

// Get wear stats for profile/analytics
export const getWearStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const entries = await ctx.db
      .query("wearLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    if (entries.length === 0) {
      return {
        totalWears: 0,
        familyCounts: {},
        sortedFamilies: [],
        mostWorn: [],
        firstWear: null,
        lastWear: null,
        uniquePerfumes: 0,
      };
    }

    // Count by scent family
    const familyCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      if (entry.scentFamily) {
        familyCounts[entry.scentFamily] =
          (familyCounts[entry.scentFamily] || 0) + 1;
      }
    });

    // Sort families by count (descending)
    const sortedFamilies = Object.entries(familyCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([family, count]) => ({ family, count }));

    // Find most worn perfumes
    const perfumeCounts: Record<
      string,
      { count: number; name: string; house?: string }
    > = {};
    entries.forEach((entry) => {
      const id = entry.perfumeId;
      if (!perfumeCounts[id]) {
        perfumeCounts[id] = {
          count: 0,
          name: entry.perfumeName,
          house: entry.perfumeHouse,
        };
      }
      perfumeCounts[id].count++;
    });

    const mostWorn = Object.entries(perfumeCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([id, data]) => ({ perfumeId: id, ...data }));

    // Calculate timestamps
    const timestamps = entries.map((e) => e.wornAt);
    const firstWear = Math.min(...timestamps);
    const lastWear = Math.max(...timestamps);

    return {
      totalWears: entries.length,
      familyCounts,
      sortedFamilies,
      mostWorn,
      firstWear,
      lastWear,
      uniquePerfumes: Object.keys(perfumeCounts).length,
    };
  },
});
