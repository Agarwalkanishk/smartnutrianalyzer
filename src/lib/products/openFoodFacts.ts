export type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  image_url?: string;
};

type OffProductResponse = {
  status?: number;
  product?: OffProduct;
};

type OffSearchResponse = {
  products?: OffProduct[];
};

export async function offFetchByBarcode(barcode: string) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    barcode,
  )}.json`;
  const res = await fetch(url, {
    headers: { "user-agent": "SmartNutriAnalyzer/0.1" },
    cache: "no-store",
  });
  if (!res.ok) return { ok: false as const, status: res.status };
  const json = (await res.json().catch(() => null)) as OffProductResponse | null;
  if (!json || json.status !== 1 || !json.product) {
    return { ok: false as const, status: 404 };
  }
  return { ok: true as const, product: json.product, raw: json };
}

export async function offSearch(query: string, page = 1, pageSize = 10) {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      query,
    )}` +
    `&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}`;
  const res = await fetch(url, {
    headers: { "user-agent": "SmartNutriAnalyzer/0.1" },
    cache: "no-store",
  });
  if (!res.ok) return { ok: false as const, status: res.status };
  const json = (await res.json().catch(() => null)) as OffSearchResponse | null;
  const products = (json?.products ?? []) as OffProduct[];
  return { ok: true as const, products, raw: json };
}

