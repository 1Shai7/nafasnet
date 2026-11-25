import { describe, it, expect } from "vitest";
import {
  calculateImpactMetrics,
  calculateCigarettesPerDay,
  classifyDiurnalWindow,
} from "@/lib/air-math";

describe("NafasNet Deterministic Air & Impact Math", () => {
  it("compares PM2.5 inhalation & filtration across Unmasked (0%), Cloth (30%), and N95 (95%)", () => {
    const base = {
      ambientPM25: 100,
      exposureHours: 2,
      commuteDistanceKm: 10,
      switchToMetro: false,
    };

    const unmasked = calculateImpactMetrics({ ...base, maskType: "none" });
    const cloth = calculateImpactMetrics({ ...base, maskType: "cloth" });
    const n95 = calculateImpactMetrics({ ...base, maskType: "n95" });

    // Baseline intake = 1.2 * 2 * 100 = 240 µg
    expect(unmasked.baselineIntake_ug).toBe(240);
    expect(unmasked.dailyPM25Avoided_ug).toBe(0);
    expect(unmasked.actualInhaled_ug).toBe(240);

    expect(cloth.dailyPM25Avoided_ug).toBe(72);
    expect(cloth.actualInhaled_ug).toBe(168);

    expect(n95.dailyPM25Avoided_ug).toBe(228);
    expect(n95.actualInhaled_ug).toBe(12);
  });

  it("calculates daily CO2 emissions saved when switching from two-wheeler to Metro Rail", () => {
    const metro = calculateImpactMetrics({
      ambientPM25: 120,
      exposureHours: 1.5,
      commuteDistanceKm: 20,
      maskType: "n95",
      switchToMetro: true,
    });
    const noMetro = calculateImpactMetrics({
      ambientPM25: 120,
      exposureHours: 1.5,
      commuteDistanceKm: 20,
      maskType: "n95",
      switchToMetro: false,
    });

    // Round-trip = 40 km; saved = 40 * (40g - 15g) = 1000g
    expect(metro.co2SavedDaily_grams).toBe(1000);
    expect(noMetro.co2SavedDaily_grams).toBe(0);
  });

  it("converts PM2.5 concentration to Berkeley Earth cigarette equivalents (22 µg/m³ = 1 cig)", () => {
    expect(calculateCigarettesPerDay(22)).toBe(1);
    expect(calculateCigarettesPerDay(11)).toBe(0.5);
    expect(calculateCigarettesPerDay(110)).toBe(5);
    expect(calculateCigarettesPerDay(154)).toBe(7);
  });

  it("classifies 06:00–10:00 and 20:00–06:00 as trapped_inversion", () => {
    for (const h of [0, 3, 5, 6, 8, 9, 20, 22, 23]) {
      expect(classifyDiurnalWindow(h)).toBe("trapped_inversion");
    }
  });

  it("classifies 10:00–16:00 as midday_dispersion", () => {
    for (const h of [10, 12, 13, 14, 15]) {
      expect(classifyDiurnalWindow(h)).toBe("midday_dispersion");
    }
  });
});
