import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { z } from "zod";

function dayBoundsUtc(ymd: string) {
  const start = new Date(`${ymd}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 1);
  return { start, end };
}

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const { start, end } = dayBoundsUtc(date);

  const entries = await prisma.mealEntry.findMany({
    where: { userId, eatenAt: { gte: start, lt: end } },
    orderBy: { eatenAt: "desc" },
  });

  const totals = entries.reduce(
    (acc, e) => {
      acc.calories += e.calories;
      acc.proteinG += e.proteinG;
      acc.carbsG += e.carbsG;
      acc.fatG += e.fatG;
      return acc;
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

  return Response.json({ ok: true, date, entries, totals });
}

const createSchema = z.object({
  eatenAt: z.string().datetime().optional(),
  label: z.string().min(1).max(120),
  calories: z.number().int().min(0).max(10000),
  proteinG: z.number().int().min(0).max(500).optional().default(0),
  carbsG: z.number().int().min(0).max(1000).optional().default(0),
  fatG: z.number().int().min(0).max(500).optional().default(0),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const entry = await prisma.mealEntry.create({
    data: {
      userId,
      eatenAt: parsed.data.eatenAt ? new Date(parsed.data.eatenAt) : new Date(),
      label: parsed.data.label,
      calories: parsed.data.calories,
      proteinG: parsed.data.proteinG,
      carbsG: parsed.data.carbsG,
      fatG: parsed.data.fatG,
    },
  });

  return Response.json({ ok: true, entry }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = auth ? await auth() : null;
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Meal ID is required" }, { status: 400 });

  const existing = await prisma.mealEntry.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return Response.json({ error: "Meal entry not found" }, { status: 404 });
  }

  await prisma.mealEntry.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}
