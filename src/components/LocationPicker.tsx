"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Crosshair,
  ExternalLink,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export interface SelectedLocation {
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface GeocodeCandidate {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  currentCity: string;
  latitude?: number;
  longitude?: number;
  loading?: boolean;
  onSelectLocation: (loc: SelectedLocation) => void;
}

const INDIAN_METRO_PRESETS: SelectedLocation[] = [
  { city: "New Delhi", country: "India", latitude: 28.6139, longitude: 77.209 },
  { city: "Bengaluru", country: "India", latitude: 12.9716, longitude: 77.5946 },
  { city: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777 },
  { city: "Hyderabad", country: "India", latitude: 17.385, longitude: 78.4867 },
  { city: "Pune", country: "India", latitude: 18.5204, longitude: 73.8567 },
  { city: "Chennai", country: "India", latitude: 13.0827, longitude: 80.2707 },
  { city: "Kolkata", country: "India", latitude: 22.5726, longitude: 88.3639 },
  { city: "Lucknow", country: "India", latitude: 26.8467, longitude: 80.9462 },
];

export default function LocationPicker({
  currentCity,
  latitude = 28.6139,
  longitude = 77.209,
  loading = false,
  onSelectLocation,
}: LocationPickerProps) {
  const [query, setQuery] = useState(currentCity);
  const [suggestions, setSuggestions] = useState<GeocodeCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close autocomplete dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || trimmed.toLowerCase() === currentCity.toLowerCase()) {
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.results)) {
          setSuggestions(json.results);
          setDropdownOpen(true);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, currentCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setDropdownOpen(false);
    if (suggestions.length > 0) {
      const top = suggestions[0];
      onSelectLocation({
        city: top.name,
        country: top.country,
        latitude: top.latitude,
        longitude: top.longitude,
      });
    } else {
      onSelectLocation({ city: query.trim() });
    }
  };

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
          const json = await res.json();
          const top = json.results?.[0];
          onSelectLocation({
            city: top?.name || `GPS (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
            country: top?.country || "",
            latitude: lat,
            longitude: lon,
          });
        } catch {
          onSelectLocation({
            city: `Current Location`,
            latitude: lat,
            longitude: lon,
          });
        } finally {
          setLocatingGPS(false);
        }
      },
      (err) => {
        setLocatingGPS(false);
        setGpsError(
          err.code === 1
            ? "Location permission denied. Enable GPS access or search manually."
            : "Unable to determine current location."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=12&output=embed`;
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div ref={containerRef} className="w-full space-y-2.5">
      {/* Search + GPS + Map Toggle Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <form onSubmit={handleSubmit} className="relative flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onFocus={() => suggestions.length > 0 && setDropdownOpen(true)}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                if (val.trim().length < 2) {
                  setSuggestions([]);
                  setDropdownOpen(false);
                }
              }}
              placeholder="Search any city or area (e.g. Bengaluru, Indiranagar, Pune)..."
              className="w-full rounded-lg border border-white/10 bg-[#131B24] pl-9 pr-8 py-2 text-base sm:text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-400/50 focus:outline-none h-9"
            />
            {searching && (
              <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}

            {/* Autocomplete Dropdown */}
            {dropdownOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl z-50 overflow-hidden divide-y divide-zinc-900 animate-scale-in">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setQuery(item.name);
                      setDropdownOpen(false);
                      onSelectLocation({
                        city: item.name,
                        country: item.country,
                        latitude: item.latitude,
                        longitude: item.longitude,
                      });
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-zinc-900 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-medium text-zinc-100">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-zinc-500 ml-1.5">
                          {[item.admin1, item.country].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-3.5 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all active:scale-[0.97] disabled:opacity-50 shrink-0"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {/* Action Buttons: Use My Location + Google Maps Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locatingGPS || loading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-lg border border-white/10 bg-[#131B24] hover:bg-white/5 hover:border-white/20 text-slate-200 text-xs font-medium transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {locatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span>Use My Location</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-lg border text-xs font-medium transition-colors ${
              showMap
                ? "border-zinc-500 bg-zinc-900 text-white"
                : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>Map</span>
            {showMap ? (
              <ChevronUp className="w-3 h-3 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            )}
          </button>
        </div>
      </div>

      {/* GPS Error Notice */}
      {gpsError && (
        <p className="text-[11px] text-amber-400 bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5">
          {gpsError}
        </p>
      )}

      {/* Indian Metro Quick Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 touch-pan-x">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono shrink-0 mr-1">
          Cities:
        </span>
        {INDIAN_METRO_PRESETS.map((preset) => {
          const active = currentCity.toLowerCase() === preset.city.toLowerCase();
          return (
            <button
              key={preset.city}
              type="button"
              onClick={() => {
                setQuery(preset.city);
                setDropdownOpen(false);
                onSelectLocation(preset);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all duration-200 active:scale-[0.97] shrink-0 ${
                active
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/50 font-semibold"
                  : "bg-[#131B24] text-slate-400 border-white/10 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              {preset.city}
            </button>
          );
        })}
      </div>

      {/* Collapsible Dark Google Maps Embed */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          showMap ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          {showMap && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-black/60 text-[11px]">
                <div className="flex items-center gap-2 text-zinc-300 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{currentCity}</span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-zinc-500">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                </div>
                <a
                  href={googleMapsExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-[#D4AF37] transition-colors"
                >
                  <span>Open Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="w-full h-56 sm:h-64 bg-zinc-900 relative">
                <iframe
                  title={`Google Map for ${currentCity}`}
                  src={googleMapsEmbedUrl}
                  className="w-full h-full border-0 filter invert-[0.92] hue-rotate-180 contrast-[0.95] grayscale-[0.4]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
