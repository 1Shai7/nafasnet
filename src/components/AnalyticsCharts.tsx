"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import { AirQualityHourlyPoint, AirQualityResponse } from "@/lib/types";
import { BarChart3, Clock, ShieldAlert } from "lucide-react";

interface AnalyticsChartsProps {
  aqiData: AirQualityResponse;
}

const WHO_LIMITS = {
  pm25: 15,
  pm10: 45,
  no2: 25,
  dust: 50,
};

function getRiskColor(pm25: number): string {
  if (pm25 <= 15) return "#10b981"; // low
  if (pm25 <= 35) return "#a1a1aa"; // moderate
  if (pm25 <= 75) return "#f59e0b"; // unhealthy
  return "#ef4444"; // very_unhealthy / hazardous
}

function getWindowLabel(timeStr: string): string {
  const hour = parseInt(timeStr.split(":")[0] || "0", 10);
  if (hour >= 11 && hour <= 15) return "Solar Mixing Safe-Window — Best time for brief ventilation";
  if (hour >= 6 && hour <= 10) return "Morning Thermal Inversion — Keep windows closed, N95 outdoors";
  if (hour >= 16 && hour <= 20) return "Evening Traffic & Re-Inversion — Avoid outdoor exertion";
  return "Nocturnal Stagnation — Seal door/window gaps, run indoor filtration";
}

export default function AnalyticsCharts({ aqiData }: AnalyticsChartsProps) {
  const [whoMode, setWhoMode] = useState<"absolute" | "ratio">("absolute");
  const [selectedHourIdx, setSelectedHourIdx] = useState<number>(0);

  const selectedHour: AirQualityHourlyPoint =
    aqiData.hourly[selectedHourIdx] || aqiData.hourly[0];

  const whoComparisonData = [
    {
      pollutant: "PM2.5",
      live: aqiData.current.pm2_5,
      whoLimit: WHO_LIMITS.pm25,
      ratio: Math.round((aqiData.current.pm2_5 / WHO_LIMITS.pm25) * 10) / 10,
    },
    {
      pollutant: "PM10",
      live: aqiData.current.pm10,
      whoLimit: WHO_LIMITS.pm10,
      ratio: Math.round((aqiData.current.pm10 / WHO_LIMITS.pm10) * 10) / 10,
    },
    {
      pollutant: "NO₂",
      live: aqiData.current.nitrogen_dioxide,
      whoLimit: WHO_LIMITS.no2,
      ratio: Math.round((aqiData.current.nitrogen_dioxide / WHO_LIMITS.no2) * 10) / 10,
    },
    {
      pollutant: "Dust",
      live: aqiData.current.dust,
      whoLimit: WHO_LIMITS.dust,
      ratio: Math.round((aqiData.current.dust / WHO_LIMITS.dust) * 10) / 10,
    },
  ];

  const hourlyWindowData = aqiData.hourly.map((h, index) => ({
    index,
    time: h.formattedTime,
    pm2_5: h.pm2_5,
    no2: h.nitrogen_dioxide,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Chart 1: WHO Threshold Comparison */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                <BarChart3 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Guideline Benchmark</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mt-0.5">
                Live Pollutants vs. WHO 24h Limits
              </h3>
            </div>

            <div className="inline-flex rounded-lg border border-zinc-800 bg-black p-0.5 self-start">
              <button
                type="button"
                onClick={() => setWhoMode("absolute")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  whoMode === "absolute"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                µg/m³
              </button>
              <button
                type="button"
                onClick={() => setWhoMode("ratio")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  whoMode === "ratio"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                WHO × Ratio
              </button>
            </div>
          </div>

          <div className="w-full h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={whoComparisonData}
                margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="pollutant"
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#27272a" }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#27272a" }}
                />
                <Tooltip
                  cursor={{ fill: "#18181b" }}
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                {whoMode === "ratio" && (
                  <ReferenceLine
                    y={1}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: "1× WHO Safe",
                      position: "insideTopRight",
                      fill: "#10b981",
                      fontSize: 10,
                    }}
                  />
                )}
                {whoMode === "absolute" ? (
                  <>
                    <Bar
                      dataKey="live"
                      name="Live Reading (µg/m³)"
                      fill="#fafafa"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="whoLimit"
                      name="WHO Safe Limit (µg/m³)"
                      fill="#3f3f46"
                      radius={[4, 4, 0, 0]}
                    />
                  </>
                ) : (
                  <Bar
                    dataKey="ratio"
                    name="Exceedance (× WHO Limit)"
                    radius={[4, 4, 0, 0]}
                  >
                    {whoComparisonData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          entry.ratio > 3
                            ? "#ef4444"
                            : entry.ratio > 1
                            ? "#f59e0b"
                            : "#10b981"
                        }
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-4 gap-2 text-center font-mono text-[11px]">
          {whoComparisonData.map((item) => (
            <div key={item.pollutant} className="bg-black border border-zinc-900 rounded-lg py-1.5 px-1">
              <div className="text-zinc-500 text-[10px]">{item.pollutant}</div>
              <div
                className={`font-semibold mt-0.5 ${
                  item.ratio > 3
                    ? "text-red-400"
                    : item.ratio > 1
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {item.ratio}×
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Interactive 24h Hour-by-Hour Risk Explorer */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Interactive Hour Explorer</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mt-0.5">
                Click Any Hour to Inspect Exposure &amp; Window
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-black border border-zinc-800 px-2 py-1 rounded-md">
              {selectedHour.formattedTime}
            </span>
          </div>

          <div className="w-full h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyWindowData}
                margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                onClick={(state) => {
                  if (state && typeof state.activeTooltipIndex === "number") {
                    setSelectedHourIdx(state.activeTooltipIndex);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="time"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#27272a" }}
                  interval={3}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#27272a" }}
                />
                <Tooltip
                  cursor={{ fill: "#18181b" }}
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="pm2_5"
                  name="PM2.5 (µg/m³)"
                  radius={[3, 3, 0, 0]}
                  className="cursor-pointer"
                >
                  {hourlyWindowData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={getRiskColor(entry.pm2_5)}
                      fillOpacity={idx === selectedHourIdx ? 1 : 0.45}
                      stroke={idx === selectedHourIdx ? "#ffffff" : "none"}
                      strokeWidth={idx === selectedHourIdx ? 1.5 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Hour Readout */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80 bg-black border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-mono font-semibold text-zinc-100">
                {selectedHour.formattedTime}
              </span>
              <span className="text-zinc-400 ml-2">
                {getWindowLabel(selectedHour.formattedTime)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] shrink-0 text-zinc-300">
            <span>PM2.5: <strong className="text-white">{selectedHour.pm2_5}</strong></span>
            <span>NO₂: <strong className="text-white">{selectedHour.nitrogen_dioxide}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
