// convex/userPreferences.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get user preferences
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Create or update user preferences
export const upsert = mutation({
  args: {
    userId: v.string(),
    scentPreferences: v.optional(v.array(v.string())),
    avoidNotes: v.optional(v.array(v.string())),
    defaultLocation: v.optional(v.object({
      city: v.string(),
      country: v.string(),
      lat: v.number(),
      lon: v.number(),
    })),
    useWeatherContext: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      const updates: Record<string, unknown> = {
        updatedAt: Date.now(),
      };
      
      if (args.scentPreferences !== undefined) {
        updates.scentPreferences = args.scentPreferences;
      }
      if (args.avoidNotes !== undefined) {
        updates.avoidNotes = args.avoidNotes;
      }
      if (args.defaultLocation !== undefined) {
        updates.defaultLocation = args.defaultLocation;
      }
      if (args.useWeatherContext !== undefined) {
        updates.useWeatherContext = args.useWeatherContext;
      }

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("userPreferences", {
        userId: args.userId,
        scentPreferences: args.scentPreferences,
        avoidNotes: args.avoidNotes,
        defaultLocation: args.defaultLocation,
        useWeatherContext: args.useWeatherContext ?? true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Update scent preferences
export const updateScentPreferences = mutation({
  args: {
    userId: v.string(),
    scentPreferences: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        scentPreferences: args.scentPreferences,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        scentPreferences: args.scentPreferences,
        useWeatherContext: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Update avoid notes
export const updateAvoidNotes = mutation({
  args: {
    userId: v.string(),
    avoidNotes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        avoidNotes: args.avoidNotes,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        avoidNotes: args.avoidNotes,
        useWeatherContext: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Toggle weather context
export const toggleWeatherContext = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        useWeatherContext: !existing.useWeatherContext,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        useWeatherContext: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
