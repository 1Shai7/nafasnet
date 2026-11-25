export const MASK_EFFICIENCY = {
  n95: 0.95,
  cloth: 0.3,
  none: 0.0,
} as const;

export type MaskType = keyof typeof MASK_EFFICIENCY;

export interface ImpactInput {
  ambientPM25: number;
  exposureHours: number;
  commuteDistanceKm: number;
  maskType: MaskType;
  switchToMetro: boolean;
  offPeakTravel?: boolean;
}

export function calculateImpactMetrics(input: ImpactInput) {
  const BREATHING_RATE = 1.2;
  const maskEff = MASK_EFFICIENCY[input.maskType];
  const effectiveHours = input.offPeakTravel
    ? input.exposureHours * 0.8
    : input.exposureHours;
  const dailyDistance = input.commuteDistanceKm * 2;

  const baselineIntake_ug = BREATHING_RATE * effectiveHours * input.ambientPM25;
  const dailyPM25Avoided_ug = baselineIntake_ug * maskEff;
  const actualInhaled_ug = baselineIntake_ug - dailyPM25Avoided_ug;
  const co2SavedDaily_grams = input.switchToMetro
    ? dailyDistance * 40 - dailyDistance * 15
    : 0;

  return {
    baselineIntake_ug: Math.round(baselineIntake_ug * 10) / 10,
    dailyPM25Avoided_ug: Math.round(dailyPM25Avoided_ug * 10) / 10,
    actualInhaled_ug: Math.round(actualInhaled_ug * 10) / 10,
    co2SavedDaily_grams: Math.round(co2SavedDaily_grams),
  };
}

/** Berkeley Earth benchmark: 22 µg/m³ PM2.5 ≈ 1 cigarette / 24h */
export function calculateCigarettesPerDay(pm25: number): number {
  return Math.round((pm25 / 22) * 10) / 10;
}

export type DiurnalWindowClass = "trapped_inversion" | "midday_dispersion";

export function classifyDiurnalWindow(hour: number): DiurnalWindowClass {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 10 && h < 16) {
    return "midday_dispersion";
  }
  return "trapped_inversion";
}
