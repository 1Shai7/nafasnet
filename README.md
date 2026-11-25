# NafasNet — Urban Air Intelligence & Exposure OS

> **Translating live hourly air quality telemetry into thermal-inversion safe-windows, zero-cost-to-DIY indoor air hacks, multi-city benchmarks, and deterministic PM2.5 & CO₂ math.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-zinc?logo=tailwindcss)](https://tailwindcss.com/)
[![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Free%20API-green)](https://open-meteo.com/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini-2.5%20Flash-blue?logo=google)](https://ai.google.dev/)

---

## 1. Project Planning & Research

### Idea Identification & Problem Statement
Indian metropolitan regions experience severe diurnal PM2.5/PM10 spikes driven by morning (`06:00–10:00`) and nocturnal (`20:00–06:00`) thermal inversions, traffic NO₂, and road dust. Existing AQI tools report raw numbers without telling households *when* to ventilate, *how* to protect vulnerable residents on a ₹0–₹1,500 budget, or *how much* particulate intake and CO₂ they avoid by changing commute modes.

### Target Audience Research
| Persona | Context | Primary Risk | NafasNet Protocol |
|---------|---------|--------------|--------------------|
| **Caregiver Household** | Kids + Elderly, Arterial Road Home, No Purifier | Infant lung development & elderly COPD flares | Inversion window sealing, wet mopping, safe-window brief |
| **Two-Wheeler Commuter** | 20 km/day road exposure, Asthmatic | Cumulative PM2.5 + NO₂ inhalation | N95 efficiency math, Metro CO₂ offset, off-peak shift |
| **Budget Renter / Student** | Ground floor apartment, Zero appliance budget | Road dust resuspension | ₹0 wet mopping + ₹1,500 DIY MERV-13 box fan |

### Market Research & Competitive Matrix
| Capability | **NafasNet** | IQAir | SAFAR | Weather Apps |
|------------|:---:|:---:|:---:|:---:|
| Live Hourly PM2.5 / PM10 / NO₂ / Dust | Yes | Yes | Yes | No |
| Autocomplete + GPS + Google Maps Embed | Yes | Partial | No | Yes |
| Multi-City Comparison Matrix & Cigarette Equiv. | Yes | No | No | No |
| Thermal Inversion Safe-Window Protocols | Yes | No | No | No |
| ₹0–₹1,500 Indian Household IAQ Hacks | Yes | No | No | No |
| Deterministic PM2.5 & CO₂ Simulator | Yes | No | No | No |
| Copyable Family Air Brief | Yes | No | No | No |

### Unique Value Proposition (UVP) & Scope
- **UVP:** Deterministic exposure physics + Indian household economics + live Google Maps/GPS telemetry in a zero-API-key-required web OS.
- **In Scope (MVP):** Real-time geocoding & GPS lookup, 24h dispersion & WHO exceedance charts, multi-city comparison, Gemini 2.5 Flash + deterministic fallback routines, Impact Simulator, localStorage persona persistence.
- **Out of Scope:** Hardware IoT sensor pairing, multi-user cloud auth/billing (stateless privacy-first architecture).

### Success Metrics (KPIs)
- Time-to-first-telemetry under `1.5s` via cached Next.js API routes.
- Zero-dependency resilience (`100%` uptime fallback when `GEMINI_API_KEY` is absent).
- Lighthouse Accessibility & Mobile Responsiveness compliance.

---

## 2. Technical Research & Architecture

### Technology Stack
- **Frontend:** Next.js 16 (App Router, React 19, TypeScript Strict), Tailwind CSS v4, Recharts, Lucide React
- **Backend / API Routes:** Next.js Route Handlers (`/api/air-quality`, `/api/geocode`, `/api/recommendations`, `/api/weather`)
- **External Services:** Open-Meteo Air Quality & Geocoding APIs, OpenStreetMap Nominatim (reverse GPS geocoding), Google Maps Embed, Google Gemini 2.5 Flash (`@google/genai`)
- **Hosting & CI/CD:** Vercel (Production), GitHub Actions (`.github/workflows/ci.yml`)

### System & API Architecture
```
Client (page.tsx)
 ├── LocationPicker ──▶ /api/geocode (Forward Search & GPS Reverse Geocode) + Google Maps Embed
 ├── Telemetry & Charts ──▶ /api/air-quality (Open-Meteo 24h PM2.5, PM10, NO2, Dust)
 ├── CityCompare ──▶ /api/air-quality (Multi-city live benchmark + Cigarette Equiv.)
 ├── PersonaSelector ──▶ localStorage ("nafasnet_persona") + /api/recommendations
 └── ImpactSimulator ──▶ Deterministic Math Engine (PM2.5 Avoided + CO2 Saved)
```

### Deterministic Math Formulas
- **PM2.5 Avoided (µg/day):** `1.2 m³/hr × exposure_hours × ambient_PM2.5 × mask_efficiency`
- **CO₂ Saved (g/day):** `(round_trip_km × 40g) - (round_trip_km × 15g)`
- **Berkeley Earth Cigarette Equivalence:** `PM2.5 / 22` cigarettes/day

### Security & Privacy Architecture
- No user PII stored on backend servers; household persona settings are stored strictly client-side in `localStorage`.
- `GEMINI_API_KEY` is isolated server-side in `.env.local` (gitignored) and never exposed to client bundles.

---

## 3. UI/UX Design System

- **Palette:** Monochrome Obsidian & Neutral Zinc (`#050505`, `zinc-950`, `zinc-900`, `zinc-800` hairline borders), with semantic accents reserved strictly for air-quality risk thresholds (`emerald`, `amber`, `red`).
- **Typography:** Geist Sans for UI hierarchy + Geist Mono (`tabular-nums`) for telemetry, coordinates, and deterministic formulas.
- **Responsive Design:** Mobile-first grid with `16px` input sizing (preventing iOS zoom), horizontal touch-scroll preset chips, and fixed mobile bottom navigation.

---

## 4. Development Environment, CI/CD & Setup

### Local Development
```bash
git clone https://github.com/1Shai7/vayumitra.git
cd vayumitra  # repo name; app is NafasNet
npm install

# Optional: add GEMINI_API_KEY in .env.local for live Gemini 2.5 Flash calls
npm run dev
```

### Quality Checks & CI/CD
- **Linting:** `npm run lint` (ESLint)
- **Production Build:** `npm run build` (`next build` + TypeScript strict check)
- **CI Pipeline:** `.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, and `npm run build` on every push and pull request to `main`.
