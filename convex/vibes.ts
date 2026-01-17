import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveVibe = mutation({
  args: {
    sessionId: v.id("sessions"),
    name: v.string(),
    notes: v.optional(v.string()),
    hasImage: v.boolean(),
    perfumeName: v.string(),
    perfumeHouse: v.string(),
    scentFamily: v.string(),
    auraWords: v.array(v.string()),
    mood: v.string(),
    occasion: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const vibeId = await ctx.db.insert("vibes", {
      userId: identity.subject,
      sessionId: args.sessionId,
      name: args.name,
      notes: args.notes,
      hasImage: args.hasImage,
      perfumeName: args.perfumeName,
      perfumeHouse: args.perfumeHouse,
      scentFamily: args.scentFamily,
      auraWords: args.auraWords,
      mood: args.mood,
      occasion: args.occasion,
      createdAt: Date.now(),
    });

    return vibeId;
  },
});

export const getUserVibes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const vibes = await ctx.db
      .query("vibes")
      .withIndex("by_user_created", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return vibes;
  },
});

export const getVibe = query({
  args: { vibeId: v.id("vibes") },
  handler: async (ctx, args) => {
    const vibe = await ctx.db.get(args.vibeId);
    return vibe;
  },
});

export const deleteVibe = mutation({
  args: { vibeId: v.id("vibes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const vibe = await ctx.db.get(args.vibeId);
    if (!vibe) {
      throw new Error("Vibe not found");
    }

    // Ensure user owns this vibe
    if (vibe.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.vibeId);
    return { success: true };
  },
});
