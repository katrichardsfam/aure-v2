// convex/userPerfumes.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get a single user perfume by ID
export const getById = query({
  args: { userPerfumeId: v.id("userPerfumes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userPerfume = await ctx.db.get(args.userPerfumeId);
    if (!userPerfume || userPerfume.userId !== identity.subject) {
      return null;
    }

    // Fetch full perfume details
    const perfume = await ctx.db.get(userPerfume.perfumeId);

    return {
      ...userPerfume,
      perfume,
    };
  },
});

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

// Default attributes based on scent family for better recommendation matching
// Outfit styles must match: clean, minimalist, streetwear, romantic, glam, cozy, corporate
const SCENT_FAMILY_DEFAULTS: Record<string, {
  moods: string[];
  occasions: string[];
  outfitStyles: string[];
  auraWords: string[];
  idealTemperature: ("hot" | "warm" | "mild" | "cool" | "cold")[];
}> = {
  fresh: {
    moods: ["playful", "confident"],
    occasions: ["work", "casual", "date"],
    outfitStyles: ["clean", "minimalist", "streetwear"],
    auraWords: ["Crisp", "Energizing", "Clean"],
    idealTemperature: ["hot", "warm", "mild"],
  },
  floral: {
    moods: ["soft", "playful"],
    occasions: ["date", "event", "casual"],
    outfitStyles: ["romantic", "glam", "clean"],
    auraWords: ["Romantic", "Elegant", "Graceful"],
    idealTemperature: ["warm", "mild", "cool"],
  },
  woody: {
    moods: ["confident", "mysterious"],
    occasions: ["work", "date", "event"],
    outfitStyles: ["corporate", "minimalist", "clean"],
    auraWords: ["Grounded", "Sophisticated", "Timeless"],
    idealTemperature: ["mild", "cool", "cold"],
  },
  amber: {
    moods: ["confident", "mysterious"],
    occasions: ["date", "event", "home"],
    outfitStyles: ["glam", "romantic", "cozy"],
    auraWords: ["Warm", "Sensual", "Rich"],
    idealTemperature: ["cool", "cold"],
  },
  gourmand: {
    moods: ["playful", "soft"],
    occasions: ["casual", "date", "home"],
    outfitStyles: ["cozy", "romantic", "streetwear"],
    auraWords: ["Comforting", "Sweet", "Inviting"],
    idealTemperature: ["cool", "cold", "mild"],
  },
  musky: {
    moods: ["soft", "mysterious"],
    occasions: ["date", "casual", "home"],
    outfitStyles: ["minimalist", "clean", "cozy"],
    auraWords: ["Subtle", "Intimate", "Skin-like"],
    idealTemperature: ["warm", "mild", "cool"],
  },
};

// Add fragrance to collection (creates perfume if needed)
export const addToCollection = mutation({
  args: {
    userId: v.string(),
    // Perfume details (for creating if doesn't exist)
    name: v.string(),
    house: v.string(),
    scentFamily: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    externalId: v.optional(v.string()), // ID from external API like Fragrantica
    // User-specific data
    moods: v.optional(v.array(v.string())),
    personalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if perfume already exists by name and house
    const existingPerfumes = await ctx.db
      .query("perfumes")
      .filter((q) =>
        q.and(
          q.eq(q.field("name"), args.name),
          q.eq(q.field("house"), args.house)
        )
      )
      .first();

    let perfumeId;

    if (existingPerfumes) {
      perfumeId = existingPerfumes._id;
    } else {
      // Get defaults based on scent family - validate it's a valid scent family
      const validScentFamilies = ["fresh", "floral", "woody", "amber", "gourmand", "musky"] as const;
      type ScentFamily = typeof validScentFamilies[number];
      const scentFamily: ScentFamily = validScentFamilies.includes(args.scentFamily as ScentFamily)
        ? (args.scentFamily as ScentFamily)
        : "woody";
      const defaults = SCENT_FAMILY_DEFAULTS[scentFamily] || SCENT_FAMILY_DEFAULTS.woody;

      // Create new perfume entry with sensible defaults for recommendation matching
      perfumeId = await ctx.db.insert("perfumes", {
        name: args.name,
        house: args.house,
        scentFamily: scentFamily,
        imageUrl: args.imageUrl,
        moods: args.moods || defaults.moods,
        auraWords: defaults.auraWords,
        outfitStyles: defaults.outfitStyles,
        occasions: defaults.occasions,
        notes: { top: [], heart: [], base: [] },
        performance: "balanced",
        weatherPerformance: {
          idealTemperature: defaults.idealTemperature,
          idealHumidity: ["moderate"],
        },
      });
    }

    // Check if already in user's collection
    const existingInCollection = await ctx.db
      .query("userPerfumes")
      .withIndex("by_user_perfume", (q) =>
        q.eq("userId", args.userId).eq("perfumeId", perfumeId)
      )
      .first();

    if (existingInCollection) {
      throw new Error("This fragrance is already in your collection");
    }

    // Add to user's collection
    return await ctx.db.insert("userPerfumes", {
      userId: args.userId,
      perfumeId,
      personalNotes: args.personalNotes,
      dislikedNotes: [],
      isFavorite: false,
      wearCount: 0,
      createdAt: Date.now(),
    });
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
