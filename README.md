SmartNutriAnalyzer is a web app for personalized calorie/macro targets, meal logging, and ingredient analysis (meals + packaged products).

## Getting Started

### 1) Install

```bash
npm install
```

### 2) Start Postgres (Docker)

```bash
docker compose up -d
```

### 3) Configure env

Copy `.env.example` to `.env` and adjust values.

### 4) Create DB tables (Prisma)

```bash
npm run prisma:migrate
```

### 5) Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
