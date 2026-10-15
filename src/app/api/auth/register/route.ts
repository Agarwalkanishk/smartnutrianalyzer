import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const email = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name?.trim() || undefined,
        email,
        passwordHash,
        profile: { create: {} },
      },
      select: { id: true, email: true },
    });

    return Response.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    console.error("Account registration failed", error);
    return Response.json(
      { error: "Could not create account. Check that the database is running." },
      { status: 503 },
    );
  }
}

