import { NextRequest, NextResponse } from "next/server";
import { fetchOpenMeteoWeather } from "@/lib/open-meteo";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latStr = searchParams.get("latitude") ?? "52.52";
  const lonStr = searchParams.get("longitude") ?? "13.41";
  const city = searchParams.get("city") ?? "Berlin";

  const latitude = parseFloat(latStr);
  const longitude = parseFloat(lonStr);

  try {
    console.log(`[Next.js Server API] Fetching Open-Meteo forecast for ${city} (${latitude}, ${longitude})...`);
    const data = await fetchOpenMeteoWeather(latitude, longitude, city);
    console.log(`[Next.js Server API] Successfully retrieved weather for ${city}: ${data.current.temperature_2m}°C`);

    return NextResponse.json({
      success: true,
      city,
      data,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Next.js Server API] Error fetching Open-Meteo data:`, errMessage);
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
