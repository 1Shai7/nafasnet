"use client";

import React, { useEffect } from "react";
import { HouseholdPersona } from "@/lib/types";
import { Users, Bike, Home, Shield, HeartHandshake, GraduationCap } from "lucide-react";

interface PersonaSelectorProps {
  persona: HouseholdPersona;
  onPersonaChange: (persona: HouseholdPersona) => void;
}

type PresetKey = "caregiver" | "commuter" | "student" | null;

const PRESETS: Record<
  Exclude<PresetKey, null>,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    persona: HouseholdPersona;
  }
> = {
  caregiver: {
    label: "Caregiver Household",
    description: "Kids + Elderly, Cross-Ventilation, No Purifier",
    icon: HeartHandshake,
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
    label: "Two-Wheeler Commuter",
    description: "Road Dust & NO₂ Exposure, Mask + Transit Focus",
    icon: Bike,
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
    description: "Ground Floor, Zero-Cost & DIY IAQ Hacks",
    icon: GraduationCap,
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
  const activePreset = detectPreset(persona);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("pranagrid_persona");
      if (saved) {
        const parsed: { presetKey: PresetKey; persona: HouseholdPersona } =
          JSON.parse(saved);
        if (parsed.persona && parsed.persona.location) {
          onPersonaChange(parsed.persona);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "pranagrid_persona",
        JSON.stringify({ presetKey: activePreset, persona })
      );
    } catch {
      // Ignore storage errors
    }
  }, [persona, activePreset]);

  const handlePresetClick = (key: Exclude<PresetKey, null>) => {
    // Preserve the user's currently selected city when switching persona presets
    onPersonaChange({ ...PRESETS[key].persona, location: persona.location });
  };

  const handleCommuteChange = (mode: string) => {
    onPersonaChange({ ...persona, commuteType: mode });
  };

  const toggleSensitiveMember = (memberId: string) => {
    const exists = persona.sensitiveMembers.includes(memberId);
    const updated = exists
      ? persona.sensitiveMembers.filter((m) => m !== memberId)
      : [...persona.sensitiveMembers, memberId];
    onPersonaChange({ ...persona, sensitiveMembers: updated });
  };

  const handleHomeSetupChange = (homeSetup: string) => {
    onPersonaChange({ ...persona, homeSetup });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* One-Click Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Audience Presets
          </span>
          {activePreset === null && (
            <span className="text-[10px] font-mono text-zinc-400">Custom Profile</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(
            Object.entries(PRESETS) as [
              Exclude<PresetKey, null>,
              (typeof PRESETS)[Exclude<PresetKey, null>]
            ][]
          ).map(([key, preset]) => {
            const Icon = preset.icon;
            const isSelected = activePreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePresetClick(key)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? "bg-zinc-100 text-zinc-950 border-zinc-100"
                    : "bg-black border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/70"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  />
                  <span className="text-xs font-semibold leading-tight">
                    {preset.label}
                  </span>
                </div>
                <p
                  className={`text-[11px] leading-snug ${
                    isSelected ? "text-zinc-700" : "text-zinc-500"
                  }`}
                >
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commute Selector */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
          <Bike className="w-3.5 h-3.5 text-zinc-400" />
          Commute Modality
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COMMUTE_MODES.map((mode) => {
            const selected =
              persona.commuteType === mode ||
              (mode === "Car (AC Recirc)" && persona.commuteType.includes("Car")) ||
              (mode === "Bicycle / Walk" && persona.commuteType.includes("Bicycle"));
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleCommuteChange(mode)}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-colors text-center min-h-[38px] ${
                  selected
                    ? "bg-zinc-800 border-zinc-500 text-white"
                    : "bg-black border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sensitive Members */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          Vulnerable Residents
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SENSITIVE_MEMBERS.map((item) => {
            const isActive = persona.sensitiveMembers.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleSensitiveMember(item.id)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-zinc-800 border-zinc-500 text-white"
                    : "bg-black border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-zinc-100" : "bg-zinc-700"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Home Setup */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-zinc-400" />
          Home Architecture &amp; Filtration
        </label>
        <select
          value={persona.homeSetup}
          onChange={(e) => handleHomeSetupChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-base sm:text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
        >
          {HOME_SETUPS.map((setup) => (
            <option key={setup} value={setup}>
              {setup}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
        <span className="flex items-center gap-1.5">
          <Users className="w-3 h-3" />
          Saved locally in browser
        </span>
        <span className="font-mono text-zinc-400">AUTO-SYNC</span>
      </div>
    </div>
  );
}
