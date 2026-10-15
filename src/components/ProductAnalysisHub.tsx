"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type ProductHit = {
  barcode: string | null;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  ingredientsText: string | null;
};

type BarcodeResponse = {
  product?: ProductHit | null;
  error?: string;
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
      ringClassName: "border-[#FF6B00]",
      bgClassName: "bg-[#151515]",
      textClassName: "text-white",
    };
  }

  if (/whole truth/.test(lower)) {
    return {
      label: "The Whole Truth",
      shortLabel: "TW",
      logoSrc: "/brands/the-whole-truth.svg",
      ringClassName: "border-[#FF6B00]",
      bgClassName: "bg-[#151515]",
      textClassName: "text-white",
    };
  }

  if (/superyou/.test(lower)) {
    return {
      label: "SuperYou",
      shortLabel: "SY",
      logoSrc: "/brands/superyou.svg",
      ringClassName: "border-[#FF6B00]",
      bgClassName: "bg-[#151515]",
      textClassName: "text-white",
    };
  }

  if (/farmley/.test(lower)) {
    return {
      label: "Farmley",
      shortLabel: "FA",
      logoSrc: "/brands/farmley.png",
      ringClassName: "border-[#FF6B00]",
      bgClassName: "bg-[#151515]",
      textClassName: "text-white",
    };
  }

  if (/slurrp farm/.test(lower)) {
    return {
      label: "Slurrp Farm",
      shortLabel: "SF",
      logoSrc: "/brands/slurrp-farm.svg",
      ringClassName: "border-[#FF6B00]",
      bgClassName: "bg-[#151515]",
      textClassName: "text-white",
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

function webSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function ProductAnalysisHub() {
  const [mode, setMode] = useState<"barcode" | "search" | "photo" | "manual" | "none">("none");

  // Barcode & Camera State
  const [barcode, setBarcode] = useState("");
  const [barcodeResult, setBarcodeResult] = useState<BarcodeResponse | null>(null);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraState, setCameraState] = useState<"idle" | "requesting" | "active" | "denied" | "unsecure">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Search State
  const [q, setQ] = useState("");
  const [searchHits, setSearchHits] = useState<ProductHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Photo / OCR State
  const [photoText, setPhotoText] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Manual / Catalog State
  const [manual, setManual] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [exampleFilter, setExampleFilter] = useState<"all" | "unhealthy" | "moderate" | "healthy">("all");

  // Analysis Result State
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IngredientAnalysis | null>(null);
  const [selectedProductName, setSelectedProductName] = useState("");

  // Load sample catalog products on mount
  useEffect(() => {
    (async () => {
      setCatalogLoading(true);
      setCatalogError(null);
      const res = await fetch("/api/products/india-list");
      const data = await res.json().catch(() => null);
      setCatalogLoading(false);
      if (res.ok && Array.isArray(data?.products)) {
        setCatalogProducts(data.products);
      }
    })();
  }, []);

  // Clean up camera stream
  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setCameraActive(false);
    setCameraState("idle");
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaStream]);

  // Safely bind stream to video element when mounted in DOM
  useEffect(() => {
    if (!mediaStream) return;
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [mediaStream, cameraActive]);

  // Live Barcode Frame Detector
  useEffect(() => {
    if (!cameraActive || !mediaStream) return;

    let animId: number;
    let detector: unknown = null;

    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        detector = new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (el: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector({
          formats: ["qr_code", "ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"],
        });
      } catch {
        // Fallback if specific formats unsupported
      }
    }

    const detectFrame = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && detector) {
        try {
          const barcodes = await (detector as { detect: (el: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> }).detect(videoRef.current);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            const detectedCode = barcodes[0].rawValue;
            setBarcode(detectedCode);
            stopCamera();
            void lookupBarcode(detectedCode);
            return;
          }
        } catch {
          // Ignore single-frame detection hiccups
        }
      }
      animId = requestAnimationFrame(detectFrame);
    };

    if (detector) {
      animId = requestAnimationFrame(detectFrame);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive, mediaStream]);

  // Start Barcode Camera Scanner
  async function startBarcodeCamera() {
    stopCamera();
    setCameraError(null);
    setCameraState("requesting");
    setMode("barcode");

    const isLocalhost =
      typeof window !== "undefined" &&
      (location.hostname === "localhost" || location.hostname === "127.0.0.1");

    if (typeof window !== "undefined" && !window.isSecureContext && !isLocalhost) {
      setCameraState("unsecure");
      setCameraError(
        "Live camera streaming requires HTTPS or localhost on mobile browsers. To test live camera locally on mobile: (1) Use an HTTPS proxy/tunnel (e.g., ngrok or cloudflared), or (2) In Chrome mobile, set chrome://flags/#unsafely-treat-insecure-origin-as-secure to 'http://192.168.29.176:3000'. Alternatively, use 'Upload Barcode Photo' or manual entry below."
      );
      return;
    }

    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API (getUserMedia) not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setMediaStream(stream);
      setCameraActive(true);
      setCameraState("active");
    } catch (err: unknown) {
      setCameraState("denied");
      const errName = err instanceof Error ? err.name : "";
      if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera access in browser settings.");
      } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        setCameraError("No camera device was detected on this device.");
      } else {
        setCameraError(
          err instanceof Error
            ? `Camera error: ${err.message}`
            : "Camera access isn't available or was denied by the browser."
        );
      }
    }
  }

  async function handleBarcodeImageUpload(file: File) {
    setBarcodeLoading(true);
    setBarcodeError(null);
    setBarcodeResult(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/ocr", { method: "POST", body: form });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.text) {
        const match = String(data.text).match(/\b\d{8,14}\b/);
        if (match) {
          const extractedCode = match[0];
          setBarcode(extractedCode);
          setBarcodeLoading(false);
          void lookupBarcode(extractedCode);
          return;
        }
      }

      setBarcodeLoading(false);
      setBarcodeError("Could not extract a numeric barcode from the image. Please enter barcode numbers manually.");
    } catch {
      setBarcodeLoading(false);
      setBarcodeError("Image processing failed. Please enter barcode numbers manually.");
    }
  }

  const ingredientsText = useMemo(() => {
    if (barcodeResult?.product?.ingredientsText)
      return String(barcodeResult.product.ingredientsText);
    if (photoText.trim()) return photoText.trim();
    if (manual.trim()) return manual.trim();
    return "";
  }, [barcodeResult, manual, photoText]);

  async function runProductSearch(query: string) {
    const clean = query.trim();
    if (!clean) return;
    setSearchLoading(true);
    setSearchError(null);
    const res = await fetch(
      `/api/products/search?q=${encodeURIComponent(clean)}`,
    );
    const data = await res.json().catch(() => null);
    setSearchLoading(false);
    if (!res.ok) {
      setSearchError(data?.error ?? "Search failed.");
      return;
    }
    setSearchHits(data.products ?? []);
  }

  async function runOcrForFile(file: File) {
    setPhotoLoading(true);
    setPhotoError(null);
    setPhotoText("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/ocr", { method: "POST", body: form });
    const data = await res.json().catch(() => null);
    setPhotoLoading(false);
    if (!res.ok) {
      setPhotoError(data?.error ?? "OCR label parsing failed.");
      return;
    }
    setPhotoText(data?.text ?? "");
    setMode("photo");
  }

  async function runIngredientAnalysis(textToAnalyze?: string, name?: string) {
    const text = textToAnalyze || ingredientsText;
    if (!text.trim()) return;

    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis(null);

    const res = await fetch("/api/analyze/ingredients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ingredientsText: text,
        productName: name || selectedProductName || undefined,
      }),
    });
    const data = await res.json().catch(() => null);
    setAnalysisLoading(false);
    if (!res.ok) {
      setAnalysisError(data?.error ?? "Analysis failed.");
      return;
    }
    setAnalysis((data?.analysis as IngredientAnalysis | null) ?? null);
  }

  async function lookupBarcode(codeToLookup?: string) {
    const code = (codeToLookup || barcode).trim();
    if (!code) return;
    setBarcodeLoading(true);
    setBarcodeError(null);
    setBarcodeResult(null);
    setSelectedProductName("");

    const res = await fetch(`/api/products/barcode/${encodeURIComponent(code)}`);
    const data = await res.json().catch(() => null);
    setBarcodeLoading(false);

    if (!res.ok) {
      setBarcodeError(data?.error ?? "Product not found in OpenFoodFacts database.");
      return;
    }
    setBarcodeResult(data);
    const prodName = String(data?.product?.name ?? "").trim();
    setSelectedProductName(prodName);
    if (data?.product?.ingredientsText) {
      void runIngredientAnalysis(data.product.ingredientsText, prodName);
    }
  }

  const alternativeGroups = useMemo(
    () => groupAlternatives(analysis?.betterAlternatives ?? []),
    [analysis],
  );

  const filteredCatalogProducts = useMemo(() => {
    if (exampleFilter === "all") return catalogProducts;
    return catalogProducts.filter((p) => p.verdict === exampleFilter);
  }, [catalogProducts, exampleFilter]);

  return (
    <div className="grid gap-8">
      
      {/* 1. HERO SECTION */}
      <div className="border-b border-[#2A2A2A] pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">
          Analyze your food
        </h1>
        <p className="mt-2 text-base text-[#A0A0A0] leading-relaxed max-w-2xl">
          Scan a barcode, read a label, or check an ingredient list to see what's inside. Spot additives, high sodium, and clean alternatives in seconds.
        </p>
      </div>

      {/* 2. MAIN ANALYSIS OPTIONS (4 TILES 2x2 GRID) */}
      <div>
        <div className="text-xs font-mono text-[#A0A0A0] font-semibold mb-4">
          How would you like to analyze it?
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* TILE 1: SCAN BARCODE */}
          <div
            onClick={() => void startBarcodeCamera()}
            className={`rounded-xl border p-6 text-left transition-colors cursor-pointer flex flex-col justify-between ${
              mode === "barcode"
                ? "bg-[#111111] border-[#FF6B00]"
                : "bg-[#111111] border-[#2A2A2A] hover:border-[#FF6B00]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-2xl mb-3">
                <span className="font-mono text-[#FF6B00] tracking-widest font-bold">║▌║█║▌</span>
              </div>
              <h2 className="font-extrabold uppercase text-lg text-white tracking-wider">
                SCAN BARCODE
              </h2>
              <p className="mt-1 text-sm text-[#A0A0A0]">
                Scan a product barcode to quickly find its nutrition information.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
              <span className="text-xs font-mono font-bold text-[#FF6B00] uppercase tracking-wider">
                START SCANNING →
              </span>
            </div>
          </div>

          {/* TILE 2: SEARCH PRODUCT */}
          <div
            onClick={() => {
              stopCamera();
              setMode("search");
            }}
            className={`rounded-xl border p-6 text-left transition-colors cursor-pointer flex flex-col justify-between ${
              mode === "search"
                ? "bg-[#111111] border-[#FF6B00]"
                : "bg-[#111111] border-[#2A2A2A] hover:border-[#FF6B00]"
            }`}
          >
            <div>
              <div className="text-2xl mb-3">🔍</div>
              <h2 className="font-extrabold uppercase text-lg text-white tracking-wider">
                SEARCH PRODUCT
              </h2>
              <p className="mt-1 text-sm text-[#A0A0A0]">
                Search by product name or brand to view nutrition information.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
              <span className="text-xs font-mono font-bold text-[#FF6B00] uppercase tracking-wider">
                SEARCH PRODUCTS →
              </span>
            </div>
          </div>

          {/* TILE 3: SCAN FOOD LABEL */}
          <div
            onClick={() => {
              stopCamera();
              setMode("photo");
            }}
            className={`rounded-xl border p-6 text-left transition-colors cursor-pointer flex flex-col justify-between ${
              mode === "photo"
                ? "bg-[#111111] border-[#FF6B00]"
                : "bg-[#111111] border-[#2A2A2A] hover:border-[#FF6B00]"
            }`}
          >
            <div>
              <div className="text-2xl mb-3">📷</div>
              <h2 className="font-extrabold uppercase text-lg text-white tracking-wider">
                SCAN FOOD LABEL
              </h2>
              <p className="mt-1 text-sm text-[#A0A0A0]">
                Take a photo of a food label to read its ingredients and nutrition information.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
              <span className="text-xs font-mono font-bold text-[#FF6B00] uppercase tracking-wider">
                SCAN LABEL →
              </span>
            </div>
          </div>

          {/* TILE 4: CHECK INGREDIENTS */}
          <div
            onClick={() => {
              stopCamera();
              setMode("manual");
            }}
            className={`rounded-xl border p-6 text-left transition-colors cursor-pointer flex flex-col justify-between ${
              mode === "manual"
                ? "bg-[#111111] border-[#FF6B00]"
                : "bg-[#111111] border-[#2A2A2A] hover:border-[#FF6B00]"
            }`}
          >
            <div>
              <div className="text-2xl mb-3">📋</div>
              <h2 className="font-extrabold uppercase text-lg text-white tracking-wider">
                CHECK INGREDIENTS
              </h2>
              <p className="mt-1 text-sm text-[#A0A0A0]">
                Paste an ingredient list to see what's inside and identify ingredients worth watching.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
              <span className="text-xs font-mono font-bold text-[#FF6B00] uppercase tracking-wider">
                CHECK INGREDIENTS →
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. ACTIVE ANALYSIS WORKFLOW INTERFACE */}

      {/* BARCODE WORKFLOW */}
      {mode === "barcode" && (
        <div className="rounded-xl border border-[#FF6B00] bg-[#111111] p-6 grid gap-6">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <h2 className="font-bold text-white text-lg uppercase flex items-center gap-2">
              <span>║▌║█║▌</span> BARCODE SCANNER
            </h2>
            <button
              onClick={() => {
                stopCamera();
                setMode("none");
              }}
              className="text-xs font-mono text-[#A0A0A0] hover:text-white uppercase"
            >
              ✕ Close
            </button>
          </div>

          {/* Camera Controls & Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151515] p-3 rounded-lg border border-[#2A2A2A]">
            <div className="text-xs font-mono">
              <span className="text-[#A0A0A0]">CAMERA STATUS: </span>
              {cameraState === "active" ? (
                <span className="text-[#22C55E] font-bold">● ACTIVE — LIVE STREAMING</span>
              ) : cameraState === "requesting" ? (
                <span className="text-[#FF6B00] font-bold animate-pulse">● REQUESTING PERMISSION...</span>
              ) : cameraState === "unsecure" ? (
                <span className="text-[#FF2D2D] font-bold">● HTTPS REQUIRED ON LAN</span>
              ) : cameraState === "denied" ? (
                <span className="text-[#FF2D2D] font-bold">● PERMISSION DENIED</span>
              ) : (
                <span className="text-[#A0A0A0]">READY</span>
              )}
            </div>

            {!cameraActive && (
              <button
                type="button"
                onClick={() => void startBarcodeCamera()}
                className="px-3.5 py-1.5 rounded bg-[#FF6B00] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#E05E00] border border-[#FF6B00]"
              >
                📷 Launch Camera
              </button>
            )}
          </div>

          {cameraActive && !cameraError && (
            <div className="grid gap-4 justify-items-center">
              <div className="relative w-full max-w-lg h-[260px] overflow-hidden rounded-xl border border-[#FF6B00] bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Centered Scan Area Target */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-28 border-2 border-[#FF6B00] rounded-lg flex items-center justify-center bg-[#FF6B00]/10">
                    <span className="text-xs font-mono text-white font-bold bg-[#111111] px-2 py-1 rounded border border-[#FF6B00]">
                      POINT AT BARCODE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="rounded-lg border border-[#FF2D2D]/40 bg-[#151515] p-4 text-center text-xs text-[#FF2D2D] font-mono leading-relaxed">
              ⚠️ {cameraError}
            </div>
          )}

          {/* Manual & Image Upload Barcode Lookup */}
          <div className="grid gap-4 max-w-lg mx-auto w-full pt-2">
            <div className="grid gap-2">
              <label className="text-xs text-white font-mono uppercase">ENTER BARCODE NUMBER MANUALLY</label>
              <div className="flex gap-2">
                <input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g., 737628064502"
                  className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white font-mono placeholder-[#A0A0A0] focus:border-[#FF6B00] outline-none"
                />
                <button
                  disabled={barcodeLoading || !barcode.trim()}
                  onClick={() => void lookupBarcode()}
                  className="rounded-lg bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] disabled:opacity-50 border border-[#FF6B00]"
                >
                  {barcodeLoading ? "Searching..." : "Lookup"}
                </button>
              </div>
            </div>

            {/* Photo Upload Fallback */}
            <div className="pt-3 border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#A0A0A0]">Or upload barcode photo:</span>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#151515] px-4 py-2 text-xs font-bold text-white hover:border-[#FF6B00] uppercase tracking-wider">
                📁 Upload Barcode Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleBarcodeImageUpload(file);
                  }}
                />
              </label>
            </div>

            {barcodeError && (
              <div className="text-xs text-[#FF2D2D] font-mono">⚠️ {barcodeError}</div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH WORKFLOW */}
      {mode === "search" && (
        <div className="rounded-xl border border-[#FF6B00] bg-[#111111] p-6 grid gap-4">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <h2 className="font-bold text-white text-lg uppercase flex items-center gap-2">
              <span>🔍</span> SEARCH PACKAGED PRODUCTS
            </h2>
            <button
              onClick={() => setMode("none")}
              className="text-xs font-mono text-[#A0A0A0] hover:text-white uppercase"
            >
              ✕ Close
            </button>
          </div>

          <div className="flex gap-2 max-w-lg">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g., protein bar, dark chocolate, oats"
              className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white placeholder-[#A0A0A0] focus:border-[#FF6B00] outline-none"
            />
            <button
              disabled={searchLoading || !q.trim()}
              onClick={() => void runProductSearch(q)}
              className="rounded-lg bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] disabled:opacity-50 border border-[#FF6B00]"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>

          {searchError && (
            <div className="text-xs text-[#FF2D2D] font-mono">⚠️ {searchError}</div>
          )}

          {searchHits.length > 0 && (
            <ul className="grid gap-2 max-h-[320px] overflow-y-auto">
              {searchHits.map((p, idx) => (
                <li
                  key={`${p.barcode ?? p.name ?? "x"}-${idx}`}
                  className="rounded-lg border border-[#2A2A2A] bg-[#151515] p-3 text-sm flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">{p.name ?? "Unknown"}</div>
                    <div className="text-xs font-mono text-[#A0A0A0]">
                      {p.brand ?? "—"} {p.barcode ? `• Barcode: ${p.barcode}` : ""}
                    </div>
                  </div>
                  {p.ingredientsText ? (
                    <button
                      onClick={() => {
                        setSelectedProductName(p.name ?? "");
                        void runIngredientAnalysis(p.ingredientsText ?? "", p.name ?? "");
                      }}
                      className="rounded-lg bg-[#FF6B00] px-3 py-1.5 text-xs font-bold text-white uppercase hover:bg-[#E05E00]"
                    >
                      Analyze →
                    </button>
                  ) : p.barcode ? (
                    <button
                      onClick={() => void lookupBarcode(p.barcode ?? "")}
                      className="rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 text-xs font-bold text-white uppercase hover:border-[#FF6B00]"
                    >
                      Lookup Barcode →
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* SCAN LABEL WORKFLOW */}
      {mode === "photo" && (
        <div className="rounded-xl border border-[#FF6B00] bg-[#111111] p-6 grid gap-4">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <h2 className="font-bold text-white text-lg uppercase flex items-center gap-2">
              <span>📷</span> SCAN FOOD LABEL
            </h2>
            <button
              onClick={() => setMode("none")}
              className="text-xs font-mono text-[#A0A0A0] hover:text-white uppercase"
            >
              ✕ Close
            </button>
          </div>

          <p className="text-sm text-[#A0A0A0]">
            Upload or capture a photo of a food label to read its ingredients and nutrition information.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#151515] px-4 py-3 text-sm font-bold text-white hover:border-[#FF6B00] uppercase">
              📷 Use Camera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void runOcrForFile(file);
                }}
              />
            </label>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#151515] px-4 py-3 text-sm font-bold text-white hover:border-[#FF6B00] uppercase">
              📁 Upload Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void runOcrForFile(file);
                }}
              />
            </label>
          </div>

          {photoLoading && (
            <p className="text-xs text-[#FF6B00] font-mono animate-pulse">Reading label text...</p>
          )}

          {photoError && (
            <div className="text-xs text-[#FF2D2D] font-mono">⚠️ {photoError}</div>
          )}

          {photoText && (
            <div className="grid gap-3 mt-2">
              <label className="text-xs font-mono text-white uppercase">LABEL INGREDIENT TEXT</label>
              <textarea
                value={photoText}
                onChange={(e) => setPhotoText(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#FF6B00]"
              />
              <button
                disabled={analysisLoading || !photoText.trim()}
                onClick={() => void runIngredientAnalysis(photoText, "Scanned Label Product")}
                className="rounded-lg bg-[#FF6B00] border border-[#FF6B00] px-6 py-2.5 text-sm font-bold text-white uppercase hover:bg-[#E05E00] max-w-xs"
              >
                {analysisLoading ? "Checking..." : "Check Ingredients →"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* CHECK INGREDIENTS WORKFLOW */}
      {mode === "manual" && (
        <div className="rounded-xl border border-[#FF6B00] bg-[#111111] p-6 grid gap-4">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <h2 className="font-bold text-white text-lg uppercase flex items-center gap-2">
              <span>📋</span> CHECK INGREDIENTS LIST
            </h2>
            <button
              onClick={() => setMode("none")}
              className="text-xs font-mono text-[#A0A0A0] hover:text-white uppercase"
            >
              ✕ Close
            </button>
          </div>

          <textarea
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Paste full printed ingredients list (e.g., Whole Wheat Flour, Edible Vegetable Oil, Sugar, High Fructose Corn Syrup, E211, Salt)..."
            rows={8}
            className="w-full rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white font-mono placeholder-[#A0A0A0] focus:border-[#FF6B00] outline-none"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={analysisLoading || !manual.trim()}
              onClick={() => void runIngredientAnalysis(manual, "Custom Ingredients List")}
              className="rounded-lg bg-[#FF6B00] border border-[#FF6B00] px-6 py-3 text-sm font-bold text-white uppercase hover:bg-[#E05E00] disabled:opacity-50"
            >
              {analysisLoading ? "Checking Ingredients..." : "Check Ingredients →"}
            </button>
          </div>
        </div>
      )}

      {/* 4. DETAILED ANALYSIS RESULT VIEW */}
      {analysis && (
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 md:p-8 grid gap-6">
          
          {/* Header & Food Score */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#2A2A2A] pb-4">
            <div>
              <div className="text-xs font-mono text-[#A0A0A0] uppercase">PRODUCT EVALUATION</div>
              <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight mt-1">
                {selectedProductName || "Product Ingredients List"}
              </h2>
            </div>
            
            <div className="flex items-center gap-3 font-mono">
              <span className={`px-3 py-1 rounded border font-bold text-xs uppercase ${
                analysis.verdict === "unhealthy" || analysis.riskLevel === "high"
                  ? "border-[#FF2D2D] text-[#FF2D2D] bg-[#151515]"
                  : analysis.verdict === "moderate"
                  ? "border-[#FF6B00] text-[#FF6B00] bg-[#151515]"
                  : "border-white text-white bg-[#151515]"
              }`}>
                {analysis.verdict === "unhealthy"
                  ? "WORTH WATCHING"
                  : analysis.verdict === "moderate"
                  ? "MODERATE CHOICE"
                  : "GOOD CHOICE"}
              </span>
              <span className="text-sm text-white font-bold bg-[#151515] border border-[#2A2A2A] px-3 py-1 rounded">
                FOOD SCORE: <span className="text-[#FF6B00]">{analysis.score ?? 0}</span>/100
              </span>
            </div>
          </div>

          {/* High Level Summary */}
          <div className="rounded-lg border border-[#2A2A2A] bg-[#151515] p-4 text-white leading-relaxed text-sm">
            {analysis.summary}
          </div>

          {/* WHAT'S GOOD & WORTH WATCHING SECTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* WHAT'S GOOD */}
            <div className="rounded-lg border border-[#2A2A2A] bg-[#151515] p-4 grid gap-2">
              <div className="text-xs font-mono text-white uppercase font-bold flex items-center gap-1.5">
                <span>✓</span> WHAT'S GOOD
              </div>
              <ul className="text-xs text-[#A0A0A0] space-y-1.5 font-mono">
                {(!analysis.flagged || analysis.flagged.length === 0) ? (
                  <li className="text-white">✓ Zero high-risk synthetic preservatives flagged</li>
                ) : (
                  <li className="text-white">✓ Ingredient safety scan complete</li>
                )}
                {analysis.betterAlternatives && analysis.betterAlternatives.length > 0 && (
                  <li>✓ {analysis.betterAlternatives.length} cleaner alternatives available</li>
                )}
                <li>✓ Formulated without unlisted toxic compounds</li>
              </ul>
            </div>

            {/* WORTH WATCHING */}
            <div className="rounded-lg border border-[#2A2A2A] bg-[#151515] p-4 grid gap-2">
              <div className="text-xs font-mono text-[#FF2D2D] uppercase font-bold flex items-center gap-1.5">
                <span>⚠</span> WORTH WATCHING
              </div>
              {Array.isArray(analysis.flagged) && analysis.flagged.length ? (
                <ul className="text-xs text-[#A0A0A0] space-y-1.5 font-mono">
                  {analysis.flagged.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-[#FF2D2D] font-bold">
                      ! {f.ingredient} ({f.category})
                    </li>
                  ))}
                  {analysis.flagged.length > 3 && (
                    <li className="text-[#A0A0A0]">+ {analysis.flagged.length - 3} more ingredients to watch</li>
                  )}
                </ul>
              ) : (
                <div className="text-xs font-mono text-white">
                  ✓ No high-risk ingredient concerns detected in this list.
                </div>
              )}
            </div>

          </div>

          {/* Flagged Ingredients Detail List */}
          {Array.isArray(analysis.flagged) && analysis.flagged.length > 0 && (
            <div className="grid gap-3">
              <div className="text-xs font-mono text-[#FF2D2D] uppercase font-bold">
                DETAILED INGREDIENT CONCERNS ({analysis.flagged.length})
              </div>
              <div className="grid gap-2">
                {analysis.flagged.map((f, idx) => (
                  <div
                    key={`${f.ingredient}-${idx}`}
                    className="rounded-lg border border-[#FF2D2D] bg-[#151515] p-4 grid gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#FF2D2D] text-sm">⚠️ {f.ingredient}</span>
                      <span className="text-xs font-mono text-[#A0A0A0]">{f.category} • {f.severity.toUpperCase()} RISK</span>
                    </div>
                    <p className="text-xs text-white mt-1 leading-relaxed">{f.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cleaner Alternatives Section */}
          {Array.isArray(analysis.betterAlternatives) && analysis.betterAlternatives.length > 0 && (
            <div className="rounded-lg border border-[#FF6B00] bg-[#151515] p-5 grid gap-3">
              <div className="text-xs font-mono text-[#FF6B00] uppercase font-bold">
                CLEANER RECOMMENDED ALTERNATIVES
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alternativeGroups.branded.concat(alternativeGroups.everyday).map((alt, idx) => {
                  const item = splitAlternativeText(alt);
                  return (
                    <li key={`${alt}-${idx}`} className="rounded-lg border border-[#2A2A2A] bg-[#111111] p-3 text-sm flex items-center justify-between">
                      <div>
                        {item.subtitle && <div className="text-xs font-mono text-[#A0A0A0]">{item.subtitle}</div>}
                        <div className="font-bold text-white">{item.title}</div>
                      </div>
                      <a
                        href={webSearchUrl(alt)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#FF6B00] hover:underline"
                      >
                        Search →
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 5. TRY AN EXAMPLE / POPULAR PRODUCTS SECTION */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A] pb-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Example products
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setExampleFilter("all")}
              className={`px-3 py-1.5 rounded-lg border font-bold uppercase transition-colors ${
                exampleFilter === "all"
                  ? "border-[#FF6B00] bg-[#FF6B00] text-white"
                  : "border-[#2A2A2A] bg-[#151515] text-[#A0A0A0] hover:text-white hover:border-[#FF6B00]"
              }`}
            >
              ALL ({catalogProducts.length})
            </button>
            <button
              onClick={() => setExampleFilter("unhealthy")}
              className={`px-3 py-1.5 rounded-lg border font-bold uppercase transition-colors ${
                exampleFilter === "unhealthy"
                  ? "border-[#FF2D2D] bg-[#FF2D2D] text-white"
                  : "border-[#2A2A2A] bg-[#151515] text-[#A0A0A0] hover:text-white hover:border-[#FF2D2D]"
              }`}
            >
              HIGH CONCERN ({catalogProducts.filter((p) => p.verdict === "unhealthy").length})
            </button>
            <button
              onClick={() => setExampleFilter("moderate")}
              className={`px-3 py-1.5 rounded-lg border font-bold uppercase transition-colors ${
                exampleFilter === "moderate"
                  ? "border-[#FF6B00] bg-[#FF6B00] text-white"
                  : "border-[#2A2A2A] bg-[#151515] text-[#A0A0A0] hover:text-white hover:border-[#FF6B00]"
              }`}
            >
              MODERATE ({catalogProducts.filter((p) => p.verdict === "moderate").length})
            </button>
            {catalogProducts.some((p) => p.verdict === "healthy") && (
              <button
                onClick={() => setExampleFilter("healthy")}
                className={`px-3 py-1.5 rounded-lg border font-bold uppercase transition-colors ${
                  exampleFilter === "healthy"
                    ? "border-white bg-white text-black"
                    : "border-[#2A2A2A] bg-[#151515] text-[#A0A0A0] hover:text-white hover:border-white"
                }`}
              >
                HEALTHIER ({catalogProducts.filter((p) => p.verdict === "healthy").length})
              </button>
            )}
          </div>
        </div>

        {catalogLoading ? (
          <p className="text-xs text-[#A0A0A0] font-mono animate-pulse">Loading sample catalog...</p>
        ) : filteredCatalogProducts.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCatalogProducts.map((p, idx) => {
              const isHighRisk = p.verdict === "unhealthy";
              const isModerate = p.verdict === "moderate";
              const statusDotClass = isHighRisk
                ? "text-[#FF2D2D]"
                : isModerate
                ? "text-[#FF6B00]"
                : "text-white";

              return (
                <div
                  key={`${p.name}-${idx}`}
                  onClick={() => {
                    setManual(p.ingredientsText);
                    setSelectedProductName(p.name);
                    setMode("manual");
                    void runIngredientAnalysis(p.ingredientsText, p.name);
                  }}
                  className="group rounded-xl border border-[#2A2A2A] bg-[#111111] hover:border-[#FF6B00] p-4 cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-white text-base truncate group-hover:text-[#FF6B00] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs font-mono text-[#A0A0A0] truncate mt-0.5">
                      {p.brand.replace(/^Sample\s+/i, "")} • {p.category.replace("_", " ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        {p.score}/100
                      </div>
                      <div className={`text-[10px] font-mono font-bold uppercase flex items-center justify-end gap-1 ${statusDotClass}`}>
                        <span>●</span> {p.verdict}
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#FF6B00] group-hover:translate-x-0.5 transition-transform uppercase border border-[#FF6B00]/40 group-hover:border-[#FF6B00] px-2.5 py-1 rounded bg-[#151515]">
                      Analyze →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs font-mono text-[#A0A0A0] bg-[#111111] p-4 rounded-xl border border-[#2A2A2A]">
            No products match the selected filter.
          </div>
        )}
      </div>

    </div>
  );
}
