// src/lib/weather.ts
import { 
  type TemperatureCategory, 
  type HumidityCategory,
} from "./constants";

export interface WeatherData {
  temperature: number; // Celsius
  temperatureCategory: TemperatureCategory;
  humidity: number; // Percentage
  humidityCategory: HumidityCategory;
  condition: string;
  location: string;
  icon: string;
}

export function categorizeTemperature(tempC: number): TemperatureCategory {
  if (tempC >= 30) return "hot";
  if (tempC >= 23) return "warm";
  if (tempC >= 15) return "mild";
  if (tempC >= 5) return "cool";
  return "cold";
}

export function categorizeHumidity(humidity: number): HumidityCategory {
  if (humidity < 40) return "dry";
  if (humidity <= 65) return "moderate";
  return "humid";
}

// Map Open-Meteo weather codes to human-readable conditions
function getConditionFromCode(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Cloudy";
}

// Get weather icon based on condition
function getWeatherIcon(condition: string): string {
  const iconMap: Record<string, string> = {
    "Clear": "//cdn.weatherapi.com/weather/64x64/day/113.png",
    "Partly cloudy": "//cdn.weatherapi.com/weather/64x64/day/116.png",
    "Cloudy": "//cdn.weatherapi.com/weather/64x64/day/119.png",
    "Foggy": "//cdn.weatherapi.com/weather/64x64/day/143.png",
    "Drizzle": "//cdn.weatherapi.com/weather/64x64/day/266.png",
    "Rainy": "//cdn.weatherapi.com/weather/64x64/day/296.png",
    "Snowy": "//cdn.weatherapi.com/weather/64x64/day/326.png",
    "Showers": "//cdn.weatherapi.com/weather/64x64/day/353.png",
    "Snow showers": "//cdn.weatherapi.com/weather/64x64/day/368.png",
    "Thunderstorm": "//cdn.weatherapi.com/weather/64x64/day/389.png",
  };
  return iconMap[condition] || iconMap["Partly cloudy"];
}

export async function fetchWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  try {
    // Use Open-Meteo API (free, no API key needed)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=celsius`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const tempC = data.current.temperature_2m;
    const humidity = data.current.relative_humidity_2m;
    const condition = getConditionFromCode(data.current.weather_code);

    // Try to get location name via reverse geocoding
    let location = "Current location";
    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.suburb;
        const country = geoData.address?.country;
        if (city && country) {
          location = `${city}, ${country}`;
        } else if (city) {
          location = city;
        }
      }
    } catch {
      // Keep default location if geocoding fails
    }

    return {
      temperature: tempC,
      temperatureCategory: categorizeTemperature(tempC),
      humidity: humidity,
      humidityCategory: categorizeHumidity(humidity),
      condition,
      location,
      icon: getWeatherIcon(condition),
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
}

export async function fetchWeatherByCity(city: string): Promise<WeatherData | null> {
  try {
    // First, geocode the city name using Open-Meteo geocoding
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!geoResponse.ok) return null;

    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) return null;

    const { latitude, longitude, name, country } = geoData.results[0];

    // Fetch weather for the coordinates
    const weather = await fetchWeatherByCoords(latitude, longitude);
    if (!weather) return null;

    // Use the geocoded location name
    return {
      ...weather,
      location: `${name}, ${country}`,
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
}

/**
 * Get weather using browser's geolocation API
 * Returns null if geolocation is denied or unavailable
 */
export function getCurrentPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

/**
 * Convenience function to get weather for current location
 */
export async function fetchWeatherForCurrentLocation(): Promise<WeatherData | null> {
  const position = await getCurrentPosition();
  if (!position) return null;
  
  return fetchWeatherByCoords(
    position.coords.latitude,
    position.coords.longitude
  );
}
