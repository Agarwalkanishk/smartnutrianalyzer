# SmartNutriAnalyzer

SmartNutriAnalyzer is a full-stack nutrition assistant built with Next.js. It helps users:

- create an account and maintain a personal health profile
- compute daily calorie and macro targets from profile inputs
- log meals manually or estimate nutrition from meal photos using Gemini vision
- analyze packaged-food ingredient lists and barcodes for potential health concerns
- get safer alternatives using rule-based checks and optional Gemini analysis
- play a 2D food sorting mini-game on the sign-in page

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- NextAuth (credentials provider)
- Prisma (SQLite for local dev, PostgreSQL for production)
- Zod validation
- Tesseract.js OCR
- Gemini API (optional, for meal photo estimation and deeper ingredient analysis)

## Project Location

Run commands from:

```bash
smartnutrianalyzer/
```

(The repository root contains an outer folder; the application itself is inside `smartnutrianalyzer/`.)

## Features

- **Authentication**
  - Email/password sign-up and sign-in
  - "Sort Your Food" interactive 2D mini-game on the sign-in screen
  - Protected routes for dashboard, meal log, product analysis, and profile

- **Profile and targeting**
  - Stores age, sex, height, weight, activity factor, goal type, allergens, and dietary preferences
  - Computes calorie and macro targets using Mifflin-St Jeor + activity factor + goal pace

- **Meal logging**
  - Add daily meal entries with calories, protein, carbs, and fat
  - View per-day totals, macro breakdown, and entry history
  - Meal photo estimation: upload a meal picture to get estimated portions, calories, and macros via Gemini vision

- **Product and ingredient analysis**
  - Barcode lookup via Open Food Facts and camera scanning (using browser BarcodeDetector API)
  - OCR from ingredient label photos using Tesseract.js
  - Rule-based ingredient risk checks (works offline without an AI key)
  - Optional Gemini-enhanced analysis with confidence scores, flagged items, and cleaner brand alternatives

## Prerequisites

- Node.js 20+
- npm 10+
- SQLite (included by default) or PostgreSQL 16+ (local install, hosted, or Docker)

## Environment Variables

Create `smartnutrianalyzer/.env` with these values:

```env
# Database: SQLite for local dev, or PostgreSQL
DATABASE_URL="file:./dev.db"
# For PostgreSQL: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartnutrianalyzer"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

# Optional: Gemini-powered meal photo estimation and ingredient analysis
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.0-flash"

# Optional: local OCR via Tesseract.js
OCR_PROVIDER="tesseract"

# Optional: footer repo link
NEXT_PUBLIC_GITHUB_URL="https://github.com/Agarwalkanishk/smartnutrianalyzer"
```

Notes:
- `GEMINI_API_KEY` is optional. If omitted, ingredient analysis uses the deterministic rule engine.
- `NEXTAUTH_SECRET` is required for auth sessions.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

3. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`.

To test on your mobile device over local Wi-Fi:
```bash
npm run dev -- --hostname 0.0.0.0
```
Then open `http://<YOUR_LOCAL_IP>:3000` on your phone.

## Deployment

1. Use a hosted PostgreSQL database (Neon, Supabase, Railway, Render, or Vercel Postgres).
2. Set the deployment root directory to `smartnutrianalyzer`.
3. Add these required environment variables:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/smartnutrianalyzer?schema=public"
   NEXTAUTH_URL="https://your-deployed-domain.example"
   NEXTAUTH_SECRET="generate-a-long-random-secret"
   ```
4. Optional environment variables:
   ```env
   GEMINI_API_KEY=""
   GEMINI_MODEL="gemini-2.0-flash"
   OCR_PROVIDER="tesseract"
   NEXT_PUBLIC_GITHUB_URL="https://github.com/Agarwalkanishk/smartnutrianalyzer"
   ```

Recommended build and start commands:
```bash
npm install
npm run prisma:deploy
npm run build
npm run start
```

For Vercel:
- Root Directory: `smartnutrianalyzer`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: default

After the first deployment, run `npm run prisma:deploy` once against the production database to apply migrations.

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run test` - run Vitest once
- `npm run test:watch` - run Vitest in watch mode
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - apply dev migrations
- `npm run prisma:deploy` - apply production migrations
- `npm run prisma:studio` - open Prisma Studio

## API Overview

- `POST /api/auth/register` - register account
- `GET|PUT /api/profile` - read/update profile
- `GET|POST /api/meals` - list/create meal entries by date
- `POST /api/analyze/meal-photo` - estimate meal items and macros from photo
- `POST /api/ocr` - OCR text extraction from label photo
- `POST /api/analyze/ingredients` - risk analysis for ingredient text
- `GET /api/products/search` - product search
- `GET /api/products/barcode/[code]` - barcode product lookup
- `GET /api/products/india-list` - curated Indian packaged foods catalog

## Data Model (High Level)

Main Prisma models:
- `User`, `Account`, `Session`, `VerificationToken`
- `Profile`
- `MealEntry`
- `Product`
- `IngredientAnalysis` (cache for analyzed ingredient text)

## Testing

```bash
npm run test
npm run lint
```

## Troubleshooting

- **Port already in use**:
  If `3000` is busy, Next.js starts on `3001` (or specify `--port <PORT>`).
- **Live camera streaming on mobile**:
  Browsers require a secure context (HTTPS or `localhost`) for `getUserMedia`. When accessing via an unencrypted local IP (`http://192.168.x.x:3000`), use the "Upload Barcode Photo" option or configure an HTTPS tunnel (e.g. ngrok / cloudflared).
- **Database connection issues**:
  Confirm `DATABASE_URL` matches your database configuration in `prisma/schema.prisma`.
- **Auth redirect/session issues**:
  Verify `NEXTAUTH_URL` and `NEXTAUTH_SECRET` in `.env`.
- **Gemini analysis unavailable**:
  Ensure `GEMINI_API_KEY` is set in `.env`; otherwise the app falls back to rule-based analysis.

## Disclaimer

This application is for educational and informational use only and is not medical advice.
