# 🌬️ VayuMitra — Personalized Winter Smog Survival Intelligence

> **Translating live hourly winter smog telemetry into personalized safe-window routines, zero-cost-to-appliance indoor air hacks, and quantified health/carbon impact — built for India's 400M+ urban breathers.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini-2.5%20Flash-blue?logo=google)](https://ai.google.dev/)
[![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Free%20API-green)](https://open-meteo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-cyan?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🚨 Problem Statement

India's northern plain cities — Delhi, Lucknow, Patna, Chandigarh — experience severe **wintertime PM2.5 smog** driven by:

- **Thermal inversions** (06:00–10:00 and 20:00–06:00) that trap ground-level particulates at 1.3–1.6× afternoon concentrations
- Stubble-burning aerosols from Punjab/Haryana fields (Oct–Nov)
- Vehicle NO2 and road dust from 2-wheeler/auto fleets
- Household biomass combustion in peri-urban zones

**Scale of impact:**
- 400M+ urban residents breathe air exceeding WHO PM2.5 limits (15 µg/m³) by 10–20× during peak smog episodes
- 1.67M annual premature deaths linked to air pollution (WHO, 2024)
- **Existing tools give AQI numbers — but no actionable, persona-specific guidance for what to DO about it.**

**VayuMitra closes this gap** by combining live telemetry, thermal inversion science, and Indian household economics into a single, mobile-first decision engine.

---

## 👥 Target Audience Personas

### 👨‍👩‍👧 Caregiver Household
| Attribute | Value |
|-----------|-------|
| Members | 2 adults + infant + elderly parent (65+) |
| Home | Independent house near high-traffic arterial road |
| Commute | Metro (1 adult) |
| Primary Risk | Infant pulmonary development + elderly COPD exacerbation |
| VayuMitra Value | Safe-window timings, wet mopping + damp sealing protocols, no-cost bedroom shielding |

### 🏍️ Daily Two-Wheeler Commuter
| Attribute | Value |
|-----------|-------|
| Members | Single adult or couple, asthmatic |
| Home | Naturally ventilated apartment |
| Commute | 20 km two-wheeler daily (1.5 hrs road exposure) |
| Primary Risk | Extreme cumulative PM2.5 inhalation; mask fatigue; NO2 exposure at traffic junctions |
| VayuMitra Value | Mask efficiency math, Metro-swap CO2 savings, inversion-window avoidance |

### 🎒 Budget Renter / Student
| Attribute | Value |
|-----------|-------|
| Members | 1–2 students, ground floor |
| Home | Naturally ventilated apartment, no purifier |
| Commute | Bicycle / Walk (5 km) |
| Primary Risk | Ground-floor amplified road dust; zero budget for appliances |
| VayuMitra Value | DIY MERV-13 Corsi-Rosenthal fan (₹1,500), wet mopping, damp-cloth sealing — all zero-to-low cost |

---

## ⚔️ Competitive Analysis

| Feature | **VayuMitra** | IQAir | SAFAR (Govt) | Generic Weather Apps |
|---------|:---:|:---:|:---:|:---:|
| Live Hourly PM2.5 / PM10 / NO2 / Dust | ✅ | ✅ | ✅ | ❌ |
| Thermal Inversion Safe-Window Timing | ✅ | ❌ | ❌ | ❌ |
| Persona-Tailored IAQ Protocols | ✅ | ❌ | ❌ | ❌ |
| Indian Household Hacks (Wet Mopping, Damp Cloth) | ✅ | ❌ | ❌ | ❌ |
| DIY Purifier Guide (₹1,500 MERV-13) | ✅ | ❌ | ❌ | ❌ |
| Deterministic PM2.5 Avoided Math | ✅ | ❌ | ❌ | ❌ |
| CO₂ Savings Quantification | ✅ | ❌ | ❌ | ❌ |
| Gemini AI Routine Generation | ✅ | ❌ | ❌ | ❌ |
| Mobile-First, Zero API-Key Required | ✅ | Partial | ❌ | ✅ |
| Free & Open Source | ✅ | ❌ | ✅ | Varies |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        VayuMitra — Next.js 16 App Router           │
│                                                                    │
│  ┌─────────────────┐    ┌──────────────────────────────────────┐  │
│  │  page.tsx        │    │  API Routes                          │  │
│  │  (Client comp)   │    │                                      │  │
│  │                  │───▶│  /api/air-quality                    │  │
│  │  PersonaSelector │    │  → Open-Meteo Geocoding API          │  │
│  │  AQITimeline     │    │  → Open-Meteo Air Quality API        │  │
│  │  ImpactSimulator │    │    (PM2.5, PM10, NO2, Dust, 24h)     │  │
│  │  Routine Cards   │    │                                      │  │
│  │                  │───▶│  /api/recommendations                │  │
│  └─────────────────┘    │  → Gemini 2.5 Flash (Structured JSON)│  │
│                          │  → Deterministic Fallback Engine      │  │
│                          └──────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Recharts 24h Area Chart  │  Impact Simulator  │  LocalStor │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
  Open-Meteo (free, no key)    Google Gemini 2.5 Flash
  api.open-meteo.com            (optional key in .env.local)
  geocoding-api.open-meteo.com
```

**Data Flow:**
1. User enters city → Geocoding API resolves lat/lon
2. Air Quality API fetches 24h hourly PM2.5, PM10, NO2, dust
3. Persona + AQI data sent to `/api/recommendations`
4. Gemini 2.5 Flash generates structured JSON (RoutineHacksResponse)
5. Dashboard renders timeline chart + routine cards + Impact Simulator

---

## 📐 Deterministic Impact Math

VayuMitra's Impact Simulator uses transparent, scientifically-grounded formulas — no black boxes.

### PM2.5 Avoided (µg/day)

$$\text{PM2.5 Avoided} = 1.2\,\text{m}^3/\text{hr} \times t_{\text{exposure}} \times [\text{PM2.5}]_{\text{ambient}} \times \eta_{\text{mask}}$$

Where:
- **1.2 m³/hr** = average adult breathing rate under light exertion
- **t_exposure** = commute hours per day
- **[PM2.5]_ambient** = live µg/m³ from Open-Meteo
- **η_mask** = mask filtration efficiency (N95 = 0.95, surgical = 0.60, none = 0)

### CO₂ Saved (g/day)

$$\text{CO}_2\,\text{Saved} = d \times 2 \times (e_{\text{two-wheeler}} - e_{\text{metro}})$$

$$= d \times 2 \times (40\,\text{g/km} - 15\,\text{g/km}) = d \times 50\,\text{g/km}$$

Where:
- **d** = one-way commute distance in km
- **40 g CO₂/km** = average two-wheeler emission factor (petrol, Indian conditions)
- **15 g CO₂/km** = Delhi Metro emission factor (grid-mix, 2024)

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/vayu-mitra.git
cd vayu-mitra/weather-app

# 2. Install dependencies
npm install

# 3. (Optional) Add Gemini API Key for live AI recommendations
# Without this, VayuMitra uses its built-in deterministic fallback engine
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build   # Compile and type-check
npm run start   # Serve production build
```

### CLI Weather Verification

```bash
npm run fetch-weather   # Fetch Open-Meteo data to console
```

---

## 🌐 API Sources

| API | Purpose | Key Required | Cost |
|-----|---------|:---:|------|
| [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) | PM2.5, PM10, NO2, Dust (hourly 24h) | ❌ | Free |
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City → lat/lon resolution | ❌ | Free |
| [Google Gemini 2.5 Flash](https://ai.google.dev/) | Structured JSON routine recommendations | ✅ Optional | Free tier available |

> **VayuMitra works fully offline from external AI** — the deterministic fallback engine provides scientifically-grounded Indian household advice without any API keys.

---

## 🏆 Hackathon Context — Hack2Skill

**Category:** AI for Social Impact / Clean Tech  
**Problem Domain:** Urban Air Quality & Public Health  
**Target Geography:** India (North Indian Plain, Indo-Gangetic smog belt)

**Key Differentiators for Judges:**
1. **Thermal Inversion Science** — Explicit 06:00–10:00 / 20:00–06:00 stagnation windows vs 11:00–15:00 safe mixing window, grounded in atmospheric boundary-layer physics
2. **Indian Household Economics** — All hacks priced in ₹, from ₹0 (wet mopping) to ₹1,500 (DIY MERV-13) to ₹1,000 (AC carbon mesh)
3. **Deterministic Math Transparency** — PM2.5 avoided and CO2 saved are formula-computed from live telemetry, not estimated
4. **Zero Infrastructure Cost** — Open-Meteo is free, Gemini has a free tier, Next.js deploys to Vercel free tier
5. **Mobile-First** — Designed for India's smartphone-first population; touch-optimized, bottom-nav, iOS no-zoom inputs

---

## 📁 Project Structure

```
weather-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main dashboard
│   │   ├── layout.tsx                  # Root layout (viewport, metadata)
│   │   ├── globals.css                 # Tailwind v4 + mobile overrides
│   │   └── api/
│   │       ├── air-quality/route.ts    # Open-Meteo Air Quality API
│   │       ├── recommendations/route.ts # Gemini 2.5 Flash + fallback
│   │       └── weather/route.ts        # Open-Meteo weather route
│   ├── components/
│   │   ├── PersonaSelector.tsx         # Persona presets + custom toggles
│   │   ├── AQITimeline.tsx             # Recharts 24h area chart
│   │   └── ImpactSimulator.tsx         # Deterministic PM2.5 & CO2 math
│   └── lib/
│       └── types.ts                    # TypeScript interfaces
├── scripts/
│   └── fetch-weather.mjs               # CLI verification script
└── README.md
```

---

## 📄 License

MIT — Built with ❤️ for India's urban breathers.
