import {
  ADULT_BREATHING_RATE_M3_PER_HR,
  BERKELEY_EARTH_UG_PER_CIG,
  CO2_FACTORS,
  MASK_EFFICIENCY,
  MaskType,
} from "@/lib/constants";

export interface ImpactInput {
  ambientPM25: number;
  exposureHours: number;
  commuteDistanceKm: number;
  maskType: MaskType;
  switchToMetro: boolean;
  offPeakTravel?: boolean;
}

export interface ImpactMetricsResult {
  baselineIntake_ug: number;
  dailyPM25Avoided_ug: number;
  actualInhaled_ug: number;
  monthlyAvoided_mg: number;
  co2SavedDaily_grams: number;
  monthlyCO2Saved_kg: number;
  protectionScore: number;
  reductionPct: number;
}

export type DiurnalWindowClass = "trapped_inversion" | "midday_dispersion";

/**
 * Computes daily & monthly PM2.5 inhalation avoided, net inhaled dose,
 * CO₂ commute savings, and composite Shield Index (0–100).
 */
export function calculateImpactMetrics(input: ImpactInput): ImpactMetricsResult {
  const maskEff = MASK_EFFICIENCY[input.maskType];
  const effectiveHours = input.offPeakTravel
    ? input.exposureHours * 0.8
    : input.exposureHours;
  const dailyDistance = input.commuteDistanceKm * 2;

  const baselineIntake_ug =
    ADULT_BREATHING_RATE_M3_PER_HR * effectiveHours * input.ambientPM25;
  const dailyPM25Avoided_ug = baselineIntake_ug * maskEff;
  const actualInhaled_ug = baselineIntake_ug - dailyPM25Avoided_ug;
  const monthlyAvoided_mg = (dailyPM25Avoided_ug * 30) / 1000;

  const co2SavedDaily_grams = input.switchToMetro
    ? dailyDistance * CO2_FACTORS.twoWheelerGramsPerKm -
      dailyDistance * CO2_FACTORS.metroGramsPerKm
    : 0;
  const monthlyCO2Saved_kg = (co2SavedDaily_grams * 22) / 1000;

  let protectionScore = maskEff * 60;
  if (input.switchToMetro) protectionScore += 25;
  if (input.offPeakTravel) protectionScore += 10;
  protectionScore = Math.min(100, Math.round(protectionScore));

  const reductionPct =
    baselineIntake_ug > 0
      ? Math.round((dailyPM25Avoided_ug / baselineIntake_ug) * 100)
      : 0;

  return {
    baselineIntake_ug: Math.round(baselineIntake_ug * 10) / 10,
    dailyPM25Avoided_ug: Math.round(dailyPM25Avoided_ug * 10) / 10,
    actualInhaled_ug: Math.round(actualInhaled_ug * 10) / 10,
    monthlyAvoided_mg: Math.round(monthlyAvoided_mg * 100) / 100,
    co2SavedDaily_grams: Math.round(co2SavedDaily_grams),
    monthlyCO2Saved_kg: Math.round(monthlyCO2Saved_kg * 10) / 10,
    protectionScore,
    reductionPct,
  };
}

/**
 * Converts 24-hour ambient PM2.5 (µg/m³) into Berkeley Earth passive cigarette equivalents.
 */
export function calculateCigarettesPerDay(pm25: number): number {
  return Math.round((pm25 / BERKELEY_EARTH_UG_PER_CIG) * 10) / 10;
}

/**
 * Classifies an hour of day (0–23) into midday solar dispersion vs. trapped inversion.
 */
export function classifyDiurnalWindow(hour: number): DiurnalWindowClass {
  const h = ((hour % 24) + 24) % 24;
  return h >= 10 && h < 16 ? "midday_dispersion" : "trapped_inversion";
}

/**
 * Checks whether a scrubbed hour (0–23) falls inside a routine card's time-window string.
 */
export function doesHourMatchWindow(hour: number, timeWindow: string): boolean {
  const match = timeWindow.match(/(\d{1,2}):\d{2}\s*[-–]\s*(\d{1,2}):\d{2}/);
  if (!match) return false;
  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

/**
 * Maps an air-quality risk level string to Tailwind badge utility classes.
 */
export function getRiskBadgeStyle(risk?: string): string {
  switch (risk) {
    case "hazardous":
    case "very_unhealthy":
      return "border-red-500/40 bg-red-950/40 text-red-300";
    case "unhealthy":
      return "border-amber-500/40 bg-amber-950/40 text-amber-300";
    case "moderate":
      return "border-zinc-700 bg-zinc-900 text-zinc-300";
    default:
      return "border-emerald-500/40 bg-emerald-950/40 text-emerald-300";
  }
}
