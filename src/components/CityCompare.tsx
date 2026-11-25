"use client";

import React, { useState, useEffect } from "react";
import { AirQualityResponse } from "@/lib/types";
import { ArrowLeftRight, Plus, X, Cigarette } from "lucide-react";

interface CityCompareProps {
  primaryCity: AirQualityResponse | null;
}

const DEFAULT_COMPARE_CITIES = ["Bengaluru", "Mumbai", "Hyderabad"];

export default function CityCompare({ primaryCity }: CityCompareProps) {
  const [compareCities, setCompareCities] = useState<string[]>(DEFAULT_COMPARE_CITIES);
  const [results, setResults] = useState<Record<string, AirQualityResponse>>({});
  const [newCity, setNewCity] = useState("");
  const [loadingCity, setLoadingCity] = useState<string | null>(null);

  useEffect(() => {
    compareCities.forEach(async (city) => {
      if (results[city]) return;
      try {
        const res = await fetch(`/api/air-quality?city=${encodeURIComponent(city)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setResults((prev) => ({ ...prev, [city]: json.data }));
        }
      } catch {
        // Ignore individual city fetch errors
      }
    });
  }, [compareCities]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCity.trim();
    if (!trimmed || compareCities.includes(trimmed)) return;
    setLoadingCity(trimmed);
    try {
      const res = await fetch(`/api/air-quality?city=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const resolved = json.data.city || trimmed;
        setResults((prev) => ({ ...prev, [resolved]: json.data }));
        if (!compareCities.includes(resolved)) {
          setCompareCities((prev) => [...prev, resolved]);
        }
      }
    } finally {
      setLoadingCity(null);
      setNewCity("");
    }
  };

  const removeCity = (city: string) => {
    setCompareCities((prev) => prev.filter((c) => c !== city));
  };

  const rows: AirQualityResponse[] = [];
  if (primaryCity) rows.push(primaryCity);
  compareCities.forEach((c) => {
    const data = results[c];
    if (data && (!primaryCity || data.city.toLowerCase() !== primaryCity.city.toLowerCase())) {
      rows.push(data);
    }
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Multi-City Benchmark</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mt-0.5">
            Live Exposure Comparison Matrix
          </h3>
        </div>

        <form onSubmit={handleAddCity} className="flex items-center gap-2">
          <input
            type="text"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="Compare city (e.g. Pune)..."
            className="rounded-lg border border-zinc-800 bg-black px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none w-44"
          />
          <button
            type="submit"
            disabled={loadingCity !== null}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <th className="py-2.5 pr-4">City</th>
              <th className="py-2.5 px-3">PM2.5</th>
              <th className="py-2.5 px-3">PM10</th>
              <th className="py-2.5 px-3">NO₂</th>
              <th className="py-2.5 px-3">US AQI</th>
              <th className="py-2.5 px-3">Cigarettes / Day</th>
              <th className="py-2.5 pl-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 font-mono">
            {rows.map((item, idx) => {
              const isPrimary = idx === 0 && primaryCity?.city === item.city;
              const cigarettes = (item.current.pm2_5 / 22).toFixed(1);
              return (
                <tr
                  key={item.city}
                  className={`transition-colors duration-150 ${
                    isPrimary ? "bg-[#D4AF37]/5" : "hover:bg-zinc-900/40"
                  }`}
                >
                  <td className="py-3 pr-4 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-100">{item.city}</span>
                      {isPrimary && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#E5C158]">
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-white font-semibold">
                    {item.current.pm2_5} <span className="text-zinc-500 font-normal">µg</span>
                  </td>
                  <td className="py-3 px-3 text-zinc-300">{item.current.pm10} µg</td>
                  <td className="py-3 px-3 text-zinc-300">{item.current.nitrogen_dioxide} µg</td>
                  <td className="py-3 px-3 text-zinc-200">{item.current.us_aqi}</td>
                  <td className="py-3 px-3 text-amber-400">
                    <span className="inline-flex items-center gap-1">
                      <Cigarette className="w-3.5 h-3.5 text-zinc-500" />
                      {cigarettes}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => removeCity(item.city)}
                        className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                        aria-label={`Remove ${item.city}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
