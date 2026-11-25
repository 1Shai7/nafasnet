"use client";

import React, { useState } from "react";
import { AirQualityResponse } from "@/lib/types";
import { Flame, Cigarette, Wind, AlertOctagon, RefreshCw } from "lucide-react";

interface ExposureFactsProps {
  aqiData: AirQualityResponse | null;
}

export default function ExposureFacts({ aqiData }: ExposureFactsProps) {
  const pm25 = aqiData?.current.pm2_5 ?? 115;
  const pm10 = aqiData?.current.pm10 ?? 140;
  const no2 = aqiData?.current.nitrogen_dioxide ?? 45;
  const city = aqiData?.city || "your city";

  // Berkeley Earth: 22 µg/m³ PM2.5 ≈ 1 cigarette / 24h
  const cigarettesPerDay = pm25 / 22;
  const cigText =
    cigarettesPerDay < 0.75
      ? "half a cigarette"
      : `${cigarettesPerDay.toFixed(1)} cigarettes`;

  // Average adult breathes ~18 m³ of air in 24h (~22,000 breaths)
  const dailyLungLoadMg = ((pm25 * 18) / 1000).toFixed(2);
  const oneHourRideUg = Math.round(pm25 * 1.2);
  const whoRatio = (pm25 / 15).toFixed(1);

  const facts = [
    {
      id: "cigarettes",
      tag: "PASSIVE SMOKING MATH",
      icon: Cigarette,
      headline: `Breathing unmasked in ${city} today feels like smoking ${cigText}.`,
      detail: `At ${pm25} µg/m³ PM2.5, 24 hours of unmasked breathing delivers the same fine-particulate dose as ${cigText} (Berkeley Earth benchmark: 22 µg/m³ = 1 cigarette) — even if you're a lifelong non-smoker.`,
    },
    {
      id: "lung-load",
      tag: "DAILY LUNG FILTER LOAD",
      icon: Wind,
      headline: `Your lungs are acting as a ${dailyLungLoadMg} mg soot filter today.`,
      detail: `Across ~22,000 breaths (18 m³ of air/day), your airways trap ${dailyLungLoadMg} mg of microscopic combustion soot and PM10 (${pm10} µg/m³) unless blocked by an N95 seal or indoor filtration.`,
    },
    {
      id: "commute-hit",
      tag: "UNMASKED COMMUTE PENALTY",
      icon: AlertOctagon,
      headline: `1 hour outside without a mask = ${oneHourRideUg} µg of PM2.5 straight to your bloodstream.`,
      detail: `That is ${whoRatio}× the WHO 24-hour safe guideline (15 µg/m³) compressed into a single 60-minute commute alongside ${no2} µg/m³ of traffic NO₂.`,
    },
    {
      id: "inversion-lid",
      tag: "THERMAL INVERSION TRAP",
      icon: Flame,
      headline: `Cold morning & night air puts an invisible glass lid 100m over ${city}.`,
      detail: `During 06:00–10:00 and 20:00–06:00, cold ground air traps exhaust at street level instead of letting it rise — making evening jogs more toxic than sitting in midday traffic.`,
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [spinTick, setSpinTick] = useState(0);
  const currentFact = facts[activeIdx];
  const Icon = currentFact.icon;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-medium border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#E5C158]">
            Reality Check
          </span>
          <span className="text-xs text-zinc-400">
            {currentFact.tag.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {facts.map((f, idx) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIdx
                    ? "w-5 bg-[#D4AF37]"
                    : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                }`}
                aria-label={`Show fact ${idx + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveIdx((prev) => (prev + 1) % facts.length);
              setSpinTick((t) => t + 1);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-800 bg-black hover:bg-zinc-900 hover:border-[#D4AF37]/40 text-xs text-zinc-300 transition-all active:scale-[0.97]"
          >
            <RefreshCw
              className="w-3 h-3 text-[#D4AF37] transition-transform duration-300"
              style={{ transform: `rotate(${spinTick * 180}deg)` }}
            />
            <span>Next Fact</span>
          </button>
        </div>
      </div>

      <div key={currentFact.id} className="mt-3.5 flex items-start gap-3 animate-fact-in">
        <div className="w-9 h-9 rounded-lg border border-[#D4AF37]/30 bg-black flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-zinc-100 leading-snug">
            {currentFact.headline}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            {currentFact.detail}
          </p>
        </div>
      </div>
    </section>
  );
}
