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
        currentStreak: 0,
        favoriteFamily: null,
        favoritePerfume: null,
        familyBreakdown: [],
        // Legacy fields for backward compatibility
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

    // Calculate family breakdown with percentages
    const totalFamilyWears = Object.values(familyCounts).reduce((a, b) => a + b, 0);
    const familyBreakdown = sortedFamilies.map(({ family, count }) => ({
      family,
      percentage: Math.round((count / totalFamilyWears) * 100),
    }));

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

    // Calculate current streak (consecutive days wearing fragrance)
    const currentStreak = calculateStreak(entries.map((e) => e.wornAt));

    // Get favorite family and perfume
    const favoriteFamily = sortedFamilies[0]?.family || null;
    const favoritePerfume = mostWorn[0]
      ? { name: mostWorn[0].name, house: mostWorn[0].house || "", wearCount: mostWorn[0].count }
      : null;

    return {
      totalWears: entries.length,
      currentStreak,
      favoriteFamily,
      favoritePerfume,
      familyBreakdown,
      // Legacy fields for backward compatibility
      familyCounts,
      sortedFamilies,
      mostWorn,
      firstWear,
      lastWear,
      uniquePerfumes: Object.keys(perfumeCounts).length,
    };
  },
});

// Helper function to calculate streak of consecutive days
function calculateStreak(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;

  // Get unique dates (as strings YYYY-MM-DD)
  const uniqueDates = [...new Set(
    timestamps.map((ts) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })
  )].sort().reverse(); // Most recent first

  // Check if today or yesterday is in the list (streak must be current)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  // If most recent wear isn't today or yesterday, streak is 0
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  // Count consecutive days
  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const next = new Date(uniqueDates[i + 1]);
    const diffDays = Math.round((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
