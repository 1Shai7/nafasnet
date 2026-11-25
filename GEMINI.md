# Weather App - Antigravity Agent Guidelines

This Next.js application integrates Tailwind CSS and the Open-Meteo API.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4 (`@tailwindcss/turbopack`)
- TypeScript
- Open-Meteo Forecast API

## Key Files
- `src/lib/open-meteo.ts`: Core Open-Meteo API client and console logging utility.
- `src/app/api/weather/route.ts`: Server-side API route handler that logs to server console.
- `src/app/page.tsx`: Interactive weather dashboard displaying weather and logging to client console.
- `scripts/fetch-weather.mjs`: CLI verification script to fetch and log weather data to terminal console.

## Common Tasks
- Run dev server: `npm run dev`
- Build app: `npm run build`
- Direct console fetch: `npm run fetch-weather`
