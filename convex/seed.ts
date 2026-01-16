// convex/seed.ts
// Seed data for the perfume catalog
// Run with: npx convex run seed:seedPerfumes

import { mutation } from "./_generated/server";

// Sample perfume data
const SAMPLE_PERFUMES = [
  {
    name: "Santal 33",
    house: "Le Labo",
    scentFamily: "woody" as const,
    performance: "balanced" as const,
    notes: {
      top: ["cardamom", "iris", "violet"],
      heart: ["ambrox", "Australian sandalwood"],
      base: ["cedarwood", "leather", "musk"],
    },
    auraWords: ["Grounded", "Confident", "Warm"],
    outfitStyles: ["minimalist", "clean", "corporate"],
    occasions: ["work", "casual", "date"],
    moods: ["confident", "mysterious"],
    weatherPerformance: {
      idealTemperature: ["mild" as const, "cool" as const],
      idealHumidity: ["dry" as const, "moderate" as const],
    },
    description: "A unisex icon with creamy sandalwood and smoky leather.",
  },
  {
    name: "Blanche",
    house: "Byredo",
    scentFamily: "fresh" as const,
    performance: "office-safe" as const,
    notes: {
      top: ["pink pepper", "aldehyde"],
      heart: ["peony", "violet", "rose"],
      base: ["blonde woods", "sandalwood", "musk"],
    },
    auraWords: ["Pure", "Serene", "Ethereal"],
    outfitStyles: ["clean", "minimalist", "romantic"],
    occasions: ["work", "casual"],
    moods: ["soft", "confident"],
    weatherPerformance: {
      idealTemperature: ["mild" as const, "warm" as const],
      idealHumidity: ["moderate" as const],
    },
    description: "Crisp white linens and delicate florals in perfect harmony.",
  },
  {
    name: "Baccarat Rouge 540",
    house: "Maison Francis Kurkdjian",
    scentFamily: "amber" as const,
    performance: "loud" as const,
    notes: {
      top: ["saffron", "jasmine"],
      heart: ["amberwood", "ambergris"],
      base: ["fir resin", "cedar"],
    },
    auraWords: ["Magnetic", "Bold", "Luminous"],
    outfitStyles: ["glam", "romantic"],
    occasions: ["date", "event"],
    moods: ["confident", "mysterious"],
    weatherPerformance: {
      idealTemperature: ["cool" as const, "cold" as const],
      idealHumidity: ["dry" as const],
    },
    description: "A modern classic with glowing amber and crystalline woods.",
  },
  {
    name: "Mojave Ghost",
    house: "Byredo",
    scentFamily: "floral" as const,
    performance: "balanced" as const,
    notes: {
      top: ["ambrette", "Jamaican nesberry"],
      heart: ["violet", "sandalwood", "magnolia"],
      base: ["cedarwood", "musk", "amber"],
    },
    auraWords: ["Dreamy", "Soft", "Captivating"],
    outfitStyles: ["romantic", "cozy", "minimalist"],
    occasions: ["casual", "date"],
    moods: ["soft", "playful"],
    weatherPerformance: {
      idealTemperature: ["warm" as const, "mild" as const],
      idealHumidity: ["dry" as const, "moderate" as const],
    },
    description: "A ghostly floral inspired by the Mojave Desert.",
  },
  {
    name: "Tobacco Vanille",
    house: "Tom Ford",
    scentFamily: "gourmand" as const,
    performance: "loud" as const,
    notes: {
      top: ["tobacco leaf", "spicy notes"],
      heart: ["vanilla", "cacao", "tonka bean"],
      base: ["dried fruits", "wood sap"],
    },
    auraWords: ["Opulent", "Warm", "Indulgent"],
    outfitStyles: ["glam", "cozy"],
    occasions: ["event", "date", "home"],
    moods: ["confident", "mysterious"],
    weatherPerformance: {
      idealTemperature: ["cold" as const, "cool" as const],
      idealHumidity: ["dry" as const],
    },
    description: "Rich tobacco and creamy vanilla for cold nights.",
  },
  {
    name: "Another 13",
    house: "Le Labo",
    scentFamily: "musky" as const,
    performance: "office-safe" as const,
    notes: {
      top: ["pear accord"],
      heart: ["ambroxan", "moss", "musk"],
      base: ["jasmine petals", "ambrette seeds"],
    },
    auraWords: ["Clean", "Modern", "Magnetic"],
    outfitStyles: ["minimalist", "clean", "streetwear"],
    occasions: ["work", "casual"],
    moods: ["confident", "playful"],
    weatherPerformance: {
      idealTemperature: ["hot" as const, "warm" as const],
      idealHumidity: ["humid" as const, "moderate" as const],
    },
    description: "A skin scent that makes you smell like the best version of you.",
  },
  {
    name: "Portrait of a Lady",
    house: "Frédéric Malle",
    scentFamily: "floral" as const,
    secondaryScentFamily: "woody" as const,
    performance: "loud" as const,
    notes: {
      top: ["Turkish rose", "raspberry"],
      heart: ["patchouli", "incense", "clove"],
      base: ["sandalwood", "musk", "amber"],
    },
    auraWords: ["Regal", "Powerful", "Unforgettable"],
    outfitStyles: ["glam", "corporate", "romantic"],
    occasions: ["event", "work", "date"],
    moods: ["confident", "mysterious"],
    weatherPerformance: {
      idealTemperature: ["cool" as const, "cold" as const],
      idealHumidity: ["dry" as const, "moderate" as const],
    },
    description: "A commanding rose with serious patchouli depth.",
  },
  {
    name: "Bergamote 22",
    house: "Le Labo",
    scentFamily: "fresh" as const,
    performance: "office-safe" as const,
    notes: {
      top: ["bergamot", "grapefruit", "orange blossom"],
      heart: ["petitgrain", "vetiver"],
      base: ["cedarwood", "musk", "amber"],
    },
    auraWords: ["Bright", "Refreshing", "Effortless"],
    outfitStyles: ["clean", "minimalist", "streetwear"],
    occasions: ["work", "casual"],
    moods: ["playful", "soft"],
    weatherPerformance: {
      idealTemperature: ["hot" as const, "warm" as const, "mild" as const],
      idealHumidity: ["humid" as const, "moderate" as const],
    },
    description: "Sunlit citrus for everyday elegance.",
  },
];

export const seedPerfumes = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if perfumes already exist
    const existing = await ctx.db.query("perfumes").first();
    if (existing) {
      return { message: "Perfumes already seeded", count: 0 };
    }

    // Insert all sample perfumes
    for (const perfume of SAMPLE_PERFUMES) {
      await ctx.db.insert("perfumes", perfume);
    }

    return { message: "Seeded successfully", count: SAMPLE_PERFUMES.length };
  },
});
