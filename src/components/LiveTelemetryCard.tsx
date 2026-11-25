"use client";

import React from "react";
import { RefreshCw, Cigarette } from "lucide-react";
import { AirQualityResponse } from "@/lib/types";
import { calculateCigarettesPerDay, getRiskBadgeStyle } from "@/lib/airMath";
import AnimatedNumber from "@/components/AnimatedNumber";

interface LiveTelemetryCardProps {
  aqiData: AirQualityResponse | null;
  fallbackCity: string;
  loadingAQI: boolean;
  onRefresh: () => void;
}

export default function LiveTelemetryCard({
  aqiData,
  fallbackCity,
  loadingAQI,
  onRefresh,
}: LiveTelemetryCardProps) {
  return (
    <div className="lg:col-span-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between card-interactive">
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="inline-flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-gold-pulse" />
            Live Atmospheric Reading
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-500">
              {aqiData?.current.time
                ? new Date(aqiData.current.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}
            </span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loadingAQI}
              aria-label="Refresh live telemetry"
              title="Refresh live telemetry"
              className="p-1 rounded border border-zinc-800 bg-black hover:border-[#D4AF37]/40 text-zinc-400 hover:text-[#E5C158] transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3 h-3 ${loadingAQI ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-white tracking-tight truncate">
              {aqiData?.city || fallbackCity}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">
              {aqiData?.country ? `${aqiData.country} · ` : ""}
              Dominant:{" "}
              <span className="text-zinc-300">
                {aqiData?.current.dominant_pollutant || "PM2.5"}
              </span>
            </p>
          </div>

          <span
            className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize border shrink-0 ${getRiskBadgeStyle(
              aqiData?.current.risk_level
            )}`}
          >
            {aqiData?.current.risk_level?.replace("_", " ") || "Loading"}
          </span>
        </div>

        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tight text-white font-mono tabular-nums">
            <AnimatedNumber value={aqiData?.current.pm2_5} decimals={1} />
          </span>
          <span className="text-base font-mono text-zinc-500">µg/m³</span>
          <span className="ml-auto text-xs font-mono text-zinc-500">
            US AQI{" "}
            <strong className="text-[#E5C158] text-sm">
              <AnimatedNumber value={aqiData?.current.us_aqi} />
            </strong>
          </span>
        </div>

        <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-zinc-800 bg-black text-xs font-mono text-zinc-400">
          <Cigarette className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>
            Equiv:{" "}
            <strong className="text-zinc-100">
              {aqiData
                ? calculateCigarettesPerDay(aqiData.current.pm2_5).toFixed(1)
                : "--"}
            </strong>{" "}
            cigarettes/day
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-zinc-800">
        {[
          { label: "PM10", val: aqiData?.current.pm10 },
          { label: "NO₂", val: aqiData?.current.nitrogen_dioxide },
          { label: "Dust", val: aqiData?.current.dust },
        ].map((metric) => (
          <div
            key={metric.label}
            className="bg-black p-3 rounded-lg border border-zinc-800/80"
          >
            <span className="text-xs text-zinc-500 block">{metric.label}</span>
            <span className="text-base font-semibold text-zinc-100 font-mono mt-0.5 block">
              {metric.val ?? "--"}{" "}
              <span className="text-[11px] font-normal text-zinc-500">µg</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
