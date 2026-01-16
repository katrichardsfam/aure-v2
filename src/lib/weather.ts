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

export async function fetchWeatherByCoords(
  lat: number, 
  lon: number
): Promise<WeatherData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    if (!apiKey) {
      console.warn("Weather API key not configured");
      return null;
    }

    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      temperature: data.current.temp_c,
      temperatureCategory: categorizeTemperature(data.current.temp_c),
      humidity: data.current.humidity,
      humidityCategory: categorizeHumidity(data.current.humidity),
      condition: data.current.condition.text,
      location: `${data.location.name}, ${data.location.country}`,
      icon: data.current.condition.icon,
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
}

export async function fetchWeatherByCity(city: string): Promise<WeatherData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    if (!apiKey) {
      console.warn("Weather API key not configured");
      return null;
    }

    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      temperature: data.current.temp_c,
      temperatureCategory: categorizeTemperature(data.current.temp_c),
      humidity: data.current.humidity,
      humidityCategory: categorizeHumidity(data.current.humidity),
      condition: data.current.condition.text,
      location: `${data.location.name}, ${data.location.country}`,
      icon: data.current.condition.icon,
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
