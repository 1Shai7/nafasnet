"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { AirQualityHourlyPoint } from "@/lib/types";
import { Activity, Info, BarChart2, TrendingUp } from "lucide-react";

interface AQITimelineProps {
  hourlyData: AirQualityHourlyPoint[];
  locationName: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const pm25 = payload.find((p) => p.name === "PM2.5")?.value ?? 0;
    let statusDot = "bg-emerald-500";
    let statusText = "Low / Moderate";

    if (pm25 > 150) {
      statusDot = "bg-red-500";
      statusText = "Severe";
    } else if (pm25 > 75) {
      statusDot = "bg-red-400";
      statusText = "Very Unhealthy";
    } else if (pm25 > 35) {
      statusDot = "bg-amber-400";
      statusText = "Unhealthy";
    }

    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-950/95 p-3 shadow-2xl text-xs min-w-[180px] pointer-events-none z-50">
        <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-zinc-800">
          <span className="font-mono font-semibold text-zinc-200">{label}</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-zinc-300">
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
            {statusText}
          </span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-zinc-400 font-sans text-xs">
                <span
                  className="w-2 h-2 rounded-xs inline-block shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="font-semibold text-zinc-100 tabular-nums">
                {entry.value} µg/m³
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AQITimeline({ hourlyData, locationName }: AQITimelineProps) {
  const [chartMode, setChartMode] = useState<"area" | "bar">("area");
  const [showPM25, setShowPM25] = useState(true);
  const [showPM10, setShowPM10] = useState(true);
  const [showNO2, setShowNO2] = useState(true);
  const [showDust, setShowDust] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formattedChartData = hourlyData.map((d) => ({
    time: d.formattedTime,
    "PM2.5": d.pm2_5,
    PM10: d.pm10,
    NO2: d.nitrogen_dioxide,
    Dust: d.dust,
  }));

  const maxVal = Math.max(
    ...hourlyData.map((d) =>
      Math.max(
        showPM25 ? d.pm2_5 : 0,
        showPM10 ? d.pm10 : 0,
        showNO2 ? d.nitrogen_dioxide : 0,
        showDust ? d.dust : 0
      )
    ),
    50
  );

  const layers = [
    { key: "PM2.5", active: showPM25, toggle: () => setShowPM25(!showPM25), color: "#D4AF37" },
    { key: "PM10", active: showPM10, toggle: () => setShowPM10(!showPM10), color: "#a1a1aa" },
    { key: "NO₂", active: showNO2, toggle: () => setShowNO2(!showNO2), color: "#71717a" },
    { key: "Dust", active: showDust, toggle: () => setShowDust(!showDust), color: "#f59e0b" },
  ];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            <span>24-Hour Dispersion Curve</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-100">
            Atmospheric Inversion &amp; Particulate Profile — {locationName}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-zinc-800 bg-black p-0.5">
            <button
              type="button"
              onClick={() => setChartMode("area")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                chartMode === "area"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartMode("bar")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                chartMode === "bar"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <BarChart2 className="w-3 h-3" />
              Bars
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {layers.map((layer) => (
              <button
                key={layer.key}
                type="button"
                onClick={layer.toggle}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors flex items-center gap-1.5 shrink-0 ${
                  layer.active
                    ? "bg-zinc-900 border-zinc-600 text-zinc-100"
                    : "bg-black border-zinc-800 text-zinc-600 hover:text-zinc-400"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-xs shrink-0"
                  style={{ backgroundColor: layer.active ? layer.color : "#3f3f46" }}
                />
                {layer.key}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-64 sm:h-72 md:h-80 mt-5 -ml-2 sm:ml-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === "area" ? (
            <AreaChart
              data={formattedChartData}
              margin={{
                top: 10,
                right: isMobile ? 8 : 12,
                left: isMobile ? -20 : -12,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="monoPM25" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="monoPM10" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="time"
                stroke="#71717a"
                fontSize={isMobile ? 9 : 11}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                interval={isMobile ? 3 : 1}
              />
              <YAxis
                stroke="#71717a"
                fontSize={isMobile ? 9 : 11}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                domain={[0, Math.ceil(maxVal * 1.15)]}
                width={isMobile ? 34 : 42}
              />
              <Tooltip content={<CustomTooltip />} />

              <ReferenceLine
                y={35}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeOpacity={0.7}
                label={{
                  value: isMobile ? "WHO 35" : "WHO 24h Safe Limit (35 µg/m³)",
                  position: "insideTopLeft",
                  fill: "#f59e0b",
                  fontSize: isMobile ? 9 : 10,
                }}
              />

              {showPM25 && (
                <Area
                  type="monotone"
                  dataKey="PM2.5"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#monoPM25)"
                />
              )}
              {showPM10 && (
                <Area
                  type="monotone"
                  dataKey="PM10"
                  stroke="#a1a1aa"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#monoPM10)"
                />
              )}
              {showNO2 && (
                <Area
                  type="monotone"
                  dataKey="NO2"
                  stroke="#71717a"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  fill="transparent"
                />
              )}
              {showDust && (
                <Area
                  type="monotone"
                  dataKey="Dust"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  fill="transparent"
                />
              )}
            </AreaChart>
          ) : (
            <BarChart
              data={formattedChartData}
              margin={{
                top: 10,
                right: isMobile ? 8 : 12,
                left: isMobile ? -20 : -12,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="time"
                stroke="#71717a"
                fontSize={isMobile ? 9 : 11}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                interval={isMobile ? 3 : 1}
              />
              <YAxis
                stroke="#71717a"
                fontSize={isMobile ? 9 : 11}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                domain={[0, Math.ceil(maxVal * 1.15)]}
                width={isMobile ? 34 : 42}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="4 4" />
              {showPM25 && <Bar dataKey="PM2.5" fill="#D4AF37" radius={[2, 2, 0, 0]} />}
              {showPM10 && <Bar dataKey="PM10" fill="#71717a" radius={[2, 2, 0, 0]} />}
              {showNO2 && <Bar dataKey="NO2" fill="#3f3f46" radius={[2, 2, 0, 0]} />}
              {showDust && <Bar dataKey="Dust" fill="#f59e0b" radius={[2, 2, 0, 0]} />}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>Toggle Area/Bars or hover any timestamp to inspect hourly particulate concentration.</span>
        </span>
        <span className="font-mono">UNIT: µg/m³</span>
      </div>
    </div>
  );
}
