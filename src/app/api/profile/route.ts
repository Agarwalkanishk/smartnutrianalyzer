import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { z } from "zod";

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return Response.json({ ok: true, profile: null });
  }

  return Response.json({
    ok: true,
    profile: {
      ...profile,
      dietaryPrefs: parseJsonArray(profile.dietaryPrefs),
      allergens: parseJsonArray(profile.allergens),
      conditions: parseJsonArray(profile.conditions),
    },
  });
}

const updateSchema = z.object({
  age: z.number().int().min(5).max(120).nullable().optional(),
  sex: z.string().nullable().optional(),
  heightCm: z.number().min(50).max(260).nullable().optional(),
  weightKg: z.number().min(20).max(400).nullable().optional(),
  activityFactor: z.number().min(1.1).max(2.5).nullable().optional(),
  goalType: z.string().nullable().optional(),
  paceKgPerWeek: z.number().min(0).max(5).nullable().optional(),
  dietaryPrefs: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
});

export async function PUT(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const dataToSave = {
    ...parsed.data,
    dietaryPrefs: JSON.stringify(parsed.data.dietaryPrefs ?? []),
    allergens: JSON.stringify(parsed.data.allergens ?? []),
    conditions: JSON.stringify(parsed.data.conditions ?? []),
  };

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...dataToSave },
    update: { ...dataToSave },
  });

  return Response.json({
    ok: true,
    profile: {
      ...profile,
      dietaryPrefs: parseJsonArray(profile.dietaryPrefs),
      allergens: parseJsonArray(profile.allergens),
      conditions: parseJsonArray(profile.conditions),
    },
  });
}
