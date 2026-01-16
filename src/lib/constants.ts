// src/lib/constants.ts

// ============================================
// OUTFIT STYLES — pick up to 2
// ============================================
export const OUTFIT_STYLES = [
  { 
    value: "clean", 
    label: "Clean", 
    description: "Minimal, neutral, crisp",
    icon: "Sparkles"
  },
  { 
    value: "minimalist", 
    label: "Minimalist", 
    description: "Simple shapes, few details",
    icon: "Square"
  },
  { 
    value: "streetwear", 
    label: "Streetwear", 
    description: "Casual, edgy, relaxed",
    icon: "Zap"
  },
  { 
    value: "romantic", 
    label: "Romantic", 
    description: "Soft, feminine, delicate",
    icon: "Heart"
  },
  { 
    value: "glam", 
    label: "Glam", 
    description: "Bold, polished, statement",
    icon: "Star"
  },
  { 
    value: "cozy", 
    label: "Cozy", 
    description: "Comfortable, soft, layered",
    icon: "Cloud"
  },
  { 
    value: "corporate", 
    label: "Corporate", 
    description: "Structured, office-ready",
    icon: "Briefcase"
  },
] as const;

// ============================================
// MOODS — pick exactly 1
// ============================================
export const MOODS = [
  { 
    value: "confident", 
    label: "Confident", 
    description: "Bold, assertive energy",
    gradient: "from-amber-400 to-orange-500"
  },
  { 
    value: "soft", 
    label: "Soft", 
    description: "Gentle, easy-going",
    gradient: "from-rose-300 to-pink-400"
  },
  { 
    value: "playful", 
    label: "Playful", 
    description: "Fun, expressive, spirited",
    gradient: "from-yellow-300 to-lime-400"
  },
  { 
    value: "mysterious", 
    label: "Mysterious", 
    description: "Subtle, intriguing",
    gradient: "from-violet-500 to-purple-600"
  },
] as const;

// ============================================
// SCENT DIRECTIONS — pick 1-2
// ============================================
export const SCENT_DIRECTIONS = [
  { 
    value: "fresh", 
    label: "Fresh", 
    description: "Clean, airy, citrus",
    examples: "Bergamot, green tea, cucumber"
  },
  { 
    value: "floral", 
    label: "Floral", 
    description: "Blossoms & soft petals",
    examples: "Rose, jasmine, peony"
  },
  { 
    value: "woody", 
    label: "Woody", 
    description: "Cedar, sandalwood, earth",
    examples: "Sandalwood, vetiver, oud"
  },
  { 
    value: "amber", 
    label: "Amber", 
    description: "Warm, resinous, golden",
    examples: "Amber, benzoin, labdanum"
  },
  { 
    value: "gourmand", 
    label: "Gourmand", 
    description: "Edible, sweet vibes",
    examples: "Vanilla, caramel, coffee"
  },
  { 
    value: "musky", 
    label: "Musky", 
    description: "Skin-like, sensual depth",
    examples: "White musk, ambrette, cashmere"
  },
] as const;

// ============================================
// OCCASIONS — pick exactly 1
// ============================================
export const OCCASIONS = [
  { value: "work", label: "Work", icon: "Briefcase" },
  { value: "date", label: "Date", icon: "Heart" },
  { value: "casual", label: "Casual", icon: "Coffee" },
  { value: "event", label: "Event", icon: "Sparkles" },
  { value: "home", label: "Home", icon: "Home" },
] as const;

// ============================================
// WEATHER MAPPINGS
// ============================================
export const TEMPERATURE_CATEGORIES = {
  hot: { min: 30, label: "Hot", description: "Above 30°C / 86°F" },
  warm: { min: 23, label: "Warm", description: "23-30°C / 73-86°F" },
  mild: { min: 15, label: "Mild", description: "15-23°C / 59-73°F" },
  cool: { min: 5, label: "Cool", description: "5-15°C / 41-59°F" },
  cold: { min: -50, label: "Cold", description: "Below 5°C / 41°F" },
} as const;

export const HUMIDITY_CATEGORIES = {
  dry: { max: 40, label: "Dry", description: "Below 40%" },
  moderate: { max: 65, label: "Moderate", description: "40-65%" },
  humid: { max: 100, label: "Humid", description: "Above 65%" },
} as const;

// Weather impact on scent families
export const WEATHER_SCENT_RECOMMENDATIONS = {
  hot: {
    recommended: ["fresh", "musky"],
    avoid: ["gourmand", "amber"],
    note: "Heat amplifies heavy notes — go lighter"
  },
  warm: {
    recommended: ["fresh", "floral", "musky"],
    avoid: ["gourmand"],
    note: "Florals bloom beautifully in warmth"
  },
  mild: {
    recommended: ["floral", "woody", "fresh"],
    avoid: [],
    note: "Most versatile weather for fragrance"
  },
  cool: {
    recommended: ["woody", "amber", "gourmand"],
    avoid: [],
    note: "Richer scents shine in cool air"
  },
  cold: {
    recommended: ["amber", "gourmand", "woody"],
    avoid: ["fresh"],
    note: "Bold, warm scents cut through cold"
  },
} as const;

// ============================================
// AURA GRADIENTS (by scent family)
// Softer -50 variants for a more refined aesthetic
// ============================================
export const AURA_GRADIENTS: Record<string, string> = {
  fresh: "from-lime-50 via-emerald-50 to-cyan-50",
  floral: "from-pink-50 via-rose-50 to-fuchsia-50",
  woody: "from-amber-50 via-stone-100 to-orange-50",
  amber: "from-orange-50 via-amber-50 to-yellow-50",
  gourmand: "from-amber-50 via-orange-50 to-rose-50",
  musky: "from-stone-100 via-zinc-50 to-slate-50",
  // Default/fallback
  default: "from-stone-50 via-white to-stone-100",
};

// ============================================
// PERFORMANCE MAPPINGS
// ============================================
export const OCCASION_PERFORMANCE_FIT: Record<string, string[]> = {
  work: ["office-safe", "balanced"],
  date: ["balanced", "loud"],
  casual: ["office-safe", "balanced"],
  event: ["balanced", "loud"],
  home: ["office-safe"],
};

// ============================================
// TYPE EXPORTS
// ============================================
export type OutfitStyle = typeof OUTFIT_STYLES[number]["value"];
export type Mood = typeof MOODS[number]["value"];
export type ScentDirection = typeof SCENT_DIRECTIONS[number]["value"];
export type Occasion = typeof OCCASIONS[number]["value"];
export type TemperatureCategory = keyof typeof TEMPERATURE_CATEGORIES;
export type HumidityCategory = keyof typeof HUMIDITY_CATEGORIES;
