/**
 * Core Types for Air Quality & Routine Hacks Platform
 */

export type SensitiveMember =
  | "infant"
  | "toddler"
  | "elderly"
  | "asthmatic"
  | "pregnant"
  | "cardiovascular_patient"
  | "none";

export type CommuteType =
  | "Two-Wheeler"
  | "Metro"
  | "Car (AC Recirculate)"
  | "Bicycle"
  | "Walking"
  | "Bus";

export type HomeSetup =
  | "Naturally ventilated apartment"
  | "Apartment with air purifiers"
  | "Sealed HVAC with MERV/HEPA filters"
  | "Independent house near high-traffic arterial road"
  | "Suburban home with perimeter garden";

export interface HouseholdPersona {
  location: string;
  sensitiveMembers: string[];
  homeSetup: string;
  commuteType: CommuteType | string;
  commuteDistanceKm?: number;
  commuteHoursPerDay?: number;
}

export type RiskLevel = "low" | "moderate" | "unhealthy" | "very_unhealthy" | "hazardous";

export type VentilationStatus =
  | "keep_closed"
  | "open_briefly"
  | "filtered_only"
  | "free_ventilation";

export interface DailyRoutineWindow {
  time_window: string; // e.g. "06:00 - 09:00 (Peak Morning Smog)"
  risk_level: RiskLevel;
  activity_advice: string; // e.g. "Strictly avoid outdoor jogging. Keep windows tightly shut."
  ventilation_status: VentilationStatus;
  commute_recommendation: string; // e.g. "N95 mask mandatory. Close bike helmet visor."
  expected_pm25_range?: string; // e.g. "120 - 180 µg/m³"
}

export type IndoorHackCategory = "zero-cost" | "diy" | "appliance";

export interface IndoorHack {
  category: IndoorHackCategory;
  title: string;
  description: string;
  estimated_aqi_drop: string; // e.g. "15-25% PM2.5 reduction"
  actionable_steps: string[];
  effort: "low" | "medium" | "high";
  cost_estimate?: string;
}

export interface RoutineHacksResponse {
  summary: string;
  location: string;
  daily_routine: DailyRoutineWindow[];
  indoor_hacks: IndoorHack[];
  key_precautions: string[];
  ai_model_used?: string;
  generated_at?: string;
}

export interface AirQualityHourlyPoint {
  time: string;
  formattedTime: string;
  pm2_5: number;
  pm10: number;
  nitrogen_dioxide: number;
  dust: number;
  european_aqi?: number;
  us_aqi?: number;
}

export interface AirQualityResponse {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    pm2_5: number;
    pm10: number;
    nitrogen_dioxide: number;
    dust: number;
    european_aqi: number;
    us_aqi: number;
    dominant_pollutant: string;
    risk_level: RiskLevel;
  };
  hourly: AirQualityHourlyPoint[];
  units: Record<string, string>;
}
