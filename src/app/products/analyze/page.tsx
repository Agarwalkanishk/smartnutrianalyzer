"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ProductHit = {
  barcode: string | null;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  ingredientsText: string | null;
};

type CatalogProduct = {
  name: string;
  brand: string;
  category: string;
  ingredientsText: string;
  score: number;
  verdict: "healthy" | "moderate" | "unhealthy";
  flagged: Array<{
    ingredient: string;
    category: string;
    severity: "low" | "medium" | "high";
    reason: string;
  }>;
};

type IngredientAnalysis = {
  riskLevel: "low" | "medium" | "high";
  verdict: "healthy" | "moderate" | "unhealthy";
  score: number;
  confidence: number;
  summary: string;
  flagged: Array<{
    ingredient: string;
    category: string;
    severity: "low" | "medium" | "high";
    reason: string;
    alternatives?: string[];
  }>;
  betterAlternatives?: string[];
  disclaimers?: string[];
};

type BrandVisual = {
  label: string;
  shortLabel: string;
  logoSrc?: string;
  ringClassName: string;
  bgClassName: string;
  textClassName: string;
};

function getAlternativeBrand(alternative: string): BrandVisual | null {
  const lower = alternative.toLowerCase();

  if (/ritebite|max protein/.test(lower)) {
    return {
      label: "Max Protein",
      shortLabel: "MP",
      logoSrc: "/brands/max-protein.png",
      ringClassName: "border-sky-300 dark:border-sky-800",
      bgClassName: "bg-sky-100 dark:bg-sky-950/60",
      textClassName: "text-sky-800 dark:text-sky-200",
    };
  }

  if (/whole truth/.test(lower)) {
    return {
      label: "The Whole Truth",
      shortLabel: "TW",
      logoSrc: "/brands/the-whole-truth.svg",
      ringClassName: "border-amber-300 dark:border-amber-800",
      bgClassName: "bg-amber-100 dark:bg-amber-950/60",
      textClassName: "text-amber-800 dark:text-amber-200",
    };
  }

  if (/superyou/.test(lower)) {
    return {
      label: "SuperYou",
      shortLabel: "SY",
      logoSrc: "/brands/superyou.svg",
      ringClassName: "border-fuchsia-300 dark:border-fuchsia-800",
      bgClassName: "bg-fuchsia-100 dark:bg-fuchsia-950/60",
      textClassName: "text-fuchsia-800 dark:text-fuchsia-200",
    };
  }

  if (/farmley/.test(lower)) {
    return {
      label: "Farmley",
      shortLabel: "FA",
      logoSrc: "/brands/farmley.png",
      ringClassName: "border-lime-300 dark:border-lime-800",
      bgClassName: "bg-lime-100 dark:bg-lime-950/60",
      textClassName: "text-lime-800 dark:text-lime-200",
    };
  }

  if (/slurrp farm/.test(lower)) {
    return {
      label: "Slurrp Farm",
      shortLabel: "SF",
      logoSrc: "/brands/slurrp-farm.svg",
      ringClassName: "border-orange-300 dark:border-orange-800",
      bgClassName: "bg-orange-100 dark:bg-orange-950/60",
      textClassName: "text-orange-800 dark:text-orange-200",
    };
  }

  return null;
}

function splitAlternativeText(alternative: string) {
  const brand = getAlternativeBrand(alternative);
  if (!brand) {
    return { title: alternative, subtitle: null as string | null, brand };
  }

  const patterns = [
    new RegExp(`^${brand.label}\\s+`, "i"),
    /^RiteBite\s+/i,
  ];

  let title = alternative;
  for (const pattern of patterns) {
    title = title.replace(pattern, "");
  }

  return {
    title: title.trim() || alternative,
    subtitle: brand.label,
    brand,
  };
}

function groupAlternatives(alternatives: string[]) {
  return alternatives.reduce(
    (groups, alternative) => {
      const lower = alternative.toLowerCase();

      if (
        /ritebite|max protein|whole truth|superyou|farmley|slurrp farm/.test(lower)
      ) {
        groups.branded.push(alternative);
      } else if (
        /roasted|whole wheat|millet|chaas|buttermilk|coconut water|paneer|egg|home/.test(
          lower,
        )
      ) {
        groups.everyday.push(alternative);
      } else {
        groups.smartTips.push(alternative);
      }

      return groups;
    },
    {
      branded: [] as string[],
      everyday: [] as string[],
      smartTips: [] as string[],
    },
  );
}

