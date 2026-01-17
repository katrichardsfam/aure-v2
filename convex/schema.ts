// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Scent family enum
export const scentFamilies = v.union(
  v.literal("fresh"),
  v.literal("floral"),
  v.literal("woody"),
  v.literal("amber"),
  v.literal("gourmand"),
  v.literal("musky")
);

// Performance enum
export const performanceLevels = v.union(
  v.literal("office-safe"),
  v.literal("balanced"),
  v.literal("loud")
);

// Weather condition enum
export const weatherConditions = v.union(
  v.literal("hot"),
  v.literal("warm"),
  v.literal("mild"),
  v.literal("cool"),
  v.literal("cold")
);

// Humidity level enum
export const humidityLevels = v.union(
  v.literal("dry"),
  v.literal("moderate"),
  v.literal("humid")
);

export default defineSchema({
  // Global perfume catalog
  perfumes: defineTable({
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
    // Weather performance modifiers
    weatherPerformance: v.object({
      idealTemperature: v.array(weatherConditions),
      idealHumidity: v.array(humidityLevels),
      temperatureBoost: v.optional(v.number()), // -2 to +2 score modifier
      humidityBoost: v.optional(v.number()),
    }),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  })
    .index("by_scent_family", ["scentFamily"])
    .index("by_performance", ["performance"])
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_house", { searchField: "house" }),

  // User's personal collection (Aura Vault)
  userPerfumes: defineTable({
    userId: v.string(),
    perfumeId: v.id("perfumes"),
    nickname: v.optional(v.string()),
    personalNotes: v.optional(v.string()),
    dislikedNotes: v.array(v.string()),
    isFavorite: v.boolean(),
    wearCount: v.number(),
    lastWornAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_perfume", ["userId", "perfumeId"])
    .index("by_user_favorite", ["userId", "isFavorite"]),

  // Fit Check sessions
  sessions: defineTable({
    userId: v.string(),
    // User inputs
    outfitStyles: v.array(v.string()),
    mood: v.string(),
    scentDirections: v.array(v.string()),
    occasion: v.string(),
    // Weather context (auto-detected or manual)
    weather: v.optional(v.object({
      temperature: v.optional(v.number()),
      temperatureCategory: weatherConditions,
      humidity: v.optional(v.number()),
      humidityCategory: v.optional(humidityLevels),
      condition: v.optional(v.string()),
      location: v.optional(v.string()),
      isManual: v.boolean(),
    })),
    // Recommendation output
    recommendedPerfumeId: v.optional(v.id("userPerfumes")),
    recommendationType: v.optional(v.string()),
    matchScore: v.optional(v.number()),
    // AI-generated content
    editorialExplanation: v.optional(v.string()),
    affirmation: v.optional(v.string()),
    // Metadata
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "createdAt"]),

  // User preferences (learned over time)
  userPreferences: defineTable({
    userId: v.string(),
    // Onboarding answers
    scentPreferences: v.optional(v.array(v.string())),
    avoidNotes: v.optional(v.array(v.string())),
    // Location for weather
    defaultLocation: v.optional(v.object({
      city: v.string(),
      country: v.string(),
      lat: v.number(),
      lon: v.number(),
    })),
    // Settings
    useWeatherContext: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Saved vibes (scent moments)
  vibes: defineTable({
    userId: v.string(),
    sessionId: v.id("sessions"),
    name: v.string(),
    notes: v.optional(v.string()),
    hasImage: v.boolean(),
    // Denormalized data for fast display
    perfumeName: v.string(),
    perfumeHouse: v.string(),
    scentFamily: v.string(),
    auraWords: v.array(v.string()),
    mood: v.string(),
    occasion: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),
}, { schemaValidation: false });
