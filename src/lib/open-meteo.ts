/**
 * Open-Meteo API Client & Helper Library
 * Documentation: https://open-meteo.com/en/docs
 */

export interface OpenMeteoCurrentUnits {
  time: string;
  interval: string;
  temperature_2m: string;
  relative_humidity_2m: string;
  apparent_temperature: string;
  is_day: string;
  precipitation: string;
  weather_code: string;
  wind_speed_10m: string;
}

export interface OpenMeteoCurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: OpenMeteoCurrentUnits;
  current: OpenMeteoCurrentWeather;
}

export const WEATHER_INTERPRETATION: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Depositing rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Moderate drizzle", icon: "🌦️" },
  55: { label: "Dense drizzle", icon: "🌧️" },
  61: { label: "Slight rain", icon: "🌧️" },
  63: { label: "Moderate rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Slight snowfall", icon: "❄️" },
  73: { label: "Moderate snowfall", icon: "❄️" },
  75: { label: "Heavy snowfall", icon: "❄️" },
  80: { label: "Slight rain showers", icon: "🌦️" },
  81: { label: "Moderate rain showers", icon: "🌧️" },
  82: { label: "Violent rain showers", icon: "⛈️" },
  95: { label: "Thunderstorm", icon: "⚡" },
  96: { label: "Thunderstorm with hail", icon: "⛈️" },
  99: { label: "Severe thunderstorm with heavy hail", icon: "⛈️" },
};

export const PRESET_CITIES = [
  { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.41 },
  { name: "New York", country: "USA", lat: 40.7128, lon: -74.006 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "London", country: "UK", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "San Francisco", country: "USA", lat: 37.7749, lon: -122.4194 },
  { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
];

/**
 * Log Open-Meteo payload directly into the console (Browser console or Node.js terminal).
 */
export function logOpenMeteoToConsole(data: OpenMeteoResponse, cityName = "Location") {
  const weather = WEATHER_INTERPRETATION[data.current.weather_code] || {
    label: `Code ${data.current.weather_code}`,
    icon: "🌡️",
  };

  const banner = [
    `%c[Open-Meteo API]%c Weather successfully pulled for ${cityName}:`,
    "color: #38bdf8; font-weight: bold; background: #0f172a; padding: 2px 6px; border-radius: 4px;",
    "color: #10b981; font-weight: bold;",
  ];

  // Browser formatted console log with fallback for Node console
  if (typeof window !== "undefined") {
    console.groupCollapsed(...banner);
    console.log(`📍 Location: ${cityName} (${data.latitude}°N, ${data.longitude}°E)`);
    console.log(`🕒 Observation Time: ${data.current.time} (${data.timezone})`);
    console.log(`🌤️ Weather Condition: ${weather.icon} ${weather.label}`);
    console.log(`🌡️ Temperature: ${data.current.temperature_2m} ${data.current_units.temperature_2m}`);
    console.log(`🌡️ Apparent Temperature: ${data.current.apparent_temperature} ${data.current_units.apparent_temperature}`);
    console.log(`💧 Humidity: ${data.current.relative_humidity_2m} ${data.current_units.relative_humidity_2m}`);
    console.log(`💨 Wind Speed: ${data.current.wind_speed_10m} ${data.current_units.wind_speed_10m}`);
    console.log(`🌧️ Precipitation: ${data.current.precipitation} ${data.current_units.precipitation}`);
    console.log(`☀️ Day / Night: ${data.current.is_day === 1 ? "Day" : "Night"}`);
    console.log("📦 Full Open-Meteo Response Object:", data);
    console.groupEnd();
  } else {
    console.log(`\n[Open-Meteo API] Weather data pulled for ${cityName}:`);
    console.log(`  - Condition:   ${weather.icon} ${weather.label}`);
    console.log(`  - Temperature: ${data.current.temperature_2m} ${data.current_units.temperature_2m}`);
    console.log(`  - Humidity:    ${data.current.relative_humidity_2m} ${data.current_units.relative_humidity_2m}`);
    console.log(`  - Wind Speed:  ${data.current.wind_speed_10m} ${data.current_units.wind_speed_10m}`);
    console.log(`  - Full data:`, data);
  }
}

/**
 * Fetch weather from Open-Meteo forecast API and log it to the console.
 */
export async function fetchOpenMeteoWeather(
  latitude: number,
  longitude: number,
  cityName = "Custom Location"
): Promise<OpenMeteoResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API HTTP error: ${response.status} ${response.statusText}`);
  }

  const data: OpenMeteoResponse = await response.json();
  logOpenMeteoToConsole(data, cityName);
  return data;
}
