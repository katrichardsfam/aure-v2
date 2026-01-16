// src/lib/ai.ts
// AI Copy Generation Service using Anthropic Claude API

import Anthropic from "@anthropic-ai/sdk";

// Initialize client (server-side only)
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

export interface EditorialContext {
  perfumeName: string;
  house: string;
  scentFamily: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  auraWords: string[];
  // Session context
  mood: string;
  occasion: string;
  outfitStyles: string[];
  scentDirections: string[];
  weatherCategory?: string;
}

export interface EditorialCopy {
  explanation: string;
  affirmation: string;
}

const SYSTEM_PROMPT = `You are a fragrance editorial writer for aurë, a calm, ritual-driven fragrance app. 
Your voice is warm, confident, and magazine-like — never salesy or clinical.

Guidelines:
- Write in second person ("you")
- Be concise but evocative (2-3 sentences max for explanations)
- Never mention prices, shopping, or product promotion
- Focus on how the scent makes the wearer feel, not technical details
- Match the energy to the user's stated mood
- Reference weather/occasion naturally when relevant
- Affirmations should be short (under 10 words), poetic, and empowering

Tone references: Kinfolk magazine, Aesop brand voice, quiet luxury aesthetic`;

export async function generateEditorialCopy(
  context: EditorialContext
): Promise<EditorialCopy> {
  const client = getClient();

  const prompt = `Generate editorial copy for a fragrance recommendation.

PERFUME:
- Name: ${context.perfumeName}
- House: ${context.house}
- Scent Family: ${context.scentFamily}
- Aura Words: ${context.auraWords.join(", ")}
- Top Notes: ${context.notes.top.join(", ")}
- Heart Notes: ${context.notes.heart.join(", ")}
- Base Notes: ${context.notes.base.join(", ")}

USER CONTEXT:
- Mood: ${context.mood}
- Occasion: ${context.occasion}
- Outfit Style: ${context.outfitStyles.join(", ")}
- Scent Direction Preference: ${context.scentDirections.join(", ")}
${context.weatherCategory ? `- Weather: ${context.weatherCategory}` : ""}

Generate:
1. A 2-3 sentence editorial explanation of why this perfume works for this context
2. A short affirmation (under 10 words)

Respond in JSON format:
{
  "explanation": "...",
  "affirmation": "..."
}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extract text content
    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    // Parse JSON response
    const parsed = JSON.parse(textContent.text);
    
    return {
      explanation: parsed.explanation,
      affirmation: parsed.affirmation,
    };
  } catch (error) {
    console.error("AI generation failed:", error);
    
    // Fallback to template-based copy
    return generateFallbackCopy(context);
  }
}

// Fallback copy when AI is unavailable
function generateFallbackCopy(context: EditorialContext): EditorialCopy {
  const moodTemplates: Record<string, { explanation: string; affirmation: string }> = {
    confident: {
      explanation: `Today calls for something that anchors you without demanding attention. ${context.perfumeName}'s ${context.scentFamily} character creates a quiet confidence — like wearing your favorite armor, but softer.`,
      affirmation: "You carry your own warmth today.",
    },
    soft: {
      explanation: `There's beauty in subtlety today. Let ${context.perfumeName}'s ${context.scentFamily} notes wrap around you like a familiar comfort, present but never overwhelming.`,
      affirmation: "Your gentleness is your strength.",
    },
    playful: {
      explanation: `Your energy today deserves a scent that keeps up. ${context.perfumeName}'s ${context.scentFamily} character adds just enough intrigue without taking itself too seriously.`,
      affirmation: "Joy radiates from you effortlessly.",
    },
    mysterious: {
      explanation: `Some days call for a little enigma. ${context.perfumeName}'s ${context.scentFamily} composition reveals itself slowly, letting others lean in to discover more.`,
      affirmation: "Let them wonder what your secret is.",
    },
  };

  const template = moodTemplates[context.mood] || moodTemplates.confident;

  // Add occasion-specific suffix
  let explanation = template.explanation;
  if (context.occasion === "work") {
    explanation += " Perfect for professional settings where you want to be remembered, not overwhelming.";
  } else if (context.occasion === "date") {
    explanation += " It leaves just enough mystery for someone to want to come closer.";
  }

  return {
    explanation,
    affirmation: template.affirmation,
  };
}

// Generate aura words based on perfume and mood
export function generateAuraWords(
  perfumeAuraWords: string[],
  mood: string
): string[] {
  const moodAuraWords: Record<string, string[]> = {
    confident: ["Grounded", "Bold", "Assured", "Present", "Centered"],
    soft: ["Gentle", "Approachable", "Serene", "Calm", "Tender"],
    playful: ["Spirited", "Light", "Joyful", "Free", "Radiant"],
    mysterious: ["Intriguing", "Subtle", "Deep", "Enigmatic", "Alluring"],
  };

  const moodWords = moodAuraWords[mood] || moodAuraWords.confident;
  
  // Combine perfume's aura words with mood words, prioritizing perfume words
  const combined = [...new Set([...perfumeAuraWords.slice(0, 2), ...moodWords])];
  
  return combined.slice(0, 3);
}
