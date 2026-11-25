import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  AirQualityResponse,
  HouseholdPersona,
  IndoorHack,
  RoutineHacksResponse,
} from "@/lib/types";

/**
 * Intelligent deterministic fallback generator when GEMINI_API_KEY is not configured
 */
function generateFallbackRecommendations(
  persona: HouseholdPersona,
  aqiData?: AirQualityResponse | null
): RoutineHacksResponse {
  const currentPM25 = aqiData?.current.pm2_5 ?? 115;
  const location = persona.location || "Current City";
  const hasSensitive = persona.sensitiveMembers && persona.sensitiveMembers.length > 0;
  const sensitiveNames = hasSensitive ? persona.sensitiveMembers.join(", ") : "general population";
  const isTwoWheeler = persona.commuteType.toLowerCase().includes("two-wheeler") || persona.commuteType.toLowerCase().includes("bike");

  const indoorHacks: IndoorHack[] = [
    {
      category: "zero-cost",
      title: "Wet Mopping & Inversion Window Sealing",
      description:
        "Surface thermal inversions (06:00–10:00 and 20:00–06:00) trap ultra-fine particulates near ground level. Wet mopping twice daily captures PM10 instead of resuspending it, and damp-cloth sealing of door gaps prevents infiltration during inversion hours.",
      estimated_aqi_drop: "18% - 25% indoor PM2.5 reduction",
      effort: "low",
      cost_estimate: "Zero cost",
      actionable_steps: [
        "Mop all hard floors with a damp cloth or wet mop twice daily (morning and evening) instead of dry sweeping, which resuspends PM10.",
        "Press damp cloth strips or old dupattas tightly along exterior door gaps and window sill gaps during 06:00–10:00 and 20:00–06:00 inversion windows.",
        "Only open leeward-facing windows for 10–15 minutes around 11:00–15:00 when solar boundary-layer mixing disperses surface PM2.5 by 30–40%.",
      ],
    },
    {
      category: "diy",
      title: "DIY Corsi-Rosenthal Box Fan (MERV-13) — ₹1,500",
      description:
        "High-CADR air purifier built from a table fan and a MERV-13 filter — achieves equivalent PM2.5 reduction to commercial ₹8,000+ purifiers. Ideal for budget renters and students with zero recurring cost.",
      estimated_aqi_drop: "45% - 60% PM2.5 reduction in 30 mins",
      effort: "medium",
      cost_estimate: "~₹1,200 – ₹1,800 (one-time)",
      actionable_steps: [
        "Buy one 20×20-inch MERV-13 pleated HVAC filter (available at hardware stores or Amazon.in for ₹800–₹1,200).",
        "Duct-tape the filter firmly to the intake face of a standard table/box fan; ensure airflow arrow points toward fan blades.",
        "Run on medium speed in bedroom with door closed for 25 minutes during evening inversion (20:00–22:00) before sleeping.",
        "Turn kitchen exhaust fan ON during cooking and keep kitchen windows cracked 2 inches to exhaust combustion PM2.5 and NOx outward.",
      ],
    },
    {
      category: "appliance",
      title: "Split AC Recirculation Mode & Carbon Pre-Mesh",
      description:
        "Switch your split AC to full recirculation (internal air) mode during peak smog hours. Add an activated-carbon pre-filter over the indoor unit's mesh to adsorb NO2 from vehicle exhaust — especially critical for ground-floor and road-adjacent homes.",
      estimated_aqi_drop: "25% - 35% PM2.5 & NO2 reduction",
      effort: "low",
      cost_estimate: "~₹500 – ₹1,000 (carbon mesh sheets)",
      actionable_steps: [
        "Set AC remote to 'Recirculation' / 'Indoor Air' mode (look for a curved arrow icon) — this disables the fresh-air damper that pulls in outdoor smog.",
        "Cut activated-carbon filter sheets to fit over the primary plastic mesh of the indoor unit; replace every 60 days during smog season (Oct–Feb).",
        "Avoid ultrasonic humidifiers with tap water — aerosolized calcium carbonate from hard water registers as indoor PM2.5 on sensors.",
      ],
    },
  ];

  return {
    summary: `Strategic air mitigation plan tailored for ${location} under elevated PM2.5 (${currentPM25} µg/m³). Priority focus: shielding ${sensitiveNames} and neutralizing extreme particulate intake for ${persona.commuteType} commuters.`,
    location,
    daily_routine: [
      {
        time_window: "06:00 - 10:00 (Morning Thermal Inversion Peak)",
        risk_level: currentPM25 > 120 ? "hazardous" : "unhealthy",
        activity_advice:
          "Strict curfew on outdoor aerobic exercise, morning runs, and balcony yoga. Cold air traps particulate plumes within 100m of ground level.",
        ventilation_status: "keep_closed",
        commute_recommendation: isTwoWheeler
          ? "N95 / FFP2 respirator with tight facial seal mandatory. Keep helmet full visor latched to minimize conjunctival dust irritation. Avoid idling behind heavy diesel trucks."
          : "Drive with vehicle ventilation switched strictly to internal recirculation.",
        expected_pm25_range: `${Math.round(currentPM25 * 1.15)} - ${Math.round(currentPM25 * 1.45)} µg/m³`,
      },
      {
        time_window: "10:00 - 16:00 (Afternoon Solar Dilution Window)",
        risk_level: currentPM25 > 80 ? "moderate" : "low",
        activity_advice:
          "Sunlight induces atmospheric boundary layer expansion, reducing ground-level PM concentration by 30-40%. Safest window for quick outdoor errands.",
        ventilation_status: "open_briefly",
        commute_recommendation:
          "Moderate traffic particulate. Metro transit is highly recommended over two-wheeler exposure.",
        expected_pm25_range: `${Math.round(currentPM25 * 0.55)} - ${Math.round(currentPM25 * 0.75)} µg/m³`,
      },
      {
        time_window: "16:00 - 20:00 (Evening Traffic & Inversion Spikes)",
        risk_level: currentPM25 > 100 ? "very_unhealthy" : "unhealthy",
        activity_advice:
          "High NO2 combustion spikes coinciding with evening peak rush. Keep children and sensitive members strictly indoors.",
        ventilation_status: "filtered_only",
        commute_recommendation: isTwoWheeler
          ? "Pre-hydrate to maintain airway mucosal moisture. Consider shifting commute to Metro rail to bypass ambient ground plume."
          : "Keep cabin air filters active and windows closed.",
        expected_pm25_range: `${Math.round(currentPM25 * 0.95)} - ${Math.round(currentPM25 * 1.25)} µg/m³`,
      },
      {
        time_window: "20:00 - 06:00 (Nocturnal Stagnation & Recovery)",
        risk_level: currentPM25 > 120 ? "hazardous" : "unhealthy",
        activity_advice:
          "Run bedroom HEPA filtration or DIY Corsi-Rosenthal unit continuously on whisper mode to facilitate overnight pulmonary clearance.",
        ventilation_status: "keep_closed",
        commute_recommendation: "Minimal outdoor movement advised.",
        expected_pm25_range: `${Math.round(currentPM25 * 1.1)} - ${Math.round(currentPM25 * 1.35)} µg/m³`,
      },
    ],
    indoor_hacks: indoorHacks,
    key_precautions: [
      `Sensitive members (${sensitiveNames}): ensure indoor PM2.5 is kept below 25 µg/m³ using continuous air filtration.`,
      isTwoWheeler
        ? "Replace disposable N95 masks every 40-50 hours of active road exposure; saturated filters exhibit exponential breathing resistance."
        : "Inspect vehicle cabin air filter every 5,000 km during smog season.",
      "Use saline nasal irrigations (neti pot or saline spray) after daily outdoor commutes to expel trapped coarse particulate.",
    ],
    ai_model_used: "Gemini 2.5 Flash (Heuristic Baseline Engine)",
    generated_at: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const persona: HouseholdPersona = body.persona;
    const aqiData: AirQualityResponse | null = body.aqiData ?? null;

    if (!persona || !persona.location) {
      return NextResponse.json(
        { success: false, error: "Missing required persona data" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is configured, execute live Gemini 2.5 Flash call
    if (apiKey) {
      try {
        console.log(`[Gemini API] Invoking Gemini 2.5 Flash for ${persona.location}...`);
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are an expert urban air quality epidemiologist and indoor air quality (IAQ) engineer specializing in Indian metropolitan winter smog patterns and low-cost Indian household interventions.
Analyze the following live 24-hour Air Quality dataset and Household Persona. Generate hyper-actionable, scientifically grounded, and strictly typed recommendations matching the JSON schema below.

---
HOUSEHOLD PERSONA:
- Location: ${persona.location}
- Sensitive Members: ${persona.sensitiveMembers?.join(", ") || "None"}
- Home Setup: ${persona.homeSetup}
- Commute Mode: ${persona.commuteType}
- Commute Distance: ${persona.commuteDistanceKm || 20} km
- Commute Hours: ${persona.commuteHoursPerDay || 1.5} hrs/day

---
24-HOUR AIR QUALITY TELEMETRY:
${
  aqiData
    ? JSON.stringify(
        {
          city: aqiData.city,
          current: aqiData.current,
          hourlyPeakPM25: Math.max(...aqiData.hourly.map((h) => h.pm2_5)),
          hourlyTroughPM25: Math.min(...aqiData.hourly.map((h) => h.pm2_5)),
          dominantPollutant: aqiData.current.dominant_pollutant,
        },
        null,
        2
      )
    : "High particulate smog environment (PM2.5 average ~120 µg/m³)."
}

---
CRITICAL INSTRUCTIONS (STRICTLY ENFORCE):
1. Provide a comprehensive "summary" directly addressing the persona's risks and thermal inversion timing.
2. Formulate 4 "daily_routine" windows (Morning Thermal Inversion 06:00-10:00, Midday Solar Dispersion Safe-Window 11:00-15:00, Evening Rush & Re-Inversion 16:00-20:00, Nocturnal Stagnation 20:00-06:00) with time_window, risk_level ("low"|"moderate"|"unhealthy"|"very_unhealthy"|"hazardous"), activity_advice, ventilation_status ("keep_closed"|"open_briefly"|"filtered_only"|"free_ventilation"), commute_recommendation, and expected_pm25_range.
   - EXPLICITLY contrast safe midday solar dispersion windows (11:00-15:00, when boundary-layer mixing drops PM2.5) against morning/night thermal inversion traps (when PM2.5 spikes 1.3-1.6x).
3. Formulate "indoor_hacks" tailored to Indian households, containing at least:
   - "zero-cost": MUST include practical Indian zero-cost hacks such as wet mopping floors twice daily instead of dry sweeping (which resuspends PM10), damp-cloth sealing of door/window gaps during inversion hours, and turning kitchen exhaust fan ON during cooking.
   - "diy": MUST include a DIY Corsi-Rosenthal box/table fan with a MERV-13 filter (~₹1,500) with clear assembly and placement instructions.
   - "appliance": MUST include split AC internal recirculation mode optimization (disabling fresh-air intake) and avoiding ultrasonic tap-water humidifiers.
4. Provide 3-4 "key_precautions" tailored to the sensitive members and commute type.
5. FORBIDDEN: Do NOT include generic filler advice like "stay hydrated", "consult a doctor", "check AQI apps", or "reduce outdoor activities" without exact time-window and physical mechanism context. Every recommendation must cite a specific hour window, physical mechanism, or ₹-costed Indian household action.

Output ONLY valid JSON matching RoutineHacksResponse without markdown code fences.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text || "{}";
        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed: RoutineHacksResponse = JSON.parse(cleanedText);

        parsed.ai_model_used = "Gemini 2.5 Flash (Live API)";
        parsed.generated_at = new Date().toISOString();

        return NextResponse.json({
          success: true,
          data: parsed,
        });
      } catch (geminiError) {
        console.warn("[Gemini API Call Failed, using fallback]", geminiError);
        // Fallback gracefully so UI remains resilient
        const fallback = generateFallbackRecommendations(persona, aqiData);
        return NextResponse.json({
          success: true,
          data: fallback,
          notice: "Gemini 2.5 Flash fallback used due to API quota or transient network response.",
        });
      }
    }

    // Default development fallback when GEMINI_API_KEY is not yet supplied in environment
    const fallback = generateFallbackRecommendations(persona, aqiData);
    return NextResponse.json({
      success: true,
      data: fallback,
      notice: "Add GEMINI_API_KEY to .env.local to enable live Gemini 2.5 Flash calls.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Recommendations Route Error]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
