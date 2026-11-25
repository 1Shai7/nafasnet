"use client";

import React, { useEffect, useState } from "react";
import { HouseholdPersona } from "@/lib/types";
import { Users, Bike, Home, Shield, Sparkles } from "lucide-react";

interface PersonaSelectorProps {
  persona: HouseholdPersona;
  onPersonaChange: (persona: HouseholdPersona) => void;
}

type PresetKey = "caregiver" | "commuter" | "student" | null;

const PRESETS: Record<
  Exclude<PresetKey, null>,
  { label: string; emoji: string; description: string; persona: HouseholdPersona }
> = {
  caregiver: {
    label: "Caregiver Household",
    emoji: "👨‍👩‍👧",
    description: "Kids + Elderly, Cross-Ventilation, No Purifier",
    persona: {
      location: "New Delhi",
      sensitiveMembers: ["infant", "elderly"],
      homeSetup: "Independent house near high-traffic arterial road",
      commuteType: "Metro",
      commuteDistanceKm: 12,
      commuteHoursPerDay: 1.0,
    },
  },
  commuter: {
    label: "Daily Two-Wheeler Commuter",
    emoji: "🏍️",
    description: "High Road Dust / NO₂ Exposure, Mask + Transit Swap Focus",
    persona: {
      location: "New Delhi",
      sensitiveMembers: ["asthmatic"],
      homeSetup: "Naturally ventilated apartment",
      commuteType: "Two-Wheeler",
      commuteDistanceKm: 20,
      commuteHoursPerDay: 1.5,
    },
  },
  student: {
    label: "Budget Renter / Student",
    emoji: "🎒",
    description: "Ground Floor, Zero-Cost & DIY IAQ Hacks Focus",
    persona: {
      location: "New Delhi",
      sensitiveMembers: [],
      homeSetup: "Naturally ventilated apartment",
      commuteType: "Bicycle / Walk",
      commuteDistanceKm: 5,
      commuteHoursPerDay: 0.5,
    },
  },
};

const COMMUTE_MODES = ["Two-Wheeler", "Metro", "Car (AC Recirc)", "Bicycle / Walk"];

const SENSITIVE_MEMBERS = [
  { id: "asthmatic", label: "Asthmatic" },
  { id: "infant", label: "Infant / Toddler" },
  { id: "elderly", label: "Elderly (65+)" },
  { id: "pregnant", label: "Pregnant" },
  { id: "heart_condition", label: "Cardiovascular" },
];

const HOME_SETUPS = [
  "Naturally ventilated apartment",
  "Apartment with air purifiers",
  "Sealed HVAC with MERV/HEPA filters",
  "Independent house near high-traffic arterial road",
  "Suburban home with perimeter garden",
];

function detectPreset(p: HouseholdPersona): PresetKey {
  for (const [key, preset] of Object.entries(PRESETS)) {
    const pp = preset.persona;
    if (
      p.commuteType === pp.commuteType &&
      p.homeSetup === pp.homeSetup &&
      JSON.stringify([...p.sensitiveMembers].sort()) ===
        JSON.stringify([...pp.sensitiveMembers].sort())
    ) {
      return key as PresetKey;
    }
  }
  return null;
}

export default function PersonaSelector({
  persona,
  onPersonaChange,
}: PersonaSelectorProps) {
  const [activePreset, setActivePreset] = useState<PresetKey>(
    detectPreset(persona)
  );

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("vayu_persona");
      if (saved) {
        const parsed: { presetKey: PresetKey; persona: HouseholdPersona } =
          JSON.parse(saved);
        if (parsed.persona && parsed.persona.location) {
          setActivePreset(parsed.presetKey);
          onPersonaChange(parsed.persona);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "vayu_persona",
        JSON.stringify({ presetKey: activePreset, persona })
      );
    } catch {
      // Ignore storage errors
    }
  }, [persona, activePreset]);

  const handlePresetClick = (key: Exclude<PresetKey, null>) => {
    setActivePreset(key);
    onPersonaChange(PRESETS[key].persona);
  };

  const handleCommuteChange = (mode: string) => {
    setActivePreset(null);
    onPersonaChange({ ...persona, commuteType: mode });
  };

  const toggleSensitiveMember = (memberId: string) => {
    setActivePreset(null);
    const exists = persona.sensitiveMembers.includes(memberId);
    const updated = exists
      ? persona.sensitiveMembers.filter((m) => m !== memberId)
      : [...persona.sensitiveMembers, memberId];
    onPersonaChange({ ...persona, sensitiveMembers: updated });
  };

  const handleHomeSetupChange = (homeSetup: string) => {
    setActivePreset(null);
    onPersonaChange({ ...persona, homeSetup });
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* One-Click Preset Buttons */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Target Audience Presets
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(Object.entries(PRESETS) as [Exclude<PresetKey, null>, typeof PRESETS[Exclude<PresetKey, null>]][]).map(
            ([key, preset]) => (
              <button
                key={key}
                onClick={() => handlePresetClick(key)}
                className={`text-left p-3 rounded-xl border transition-all active:scale-95 ${
                  activePreset === key
                    ? "bg-purple-500/15 border-purple-500/50 ring-1 ring-purple-500/40 shadow-sm shadow-purple-500/10"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{preset.emoji}</span>
                  <span
                    className={`text-xs font-bold leading-tight ${
                      activePreset === key ? "text-purple-200" : "text-slate-300"
                    }`}
                  >
                    {preset.label}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug">
                  {preset.description}
                </p>
              </button>
            )
          )}
        </div>
        {activePreset === null && (
          <p className="text-[10px] text-slate-500 mt-1.5">
            ✏️ Custom configuration active
          </p>
        )}
      </div>

      {/* Commute Selector */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Bike className="w-3.5 h-3.5 text-cyan-400" />
          Commute Modality:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COMMUTE_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => handleCommuteChange(mode)}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center min-h-[42px] active:scale-95 ${
                persona.commuteType === mode ||
                (mode === "Car (AC Recirc)" && persona.commuteType.includes("Car")) ||
                (mode === "Bicycle / Walk" && persona.commuteType.includes("Bicycle"))
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm ring-1 ring-cyan-500/40"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Sensitive Members Tags */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          Vulnerable Residents:
        </label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {SENSITIVE_MEMBERS.map((item) => {
            const isActive = persona.sensitiveMembers.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleSensitiveMember(item.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 active:scale-95 ${
                  isActive
                    ? "bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-purple-400" : "bg-slate-600"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Home Setup Dropdown */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-emerald-400" />
          Home Architecture &amp; Filtration:
        </label>
        <select
          value={persona.homeSetup}
          onChange={(e) => handleHomeSetupChange(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 sm:py-2 text-base sm:text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
        >
          {HOME_SETUPS.map((setup) => (
            <option key={setup} value={setup}>
              {setup}
            </option>
          ))}
        </select>
      </div>

      {/* Footer note */}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1 border-t border-slate-800">
        <span className="flex items-center gap-1.5">
          <Users className="w-3 h-3" />
          Persona saved to device.
        </span>
        <span className="text-cyan-400 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Auto-sync
        </span>
      </div>
    </div>
  );
}