export default function ProductAnalyzePage() {
  const [mode, setMode] = useState<
    "india-list" | "barcode" | "search" | "photo" | "manual"
  >("india-list");

  const [barcode, setBarcode] = useState("");
  const [barcodeResult, setBarcodeResult] = useState<any | null>(null);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  const [q, setQ] = useState("");
  const [searchHits, setSearchHits] = useState<ProductHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [photoText, setPhotoText] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [manual, setManual] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const ingredientsText = useMemo(() => {
    if (barcodeResult?.product?.ingredientsText)
      return String(barcodeResult.product.ingredientsText);
    if (photoText.trim()) return photoText.trim();
    if (manual.trim()) return manual.trim();
    return "";
  }, [barcodeResult, manual, photoText]);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IngredientAnalysis | null>(null);
  const [selectedProductName, setSelectedProductName] = useState("");
  const alternativeGroups = useMemo(
    () => groupAlternatives(analysis?.betterAlternatives ?? []),
    [analysis],
  );

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Analyze product
      </h1>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["india-list", "India product list"],
            ["barcode", "Barcode/UPC"],
            ["search", "Search"],
            ["photo", "Label photo (OCR)"],
            ["manual", "Paste ingredients"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setMode(k)}
            className={[
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              mode === k
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          {mode === "barcode" ? (
            <div className="grid gap-4">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Barcode lookup
              </h2>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Barcode / UPC</label>
                <input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g., 737628064502"
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
                />
              </div>
              {barcodeError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                  {barcodeError}
                </div>
              ) : null}
              <button
                disabled={barcodeLoading}
                className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                onClick={async () => {
                  setBarcodeLoading(true);
                  setBarcodeError(null);
                  setBarcodeResult(null);
                  setSelectedProductName("");
                  const code = barcode.trim();
                  const res = await fetch(
                    `/api/products/barcode/${encodeURIComponent(code)}`,
                  );
                  const data = await res.json().catch(() => null);
                  setBarcodeLoading(false);
                  if (!res.ok) {
                    setBarcodeError(data?.error ?? "Not found.");
                    return;
                  }
                  setBarcodeResult(data);
                  setSelectedProductName(String(data?.product?.name ?? "").trim());
                }}
              >
                {barcodeLoading ? "Looking up..." : "Lookup"}
              </button>

              {barcodeResult?.product ? (
                <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-black">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {barcodeResult.product.name ?? "Unknown product"}
                  </div>
                  {barcodeResult.product.brand ? (
                    <div className="text-zinc-600 dark:text-zinc-300">
                      {barcodeResult.product.brand}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {mode === "india-list" ? (
            <div className="grid gap-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  India starter product list
                </h2>
                <button
                  disabled={catalogLoading}
                  className="text-xs font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50 disabled:opacity-60"
                  onClick={async () => {
                    setCatalogLoading(true);
                    setCatalogError(null);
                    const res = await fetch("/api/products/india-list");
                    const data = await res.json().catch(() => null);
                    setCatalogLoading(false);
                    if (!res.ok) {
                      setCatalogError(data?.error ?? "Could not load products.");
                      return;
                    }
                    setCatalogProducts(data?.products ?? []);
                  }}
                >
                  {catalogLoading ? "Loading..." : "Load list"}
                </button>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Curated sample products for Indian market testing. Pick one to
                analyze and see why it was flagged.
              </p>
              {catalogError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                  {catalogError}
                </div>
              ) : null}
              {catalogProducts.length ? (
                <ul className="grid gap-2">
                  {catalogProducts.map((p, idx) => (
                    <li
                      key={`${p.name}-${idx}`}
                      className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">
                          {p.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {p.verdict} • Score {p.score}/100
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {p.brand} • {p.category}
                      </div>
                      <button
                        className="mt-2 text-xs font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
                        onClick={() => {
                          setManual(p.ingredientsText);
                          setSelectedProductName(p.name);
                          setMode("manual");
                        }}
                      >
                        Analyze this product
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {mode === "search" ? (
            <div className="grid gap-4">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Search products
              </h2>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Query</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g., protein bar"
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
                />
              </div>
              {searchError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                  {searchError}
                </div>
              ) : null}
              <button
                disabled={searchLoading}
                className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                onClick={async () => {
                  setSearchLoading(true);
                  setSearchError(null);
                  const res = await fetch(
                    `/api/products/search?q=${encodeURIComponent(q.trim())}`,
                  );
                  const data = await res.json().catch(() => null);
                  setSearchLoading(false);
                  if (!res.ok) {
                    setSearchError(data?.error ?? "Search failed.");
                    return;
                  }
                  if (data?.degraded) {
                    setSearchError(
                      data?.message ??
                        "Live provider unavailable right now. Try again shortly.",
                    );
                  }
                  setSearchHits(data.products ?? []);
                }}
              >
                {searchLoading ? "Searching..." : "Search"}
              </button>

              {searchHits.length ? (
                <ul className="mt-2 grid gap-2">
                  {searchHits.map((p, idx) => (
                    <li
                      key={`${p.barcode ?? p.name ?? "x"}-${idx}`}
                      className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {p.name ?? "Unknown"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {p.brand ?? "—"} {p.barcode ? `• ${p.barcode}` : ""}
                      </div>
                      {p.barcode ? (
                        <button
                          className="mt-2 text-xs font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
                          onClick={async () => {
                            setMode("barcode");
                            setBarcode(p.barcode ?? "");
                          }}
                        >
                          Use this barcode
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {mode === "photo" ? (
            <div className="grid gap-4">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Label photo OCR
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Upload a clear photo of the ingredients label. The app will
                extract text you can analyze.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPhotoLoading(true);
                  setPhotoError(null);
                  setPhotoText("");
                  const form = new FormData();
                  form.append("file", file);
                  const res = await fetch("/api/ocr", { method: "POST", body: form });
                  const data = await res.json().catch(() => null);
                  setPhotoLoading(false);
                  if (!res.ok) {
                    setPhotoError(data?.error ?? "OCR failed.");
                    return;
                  }
                  setPhotoText(data?.text ?? "");
                }}
              />
              {photoError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                  {photoError}
                </div>
              ) : null}
              {photoLoading ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Running OCR...
                </p>
              ) : null}
            </div>
          ) : null}

          {mode === "manual" ? (
            <div className="grid gap-4">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Paste ingredients
              </h2>
              <textarea
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="Paste the full ingredients list here…"
                rows={10}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
              />
              <p className="text-xs text-zinc-500">
                Tip: include the full list as printed, including parentheses.
              </p>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Ingredients text
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            This is what we’ll analyze for harmful ingredients and alternatives.
          </p>
          <textarea
            value={ingredientsText}
            readOnly
            rows={12}
            className="mt-4 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              disabled={analysisLoading || !ingredientsText.trim()}
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              onClick={async () => {
                setAnalysisLoading(true);
                setAnalysisError(null);
                setAnalysis(null);
                const res = await fetch("/api/analyze/ingredients", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    ingredientsText,
                    productName: selectedProductName || undefined,
                  }),
                });
                const data = await res.json().catch(() => null);
                setAnalysisLoading(false);
                if (!res.ok) {
                  setAnalysisError(data?.error ?? "Analysis failed.");
                  return;
                }
                setAnalysis((data?.analysis as IngredientAnalysis | null) ?? null);
              }}
            >
              {analysisLoading ? "Analyzing..." : "Run ingredient analysis"}
            </button>
            <div className="text-xs text-zinc-500">
              If no AI key is configured, you’ll still get rule-based checks.
            </div>
          </div>

          {analysisError ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              {analysisError}
            </div>
          ) : null}

          {analysis ? (
            <div className="mt-6 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                  Result ({analysis.riskLevel}) • {analysis.verdict ?? "moderate"}
                </div>
                <div className="text-xs text-zinc-500">
                  Score: {analysis.score ?? 0}/100 • Confidence:{" "}
                  {Math.round((analysis.confidence ?? 0) * 100)}%
                </div>
              </div>
              <div className="text-zinc-700 dark:text-zinc-200">
                {analysis.summary}
              </div>
              <div className="grid gap-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20">
                <div className="grid gap-1">
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                    Better alternatives
                  </div>
                  <div className="text-lg font-semibold text-emerald-950 dark:text-emerald-50">
                    Try these instead
                  </div>
                </div>
                {Array.isArray(analysis.betterAlternatives) &&
                analysis.betterAlternatives.length ? (
                  <div className="grid gap-3">
                    {alternativeGroups.branded.length ? (
                      <div className="grid gap-2">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-200">
                          Branded picks
                        </div>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {alternativeGroups.branded.map((alt, idx) => (
                            <li
                              key={`${alt}-${idx}`}
                              className="rounded-xl border border-emerald-300 bg-white px-4 py-3 shadow-sm dark:border-emerald-900/40 dark:bg-zinc-950"
                            >
                              {(() => {
                                const item = splitAlternativeText(alt);
                                return (
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={[
                                        "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border text-sm font-bold tracking-wide",
                                        item.brand?.ringClassName ??
                                          "border-emerald-300 dark:border-emerald-800",
                                        item.brand?.bgClassName ??
                                          "bg-emerald-100 dark:bg-emerald-950/60",
                                        item.brand?.textClassName ??
                                          "text-emerald-800 dark:text-emerald-200",
                                      ].join(" ")}
                                    >
                                      {item.brand?.logoSrc ? (
                                        <Image
                                          src={item.brand.logoSrc}
                                          alt={`${item.brand.label} logo`}
                                          fill
                                          sizes="44px"
                                          className="object-contain p-1.5"
                                        />
                                      ) : (
                                        item.brand?.shortLabel ?? "ALT"
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      {item.subtitle ? (
                                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                                          {item.subtitle}
                                        </div>
                                      ) : null}
                                      <div className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                                        {item.title}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {alternativeGroups.everyday.length ? (
                      <div className="grid gap-2">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-200">
                          Everyday swaps
                        </div>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {alternativeGroups.everyday.map((alt, idx) => (
                            <li
                              key={`${alt}-${idx}`}
                              className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 dark:border-emerald-900/40 dark:bg-zinc-950 dark:text-zinc-100"
                            >
                              {alt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {alternativeGroups.smartTips.length ? (
                      <div className="grid gap-2">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-200">
                          Smart buying tips
                        </div>
                        <ul className="grid gap-2">
                          {alternativeGroups.smartTips.map((alt, idx) => (
                            <li
                              key={`${alt}-${idx}`}
                              className="rounded-lg border border-emerald-200/80 bg-white px-4 py-3 text-sm text-zinc-800 dark:border-emerald-900/40 dark:bg-zinc-950 dark:text-zinc-100"
                            >
                              {alt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-sm text-emerald-800 dark:text-emerald-200">
                    No specific swaps were suggested for this product yet.
                  </div>
                )}
              </div>
              {Array.isArray(analysis.flagged) && analysis.flagged.length ? (
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Flagged items
                  </div>
                  <ul className="grid gap-2">
                    {analysis.flagged.slice(0, 20).map((f, idx: number) => (
                      <li
                        key={`${f.ingredient ?? "x"}-${idx}`}
                        className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-black"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                          <div className="font-medium text-zinc-900 dark:text-zinc-50">
                            {f.ingredient}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {f.category} • {f.severity}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                          {f.reason}
                        </div>
                        {Array.isArray(f.alternatives) && f.alternatives.length ? (
                          <div className="mt-2 text-xs text-zinc-500">
                            Alternatives: {f.alternatives.join(", ")}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-sm text-zinc-600 dark:text-zinc-300">
                  No flagged ingredients found.
                </div>
              )}
              {Array.isArray(analysis.disclaimers) && analysis.disclaimers.length ? (
                <div className="text-xs text-zinc-500">
                  {analysis.disclaimers.join(" ")}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

