// src/app/api/fragrances/search/route.ts
import { NextRequest, NextResponse } from "next/server";

const FRAGELLA_API_URL = "https://api.fragella.com/api/v1/fragrances";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = searchParams.get("limit") || "10";

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.FRAGELLA_API_KEY;

  if (!apiKey) {
    console.error("FRAGELLA_API_KEY is not configured");
    return NextResponse.json(
      { error: "API not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${FRAGELLA_API_URL}?search=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error("Fragella API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch fragrances" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // The Fragella API returns an array directly with capitalized field names
    const fragrances = Array.isArray(data) ? data : (data.data || data.results || []);
    
    const results = fragrances.map((fragrance: Record<string, unknown>) => {
      // Fragella API uses capitalized field names
      const name = fragrance.Name || fragrance.name;
      const house = fragrance.Brand || fragrance.brand;
      const imageUrl = fragrance["Image URL"] || fragrance.image_url;
      
      // Get the first main accord as the scent family
      const mainAccords = fragrance["Main Accords"] as string[] | undefined;
      const scentFamily = mainAccords?.[0] || "Unknown";

      return {
        id: String(name || Math.random()), // Use name as ID since Fragella doesn't provide IDs
        name: String(name || "Unknown"),
        house: String(house || "Unknown"),
        scentFamily: String(scentFamily),
        imageUrl: imageUrl ? String(imageUrl) : undefined,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching from Fragella API:", error);
    return NextResponse.json(
      { error: "Failed to search fragrances" },
      { status: 500 }
    );
  }
}
