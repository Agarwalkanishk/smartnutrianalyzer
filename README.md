# SmartNutriAnalyzer

SmartNutriAnalyzer is a full-stack nutrition assistant built with Next.js. It helps users:

- create an account and maintain a personal health profile
- compute daily calorie and macro targets from profile inputs
- log meals and track day-wise intake totals
- analyze packaged-food ingredient lists for potential concerns
- get safer alternatives using rule-based checks and optional Gemini analysis

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- NextAuth (credentials provider)
- Prisma + PostgreSQL
- Zod validation
- Tesseract.js OCR
- Gemini API (optional, for richer ingredient analysis)

## Project Location

Run commands from:

```bash
smartnutrianalyzer/
```

(Repository root contains an outer folder; the actual app is this inner directory.)

## Features

- Authentication
- Email/password sign-up and sign-in
- Protected routes for dashboard, meal log, and profile
- Profile and targeting
- Stores age, sex, height, weight, activity factor, goal type, allergens, and dietary preferences
- Computes calorie and macro targets using Mifflin-St Jeor + activity factor + goal pace
- Meal logging
- Add daily meal entries with calories/protein/carbs/fat
- View per-day totals and entry history
- Product and ingredient analysis
- Barcode lookup and product search via Open Food Facts
- OCR from ingredient label photos using Tesseract
- Rule-based ingredient risk checks (works without AI key)
- Optional Gemini-enhanced JSON analysis with confidence, flagged items, and alternatives

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (for local PostgreSQL)

## Environment Variables

Create `smartnutrianalyzer/.env` with these values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartnutrianalyzer"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

# Optional: Gemini-powered ingredient analysis
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.0-flash"

# Optional: currently OCR is local via Tesseract.js
OCR_PROVIDER="tesseract"

# Optional: footer secret link target
NEXT_PUBLIC_GITHUB_URL="https://github.com/Agarwalkanishk/smartnutrianalyzer"
```

Notes:

- `GEMINI_API_KEY` is optional. If missing, ingredient analysis falls back to deterministic rule checks.
- `NEXTAUTH_SECRET` is required for stable auth sessions.

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Start PostgreSQL (Docker)

```bash
docker compose up -d
```

3. Generate Prisma client

```bash
npm run prisma:generate
```

4. Run migrations

```bash
npm run prisma:migrate
```

5. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run test` - run Vitest once
- `npm run test:watch` - run Vitest in watch mode
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - apply dev migrations
- `npm run prisma:studio` - open Prisma Studio

## API Overview

- `POST /api/auth/register` - register account
- `GET|PUT /api/profile` - read/update profile
- `GET|POST /api/meals` - list/create meal entries by date
- `POST /api/ocr` - OCR text extraction from image upload
- `POST /api/analyze/ingredients` - risk analysis for ingredient text
- `GET /api/products/search` - product search
- `GET /api/products/barcode/[code]` - barcode product lookup
- `GET /api/products/india-list` - curated starter list

## Data Model (High Level)

Main Prisma models:

- `User`, `Account`, `Session`, `VerificationToken`
- `Profile`
- `MealEntry`
- `Product`
- `IngredientAnalysis` (cache for analyzed ingredient text)

## Testing and Quality

```bash
npm run test
npm run lint
```

If lint reports pre-existing `no-explicit-any` errors, they are existing codebase issues and not necessarily tied to your current change.

## Troubleshooting

- Port already in use:
- If `3000` is busy, Next.js starts on `3001`.
- Database connection issues:
- Confirm Docker is running and `docker compose up -d` completed.
- Auth redirect/session issues:
- Verify `NEXTAUTH_URL` and `NEXTAUTH_SECRET` in `.env`.
- Gemini analysis unavailable:
- Ensure `GEMINI_API_KEY` is set; otherwise rule-based fallback is used.

## Disclaimer

This application is for educational and informational use only and is not medical advice.
