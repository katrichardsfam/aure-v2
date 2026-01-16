// convex/perfumes.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { scentFamilies, performanceLevels, weatherConditions, humidityLevels } from "./schema";

// Get all perfumes in the catalog
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("perfumes").collect();
  },
});

// Get a single perfume by ID
export const get = query({
  args: { id: v.id("perfumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Search perfumes by name
export const searchByName = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("perfumes")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(10);
  },
});

// Search perfumes by house/brand
export const searchByHouse = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("perfumes")
      .withSearchIndex("search_house", (q) => q.search("house", args.query))
      .take(10);
  },
});

// Get perfumes by scent family
export const getByScentFamily = query({
  args: { scentFamily: scentFamilies },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("perfumes")
      .withIndex("by_scent_family", (q) => q.eq("scentFamily", args.scentFamily))
      .collect();
  },
});

// Get perfumes by performance level
export const getByPerformance = query({
  args: { performance: performanceLevels },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("perfumes")
      .withIndex("by_performance", (q) => q.eq("performance", args.performance))
      .collect();
  },
});

// Add a new perfume to the catalog (admin function)
export const create = mutation({
  args: {
    name: v.string(),
    house: v.string(),
    scentFamily: scentFamilies,
    secondaryScentFamily: v.optional(scentFamilies),
    performance: performanceLevels,
    notes: v.object({
      top: v.array(v.string()),
      heart: v.array(v.string()),
      base: v.array(v.string()),
    }),
    auraWords: v.array(v.string()),
    outfitStyles: v.array(v.string()),
    occasions: v.array(v.string()),
    moods: v.array(v.string()),
    weatherPerformance: v.object({
      idealTemperature: v.array(weatherConditions),
      idealHumidity: v.array(humidityLevels),
      temperatureBoost: v.optional(v.number()),
      humidityBoost: v.optional(v.number()),
    }),
    description: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("perfumes", args);
  },
});
