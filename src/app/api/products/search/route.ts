import { z } from "zod";
import { offSearch } from "@/lib/products/openFoodFacts";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const page = Number(url.searchParams.get("page") ?? "1");

  const parsed = z
    .object({
      q: z.string().min(1).max(120),
      page: z.number().int().min(1).max(50),
    })
    .safeParse({ q, page: Number.isFinite(page) ? page : 1 });

  if (!parsed.success) {
    return Response.json({ ok: true, products: [] });
  }

  const res = await offSearch(parsed.data.q, parsed.data.page, 12);
  if (!res.ok) {
    return Response.json({
      ok: true,
      products: [],
      degraded: true,
      message:
        "Live product search provider is temporarily unavailable. Try again, use barcode lookup, or use India product list.",
      status: res.status,
    });
  }

  const products = res.products
    .map((p) => ({
      barcode: p.code ?? null,
      name: p.product_name ?? null,
      brand: p.brands ?? null,
      imageUrl: p.image_url ?? null,
      ingredientsText: p.ingredients_text ?? null,
    }))
    .filter((p) => p.barcode || p.name);

  return Response.json({ ok: true, products });
}

