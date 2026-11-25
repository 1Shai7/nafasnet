/**
 * Standalone Node.js CLI script to fetch and log Open-Meteo data to the console.
 * Run with: npm run fetch-weather
 */

const CITIES = [
  { name: "Berlin", lat: 52.52, lon: 13.41 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 }
];

const WEATHER_CODES = {
  0: "Clear sky ☀️",
  1: "Mainly clear 🌤️",
  2: "Partly cloudy ⛅",
  3: "Overcast ☁️",
  45: "Fog 🌫️",
  48: "Depositing rime fog 🌫️",
  51: "Light drizzle 🌦️",
  53: "Moderate drizzle 🌦️",
  55: "Dense drizzle 🌧️",
  61: "Slight rain 🌧️",
  63: "Moderate rain 🌧️",
  65: "Heavy rain 🌧️",
  71: "Slight snow fall ❄️",
  73: "Moderate snow fall ❄️",
  75: "Heavy snow fall ❄️",
  80: "Slight rain showers 🌦️",
  81: "Moderate rain showers 🌧️",
  82: "Violent rain showers ⛈️",
  95: "Thunderstorm ⚡",
  96: "Thunderstorm with slight hail ⛈️",
  99: "Thunderstorm with heavy hail ⛈️"
};

async function fetchAndLogWeather(city = CITIES[0]) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

  console.log(`\n============================================================`);
  console.log(`📡 Fetching live Open-Meteo data for: ${city.name} (${city.lat}, ${city.lon})`);
  console.log(`🔗 Request URL: ${url}`);
  console.log(`============================================================`);

  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const weatherDesc = WEATHER_CODES[data.current?.weather_code] || `Code ${data.current?.weather_code}`;

    console.log(`✅ [SUCCESS] Open-Meteo API responded in ${duration}ms (Status: ${response.status})\n`);
    console.log(`📍 Location Information:`);
    console.log(`   - Coordinates: ${data.latitude}°N, ${data.longitude}°E`);
    console.log(`   - Timezone:    ${data.timezone} (${data.timezone_abbreviation})`);
    console.log(`   - Elevation:   ${data.elevation}m above sea level`);
    console.log(`\n🌡️ Current Weather Metrics:`);
    console.log(`   - Condition:   ${weatherDesc}`);
    console.log(`   - Timestamp:   ${data.current?.time}`);
    console.log(`   - Temperature: ${data.current?.temperature_2m} ${data.current_units?.temperature_2m}`);
    console.log(`   - Feels Like:  ${data.current?.apparent_temperature} ${data.current_units?.apparent_temperature}`);
    console.log(`   - Humidity:    ${data.current?.relative_humidity_2m} ${data.current_units?.relative_humidity_2m}`);
    console.log(`   - Wind Speed:  ${data.current?.wind_speed_10m} ${data.current_units?.wind_speed_10m}`);
    console.log(`   - Rain/Precip: ${data.current?.precipitation} ${data.current_units?.precipitation}`);
    console.log(`   - Day/Night:   ${data.current?.is_day === 1 ? "Daytime 🌞" : "Nighttime 🌙"}`);
    console.log(`\n📦 Raw Open-Meteo JSON Payload (current):`);
    console.log(JSON.stringify(data.current, null, 2));
    console.log(`============================================================\n`);

    return data;
  } catch (error) {
    console.error(`❌ [ERROR] Failed to fetch Open-Meteo data:`, error.message);
    throw error;
  }
}

fetchAndLogWeather();
