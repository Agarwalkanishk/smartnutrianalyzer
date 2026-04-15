import { listIndianCatalogProducts } from "@/lib/products/indiaCatalog";

export async function GET() {
  const products = listIndianCatalogProducts();
  return Response.json({ ok: true, products });
}
