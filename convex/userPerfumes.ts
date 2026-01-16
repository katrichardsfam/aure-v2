// convex/userPerfumes.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get user's perfume collection
export const getCollection = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userPerfumes = await ctx.db
      .query("userPerfumes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Fetch full perfume details for each
    const collection = await Promise.all(
      userPerfumes.map(async (up) => {
        const perfume = await ctx.db.get(up.perfumeId);
        return {
          ...up,
          perfume,
        };
      })
    );

    return collection;
  },
});

// Get user's favorite perfumes
export const getFavorites = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("userPerfumes")
      .withIndex("by_user_favorite", (q) => 
        q.eq("userId", args.userId).eq("isFavorite", true)
      )
      .collect();

    const collection = await Promise.all(
      favorites.map(async (up) => {
        const perfume = await ctx.db.get(up.perfumeId);
        return {
          ...up,
          perfume,
        };
      })
    );

    return collection;
  },
});

// Add perfume to user's collection
export const add = mutation({
  args: {
    userId: v.string(),
    perfumeId: v.id("perfumes"),
    nickname: v.optional(v.string()),
    personalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already in collection
    const existing = await ctx.db
      .query("userPerfumes")
      .withIndex("by_user_perfume", (q) => 
        q.eq("userId", args.userId).eq("perfumeId", args.perfumeId)
      )
      .first();

    if (existing) {
      throw new Error("Perfume already in collection");
    }

    return await ctx.db.insert("userPerfumes", {
      userId: args.userId,
      perfumeId: args.perfumeId,
      nickname: args.nickname,
      personalNotes: args.personalNotes,
      dislikedNotes: [],
      isFavorite: false,
      wearCount: 0,
      createdAt: Date.now(),
    });
  },
});

// Remove perfume from user's collection
export const remove = mutation({
  args: { 
    userId: v.string(),
    userPerfumeId: v.id("userPerfumes"),
  },
  handler: async (ctx, args) => {
    const userPerfume = await ctx.db.get(args.userPerfumeId);
    
    if (!userPerfume || userPerfume.userId !== args.userId) {
      throw new Error("Perfume not found in collection");
    }

    await ctx.db.delete(args.userPerfumeId);
  },
});

// Toggle favorite status
export const toggleFavorite = mutation({
  args: { 
    userId: v.string(),
    userPerfumeId: v.id("userPerfumes"),
  },
  handler: async (ctx, args) => {
    const userPerfume = await ctx.db.get(args.userPerfumeId);
    
    if (!userPerfume || userPerfume.userId !== args.userId) {
      throw new Error("Perfume not found in collection");
    }

    await ctx.db.patch(args.userPerfumeId, {
      isFavorite: !userPerfume.isFavorite,
    });
  },
});

// Update user perfume details
export const update = mutation({
  args: {
    userId: v.string(),
    userPerfumeId: v.id("userPerfumes"),
    nickname: v.optional(v.string()),
    personalNotes: v.optional(v.string()),
    dislikedNotes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userPerfume = await ctx.db.get(args.userPerfumeId);
    
    if (!userPerfume || userPerfume.userId !== args.userId) {
      throw new Error("Perfume not found in collection");
    }

    const updates: Record<string, unknown> = {};
    if (args.nickname !== undefined) updates.nickname = args.nickname;
    if (args.personalNotes !== undefined) updates.personalNotes = args.personalNotes;
    if (args.dislikedNotes !== undefined) updates.dislikedNotes = args.dislikedNotes;

    await ctx.db.patch(args.userPerfumeId, updates);
  },
});

// Mark perfume as worn
export const markWorn = mutation({
  args: { 
    userId: v.string(),
    userPerfumeId: v.id("userPerfumes"),
  },
  handler: async (ctx, args) => {
    const userPerfume = await ctx.db.get(args.userPerfumeId);
    
    if (!userPerfume || userPerfume.userId !== args.userId) {
      throw new Error("Perfume not found in collection");
    }

    await ctx.db.patch(args.userPerfumeId, {
      wearCount: userPerfume.wearCount + 1,
      lastWornAt: Date.now(),
    });
  },
});
