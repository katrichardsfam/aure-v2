// convex/gemini.ts
import { v } from "convex/values";
import { action } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Analysis result type
export interface OutfitAnalysis {
  styleCategories: string[];
  moodInference: string;
  colorPalette: string[];
  scentDirections: string[];
  description: string;
  confidence: number;
}

const ANALYSIS_PROMPT = `You are a fashion and fragrance expert. Analyze this outfit and suggest complementary scent profiles.

Return a JSON object with these exact fields:
{
  "styleCategories": ["category1", "category2"],
  "moodInference": "mood",
  "colorPalette": ["color1", "color2", "color3"],
  "scentDirections": ["direction1", "direction2"],
  "description": "Brief outfit description in 10-15 words",
  "confidence": 0.85
}

Style categories must be from: clean, minimalist, streetwear, romantic, glam, cozy, corporate
Mood must be one of: confident, soft, playful, mysterious, grounded, magnetic, powerful, fresh, warm, sexy, creative
Scent directions must be from: fresh, floral, woody, amber, gourmand, musky

Pick 1-2 style categories that best match.
Pick exactly 1 mood that captures the overall vibe.
Pick 1-2 scent directions that would complement the outfit.
Confidence should be 0.0-1.0 based on how clearly you can analyze the outfit.

Return ONLY the JSON object, no markdown code blocks or other text.`;

// Parse JSON from response, handling potential markdown code blocks
function parseJsonResponse(text: string): OutfitAnalysis {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Validate and provide defaults
    return {
      styleCategories: Array.isArray(parsed.styleCategories) ? parsed.styleCategories.slice(0, 2) : ["clean"],
      moodInference: typeof parsed.moodInference === "string" ? parsed.moodInference : "confident",
      colorPalette: Array.isArray(parsed.colorPalette) ? parsed.colorPalette.slice(0, 5) : [],
      scentDirections: Array.isArray(parsed.scentDirections) ? parsed.scentDirections.slice(0, 2) : ["fresh"],
      description: typeof parsed.description === "string" ? parsed.description : "Stylish outfit",
      confidence: typeof parsed.confidence === "number" ? Math.min(1, Math.max(0, parsed.confidence)) : 0.7,
    };
  } catch (error) {
    console.error("Failed to parse Gemini response:", error, text);
    throw new Error("Failed to parse AI response");
  }
}

// Analyze outfit from image
export const analyzeOutfitImage = action({
  args: {
    imageBase64: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args): Promise<OutfitAnalysis> => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      ANALYSIS_PROMPT,
      {
        inlineData: {
          data: args.imageBase64,
          mimeType: args.mimeType,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    return parseJsonResponse(text);
  },
});

// Analyze outfit from text description
export const analyzeOutfitText = action({
  args: {
    description: v.string(),
  },
  handler: async (ctx, args): Promise<OutfitAnalysis> => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const textPrompt = `${ANALYSIS_PROMPT}

Outfit description: ${args.description}`;

    const result = await model.generateContent(textPrompt);
    const response = result.response;
    const text = response.text();

    return parseJsonResponse(text);
  },
});
