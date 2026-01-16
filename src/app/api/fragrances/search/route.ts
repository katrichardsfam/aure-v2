// src/app/api/fragrances/search/route.ts
import { NextRequest, NextResponse } from "next/server";

const FRAGELLA_API_URL = "https://api.fragella.com/api/v1/fragrances";

// Mock fragrance data for development
const MOCK_FRAGRANCES = [
  { id: "1", name: "Bleu de Chanel", house: "Chanel", scentFamily: "Woody Aromatic" },
  { id: "2", name: "Chanel No. 5", house: "Chanel", scentFamily: "Floral Aldehyde" },
  { id: "3", name: "Coco Mademoiselle", house: "Chanel", scentFamily: "Floral Oriental" },
  { id: "4", name: "Sauvage", house: "Dior", scentFamily: "Aromatic Fougère" },
  { id: "5", name: "Miss Dior", house: "Dior", scentFamily: "Floral Chypre" },
  { id: "6", name: "J'adore", house: "Dior", scentFamily: "Floral Fruity" },
  { id: "7", name: "Aventus", house: "Creed", scentFamily: "Fruity Chypre" },
  { id: "8", name: "Green Irish Tweed", house: "Creed", scentFamily: "Aromatic Green" },
  { id: "9", name: "Silver Mountain Water", house: "Creed", scentFamily: "Citrus Aromatic" },
  { id: "10", name: "La Vie Est Belle", house: "Lancôme", scentFamily: "Floral Gourmand" },
  { id: "11", name: "Black Opium", house: "Yves Saint Laurent", scentFamily: "Amber Vanilla" },
  { id: "12", name: "Libre", house: "Yves Saint Laurent", scentFamily: "Floral Lavender" },
  { id: "13", name: "Acqua di Gio", house: "Giorgio Armani", scentFamily: "Aquatic Aromatic" },
  { id: "14", name: "Si", house: "Giorgio Armani", scentFamily: "Floral Fruity" },
  { id: "15", name: "Light Blue", house: "Dolce & Gabbana", scentFamily: "Citrus Floral" },
  { id: "16", name: "The One", house: "Dolce & Gabbana", scentFamily: "Oriental Spicy" },
  { id: "17", name: "Oud Wood", house: "Tom Ford", scentFamily: "Woody Oud" },
  { id: "18", name: "Black Orchid", house: "Tom Ford", scentFamily: "Oriental Floral" },
  { id: "19", name: "Tobacco Vanille", house: "Tom Ford", scentFamily: "Amber Spicy" },
  { id: "20", name: "Lost Cherry", house: "Tom Ford", scentFamily: "Fruity Gourmand" },
  { id: "21", name: "Baccarat Rouge 540", house: "Maison Francis Kurkdjian", scentFamily: "Amber Floral" },
  { id: "22", name: "Grand Soir", house: "Maison Francis Kurkdjian", scentFamily: "Amber Woody" },
  { id: "23", name: "Delina", house: "Parfums de Marly", scentFamily: "Floral Fruity" },
  { id: "24", name: "Layton", house: "Parfums de Marly", scentFamily: "Amber Aromatic" },
  { id: "25", name: "Molecule 01", house: "Escentric Molecules", scentFamily: "Woody Musky" },
  { id: "26", name: "Good Girl", house: "Carolina Herrera", scentFamily: "Floral Oriental" },
  { id: "27", name: "Flowerbomb", house: "Viktor & Rolf", scentFamily: "Floral Oriental" },
  { id: "28", name: "Spicebomb", house: "Viktor & Rolf", scentFamily: "Spicy Tobacco" },
  { id: "29", name: "Her", house: "Burberry", scentFamily: "Fruity Gourmand" },
  { id: "30", name: "Byredo Gypsy Water", house: "Byredo", scentFamily: "Woody Aromatic" },
];

function searchMockFragrances(query: string, limit: number) {
  const lowerQuery = query.toLowerCase();
  return MOCK_FRAGRANCES
    .filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.house.toLowerCase().includes(lowerQuery) ||
      f.scentFamily.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Use mock data in development mode
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === "true") {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    const results = searchMockFragrances(query, limit);
    return NextResponse.json({ results });
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

      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "30";
        return NextResponse.json(
          { error: "Rate limited. Please wait before searching again.", retryAfter },
          { status: 429 }
        );
      }

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
