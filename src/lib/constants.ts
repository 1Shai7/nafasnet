import { HouseholdPersona } from "@/lib/types";

export interface SelectedLocation {
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export type CommuteOption = "Two-Wheeler" | "Metro" | "Car" | "WFH";
export type VulnerabilityOption = "None" | "Asthma" | "Kids & Elderly";
export type SetupOption = "Zero-Cost & DIY" | "Air Purifier";

export const COMMUTE_OPTIONS: CommuteOption[] = ["Two-Wheeler", "Metro", "Car", "WFH"];
export const VULNERABILITY_OPTIONS: VulnerabilityOption[] = ["None", "Asthma", "Kids & Elderly"];
export const SETUP_OPTIONS: SetupOption[] = ["Zero-Cost & DIY", "Air Purifier"];

export const INDIAN_METRO_PRESETS: SelectedLocation[] = [
  { city: "New Delhi", country: "India", latitude: 28.6139, longitude: 77.209 },
  { city: "Bengaluru", country: "India", latitude: 12.9716, longitude: 77.5946 },
  { city: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777 },
  { city: "Hyderabad", country: "India", latitude: 17.385, longitude: 78.4867 },
  { city: "Pune", country: "India", latitude: 18.5204, longitude: 73.8567 },
  { city: "Chennai", country: "India", latitude: 13.0827, longitude: 80.2707 },
  { city: "Kolkata", country: "India", latitude: 22.5726, longitude: 88.3639 },
  { city: "Lucknow", country: "India", latitude: 26.8467, longitude: 80.9462 },
];

export const DEFAULT_COMPARE_CITIES: string[] = ["Bengaluru", "Mumbai", "Hyderabad"];

/** WHO 24-hour Air Quality Guideline limits (µg/m³). */
export const WHO_LIMITS = {
  pm25: 15,
  pm10: 45,
  no2: 25,
  dust: 50,
} as const;

/** Filtration efficiency fractions by respirator standard. */
export const MASK_EFFICIENCY = {
  n95: 0.95,
  cloth: 0.3,
  none: 0.0,
} as const;

export type MaskType = keyof typeof MASK_EFFICIENCY;

/** Commute CO₂ emission factors in grams per passenger-km. */
export const CO2_FACTORS = {
  twoWheelerGramsPerKm: 40,
  metroGramsPerKm: 15,
} as const;

export const ADULT_BREATHING_RATE_M3_PER_HR = 1.2;
export const BERKELEY_EARTH_UG_PER_CIG = 22;

export const DEFAULT_PERSONA: HouseholdPersona = {
  location: "New Delhi",
  sensitiveMembers: ["asthmatic"],
  homeSetup: "Naturally ventilated apartment",
  commuteType: "Two-Wheeler",
  commuteDistanceKm: 20,
  commuteHoursPerDay: 1.5,
};
