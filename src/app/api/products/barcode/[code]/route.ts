import { prisma } from "@/db/prisma";
import { offFetchByBarcode } from "@/lib/products/openFoodFacts";
import { z } from "zod";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const parsed = z.string().min(6).max(32).safeParse(code);
  if (!parsed.success) {
    return Response.json({ error: "Invalid barcode" }, { status: 400 });
  }

  const barcode = parsed.data;
  const cached = await prisma.product.findUnique({ where: { barcode } });
  if (cached) return Response.json({ ok: true, product: cached, cached: true });

  const res = await offFetchByBarcode(barcode);
  if (!res.ok) {
    return Response.json(
      { error: "Not found", status: res.status },
      { status: 404 },
    );
  }

  const p = res.product;
  const product = await prisma.product.upsert({
    where: { barcode },
    create: {
      barcode,
      name: p.product_name ?? null,
      brand: p.brands ?? null,
      ingredientsText: p.ingredients_text ?? null,
      imageUrl: p.image_url ?? null,
      source: "openfoodfacts",
      raw: res.raw as any,
    },
    update: {
      name: p.product_name ?? null,
      brand: p.brands ?? null,
      ingredientsText: p.ingredients_text ?? null,
      imageUrl: p.image_url ?? null,
      raw: res.raw as any,
    },
  });

  return Response.json({ ok: true, product, cached: false });
}

