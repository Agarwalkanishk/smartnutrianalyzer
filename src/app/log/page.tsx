"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { computeTargets, type GoalType, type Sex } from "@/lib/nutrition/targets";

type MealEntry = {
  id: string;
  eatenAt: string;
  label: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

type Profile = {
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  activityFactor: number | null;
  goalType: GoalType | null;
  paceKgPerWeek: number | null;
};

type DetectedItem = {
  name: string;
  portionG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

type MealsResponse = {
  entries?: MealEntry[];
  totals?: { calories: number; proteinG: number; carbsG: number; fatG: number };
  error?: string;
};

type ProfileResponse = {
  profile?: Profile | null;
};

function todayYmdUtc() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateFormatted(ymd: string) {
  try {
    const [year, month, day] = ymd.split("-").map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return ymd;
  }
}

function getMealCategory(isoDate: string): { label: string; icon: string } {
  try {
    const d = new Date(isoDate);
    const hour = d.getUTCHours();
    if (hour >= 4 && hour < 11) return { label: "BREAKFAST", icon: "☀" };
    if (hour >= 11 && hour < 16) return { label: "LUNCH", icon: "🌤" };
    if (hour >= 16 && hour < 19) return { label: "SNACK", icon: "☕" };
    return { label: "DINNER", icon: "🌙" };
  } catch {
    return { label: "MEAL", icon: "🍽" };
  }
}

export default function LogMealPage() {
  const [date, setDate] = useState(todayYmdUtc());
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Input Mode state: 'idle' | 'camera' | 'upload' | 'review' | 'manual'
  const [mode, setMode] = useState<"idle" | "camera" | "upload" | "review" | "manual">("idle");

  // Camera & Image states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Analysis / Review state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDisclaimer, setAnalysisDisclaimer] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);

  // Manual Form State
  const [manualLabel, setManualLabel] = useState("");
  const [manualCalories, setManualCalories] = useState("");
  const [manualProteinG, setManualProteinG] = useState("");
  const [manualCarbsG, setManualCarbsG] = useState("");
  const [manualFatG, setManualFatG] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteMeal(id: string) {
    if (!confirm("Are you sure you want to delete this meal?")) return;
    setDeletingId(id);
    await fetch(`/api/meals?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setDeletingId(null);
    await loadData();
  }

  // Load profile and meals
  async function loadData() {
    setLoading(true);
    setError(null);
    const [pRes, mRes] = await Promise.all([
      fetch("/api/profile"),
      fetch(`/api/meals?date=${encodeURIComponent(date)}`),
    ]);
    const pData = (await pRes.json().catch(() => null)) as ProfileResponse | null;
    const mData = (await mRes.json().catch(() => null)) as MealsResponse | null;

    setProfile(pData?.profile ?? null);
    if (mRes.ok) {
      setEntries(mData?.entries ?? []);
    } else {
      setError(mData?.error ?? "Could not load meals.");
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Clean up media stream on unmount or mode change
  const stopCameraStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaStream]);

  // Start Camera
  async function startCamera() {
    stopCameraStream();
    setCameraError(null);
    setCapturedImage(null);
    setMode("camera");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      console.warn("Camera access failed", err);
      setCameraError(
        !window.isSecureContext && location.hostname !== "localhost" && location.hostname !== "127.0.0.1"
          ? "Live camera streaming requires HTTPS or localhost on mobile. Please use 'Upload a photo' below."
          : "Camera access isn't available or was denied by the browser."
      );
    }
  }

  // Capture canvas photo from stream
  function capturePhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCameraStream();
  }

  // Handle uploaded photo
  function handleFileUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCapturedImage(dataUrl);
      setMode("upload");
    };
    reader.readAsDataURL(file);
  }

  // Run Photo Meal Analysis API
  async function runPhotoAnalysis() {
    if (!capturedImage) return;
    setAnalyzing(true);
    setError(null);

    const res = await fetch("/api/analyze/meal-photo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ imageBase64: capturedImage }),
    });

    const data = await res.json().catch(() => null);
    setAnalyzing(false);

    if (data?.ok && Array.isArray(data.detectedItems)) {
      setDetectedItems(data.detectedItems);
      setAnalysisDisclaimer(data.disclaimer ?? "Nutrition values are estimated from the image. Review before logging.");
      setMode("review");
    } else {
      // Fallback review item if API encounters an error
      setDetectedItems([
        {
          name: "Meal Item",
          portionG: 150,
          calories: 300,
          proteinG: 15,
          carbsG: 35,
          fatG: 10,
        },
      ]);
      setAnalysisDisclaimer("Please review and edit estimated nutrition values before saving.");
      setMode("review");
    }
  }

  // Save Reviewed Meal Items to Database
  async function saveReviewedItems() {
    if (!detectedItems.length) return;
    setSaving(true);
    setError(null);

    for (const item of detectedItems) {
      if (!item.name.trim()) continue;
      const payload = {
        eatenAt: `${date}T12:00:00.000Z`,
        label: item.name.trim(),
        calories: Number(item.calories) || 0,
        proteinG: Number(item.proteinG) || 0,
        carbsG: Number(item.carbsG) || 0,
        fatG: Number(item.fatG) || 0,
      };

      await fetch("/api/meals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setCapturedImage(null);
    setDetectedItems([]);
    setMode("idle");
    await loadData();
  }

  // Save Manual Meal Entry
  async function saveManualEntry() {
    if (!manualLabel.trim()) return;
    setSaving(true);
    setError(null);

    const payload = {
      eatenAt: `${date}T12:00:00.000Z`,
      label: manualLabel.trim(),
      calories: Number(manualCalories) || 0,
      proteinG: Number(manualProteinG) || 0,
      carbsG: Number(manualCarbsG) || 0,
      fatG: Number(manualFatG) || 0,
    };

    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Could not save meal entry.");
      return;
    }

    setManualLabel("");
    setManualCalories("");
    setManualProteinG("");
    setManualCarbsG("");
    setManualFatG("");
    setMode("idle");
    await loadData();
  }

  // Calculated Totals & Target Computations
  const totals = useMemo(() => {
    return entries.reduce(
      (acc, e) => {
        acc.calories += e.calories ?? 0;
        acc.proteinG += e.proteinG ?? 0;
        acc.carbsG += e.carbsG ?? 0;
        acc.fatG += e.fatG ?? 0;
        return acc;
      },
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    );
  }, [entries]);

  const targets = useMemo(() => {
    if (!profile) return null;
    if (
      !profile.age ||
      !profile.sex ||
      !profile.heightCm ||
      !profile.weightKg ||
      !profile.activityFactor ||
      !profile.goalType
    ) {
      return null;
    }
    const res = computeTargets({
      ageYears: profile.age,
      sex: profile.sex,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      activityFactor: profile.activityFactor,
      goalType: profile.goalType,
      paceKgPerWeek:
        profile.goalType === "maintain" ? undefined : profile.paceKgPerWeek ?? 0.5,
    });
    return res.targets;
  }, [profile]);

  const targetCal = targets?.calories ?? 2000;
  const remainingCal = targetCal - totals.calories;
  const calPercent = Math.min(100, Math.round((totals.calories / Math.max(1, targetCal)) * 100));

  const proteinTarget = targets?.proteinG ?? 150;
  const proteinPercent = Math.min(100, Math.round((totals.proteinG / Math.max(1, proteinTarget)) * 100));

  const carbsTarget = targets?.carbsG ?? 250;
  const carbsPercent = Math.min(100, Math.round((totals.carbsG / Math.max(1, carbsTarget)) * 100));

  const fatTarget = targets?.fatG ?? 65;
  const fatPercent = Math.min(100, Math.round((totals.fatG / Math.max(1, fatTarget)) * 100));

  // Review Totals Sum
  const reviewTotals = useMemo(() => {
    return detectedItems.reduce(
      (acc, item) => {
        acc.calories += Number(item.calories) || 0;
        acc.proteinG += Number(item.proteinG) || 0;
        acc.carbsG += Number(item.carbsG) || 0;
        acc.fatG += Number(item.fatG) || 0;
        return acc;
      },
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    );
  }, [detectedItems]);

  return (
    <div className="grid gap-8">
      
      {/* PAGE HEADER & DATE SELECTOR */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            Log a meal
          </h1>
          <p className="mt-1 text-sm text-[#A0A0A0]">
            Take a photo, upload an image, or enter nutrition details manually.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-2.5">
          <div className="text-xs font-mono text-[#A0A0A0]">Logging for:</div>
          <div className="font-bold text-white text-sm font-mono">{formatDateFormatted(date)}</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded bg-[#151515] border border-[#2A2A2A] px-2 py-1 text-xs text-white outline-none cursor-pointer focus:border-[#FF6B00]"
          />
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKFLOW GRID */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* LEFT COLUMN: MEAL CAPTURE & ENTRY WORKFLOW (8 cols) */}
        <div className="lg:col-span-8 grid gap-8">
          
          {/* THREE PRIMARY ACTION CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. TAKE PHOTO */}
            <button
              onClick={() => void startCamera()}
              className="rounded-xl border border-[#FF6B00] bg-[#FF6B00] p-5 text-left text-white transition-colors flex flex-col justify-between hover:bg-[#E05E00]"
            >
              <div>
                <div className="font-bold text-base">Take a photo</div>
                <div className="mt-1 text-xs text-white/90">Capture your meal to estimate nutrition</div>
              </div>
              <div className="mt-4 text-xs font-mono font-bold tracking-wider">
                Launch camera →
              </div>
            </button>

            {/* 2. UPLOAD PHOTO */}
            <label
              className="rounded-xl border border-[#2A2A2A] bg-[#151515] p-5 text-left transition-colors flex flex-col justify-between cursor-pointer hover:border-[#FF6B00]"
            >
              <div>
                <div className="font-bold text-base text-white">Upload a photo</div>
                <div className="mt-1 text-xs text-[#A0A0A0]">Use an existing meal photo</div>
              </div>
              <div className="mt-4 text-xs font-mono font-bold text-[#FF6B00]">
                Select image →
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>

            {/* 3. MANUAL ENTRY */}
            <button
              onClick={() => {
                stopCameraStream();
                setCapturedImage(null);
                setMode("manual");
              }}
              className="rounded-xl border border-[#2A2A2A] bg-[#151515] p-5 text-left transition-colors flex flex-col justify-between hover:border-[#FF6B00]"
            >
              <div>
                <div className="font-bold text-base text-white">Enter manually</div>
                <div className="mt-1 text-xs text-[#A0A0A0]">Enter nutrition values yourself</div>
              </div>
              <div className="mt-4 text-xs font-mono font-bold text-[#FF6B00]">
                Open form →
              </div>
            </button>
          </div>

          {/* ACTIVE WORKFLOW DISPLAY PANEL */}

          {/* CAMERA WORKFLOW PANEL */}
          {mode === "camera" && (
            <div className="rounded-xl border border-[#FF6B00] bg-[#111111] p-6 grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-lg uppercase flex items-center gap-2">
                  <span>📷</span> LIVE CAMERA PREVIEW
                </h2>
                <button
                  onClick={() => {
                    stopCameraStream();
                    setMode("idle");
                  }}
                  className="text-xs font-mono text-[#A0A0A0] hover:text-white uppercase"
                >
                  ✕ Close Camera
                </button>
              </div>

              {cameraError ? (
                <div className="rounded-lg border border-[#FF2D2D] bg-[#151515] p-5 text-center grid gap-3">
                  <div className="text-sm text-[#FF2D2D] font-mono">⚠️ {cameraError}</div>
                  <div>
                    <label className="inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] cursor-pointer">
                      ↑ Upload Photo Instead
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              ) : capturedImage ? (
                <div className="grid gap-4">
                  <div className="relative w-full max-h-[360px] h-[300px] overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#080808]">
                    <Image
                      src={capturedImage}
                      alt="Captured meal preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => void startCamera()}
                      className="rounded-lg bg-[#151515] border border-[#2A2A2A] px-5 py-2.5 text-sm font-bold text-white uppercase tracking-wider hover:border-[#FF6B00]"
                    >
                      🔄 Retake
                    </button>
                    <button
                      disabled={analyzing}
                      onClick={() => void runPhotoAnalysis()}
                      className="rounded-lg bg-[#FF6B00] border border-[#FF6B00] px-6 py-2.5 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] disabled:opacity-50"
                    >
                      {analyzing ? "Estimating Nutrition..." : "Estimate Nutrition →"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="relative w-full h-[320px] overflow-hidden rounded-lg border border-[#2A2A2A] bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={capturePhoto}
                    className="w-full rounded-lg bg-[#FF6B00] px-6 py-3.5 text-base font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] border border-[#FF6B00]"
                  >
                    📷 Capture Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD WORKFLOW PANEL */}
          {mode === "upload" && capturedImage && (
            <div className="rounded-xl border border-[#FF6B00] bg-[#111111] p-6 grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-lg uppercase flex items-center gap-2">
                  <span>↑</span> MEAL PHOTO SELECTED
                </h2>
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setMode("idle");
                  }}
                  className="text-xs font-mono text-[#A0A0A0] hover:text-white uppercase"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="relative w-full max-h-[360px] h-[280px] overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#080808]">
                <Image
                  src={capturedImage}
                  alt="Uploaded meal"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  disabled={analyzing}
                  onClick={() => void runPhotoAnalysis()}
                  className="rounded-lg bg-[#FF6B00] border border-[#FF6B00] px-6 py-3 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] disabled:opacity-50"
                >
                  {analyzing ? "Estimating Nutrition..." : "Estimate Nutrition →"}
                </button>
              </div>
            </div>
          )}

          {/* REVIEW & ESTIMATION EDIT PANEL */}
          {mode === "review" && (
            <div className="rounded-xl border border-[#FF6B00] bg-[#111111] p-6 grid gap-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#2A2A2A] pb-4">
                <div>
                  <h2 className="font-bold text-white text-xl uppercase tracking-tight">
                    ESTIMATED MEAL NUTRITION
                  </h2>
                  <div className="text-xs text-[#FF6B00] font-mono mt-1">
                    ⚠️ {analysisDisclaimer}
                  </div>
                </div>
                <button
                  onClick={() => setMode("idle")}
                  className="text-xs font-mono text-[#A0A0A0] hover:text-white uppercase"
                >
                  Discard
                </button>
              </div>

              {/* Editable Items Table */}
              <div className="grid gap-4">
                {detectedItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-[#2A2A2A] bg-[#151515] p-4 grid gap-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-mono text-[#FF6B00] font-bold">ITEM #{index + 1}</div>
                      {detectedItems.length > 1 && (
                        <button
                          onClick={() => {
                            setDetectedItems(detectedItems.filter((_, i) => i !== index));
                          }}
                          className="text-xs text-[#FF2D2D] hover:underline"
                        >
                          Remove ✕
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#A0A0A0] font-mono">FOOD NAME</label>
                        <input
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...detectedItems];
                            updated[index].name = e.target.value;
                            setDetectedItems(updated);
                          }}
                          className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#A0A0A0] font-mono">PORTION (G)</label>
                        <input
                          type="number"
                          value={item.portionG}
                          onChange={(e) => {
                            const updated = [...detectedItems];
                            updated[index].portionG = Number(e.target.value) || 0;
                            setDetectedItems(updated);
                          }}
                          className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-xs text-[#A0A0A0] font-mono">CALORIES</label>
                        <input
                          type="number"
                          value={item.calories}
                          onChange={(e) => {
                            const updated = [...detectedItems];
                            updated[index].calories = Number(e.target.value) || 0;
                            setDetectedItems(updated);
                          }}
                          className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#111111] px-2 py-1.5 text-sm font-bold text-[#FF6B00] focus:border-[#FF6B00] outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#A0A0A0] font-mono">PROTEIN (G)</label>
                        <input
                          type="number"
                          value={item.proteinG}
                          onChange={(e) => {
                            const updated = [...detectedItems];
                            updated[index].proteinG = Number(e.target.value) || 0;
                            setDetectedItems(updated);
                          }}
                          className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#111111] px-2 py-1.5 text-sm text-white focus:border-[#FF6B00] outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#A0A0A0] font-mono">CARBS (G)</label>
                        <input
                          type="number"
                          value={item.carbsG}
                          onChange={(e) => {
                            const updated = [...detectedItems];
                            updated[index].carbsG = Number(e.target.value) || 0;
                            setDetectedItems(updated);
                          }}
                          className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#111111] px-2 py-1.5 text-sm text-white focus:border-[#FF6B00] outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#A0A0A0] font-mono">FAT (G)</label>
                        <input
                          type="number"
                          value={item.fatG}
                          onChange={(e) => {
                            const updated = [...detectedItems];
                            updated[index].fatG = Number(e.target.value) || 0;
                            setDetectedItems(updated);
                          }}
                          className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#111111] px-2 py-1.5 text-sm text-white focus:border-[#FF6B00] outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setDetectedItems([
                      ...detectedItems,
                      { name: "Additional Item", portionG: 100, calories: 150, proteinG: 10, carbsG: 20, fatG: 5 },
                    ]);
                  }}
                  className="self-start text-xs font-bold text-[#FF6B00] hover:underline uppercase"
                >
                  + Add Another Item
                </button>
              </div>

              {/* Total Summary & Confirm Button */}
              <div className="border-t border-[#2A2A2A] pt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm font-mono text-white">
                  TOTAL MEAL: <span className="font-bold text-[#FF6B00]">{reviewTotals.calories} kcal</span> | P {reviewTotals.proteinG}g • C {reviewTotals.carbsG}g • F {reviewTotals.fatG}g
                </div>

                <button
                  disabled={saving}
                  onClick={() => void saveReviewedItems()}
                  className="rounded-lg bg-[#FF6B00] border border-[#FF6B00] px-6 py-3 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving Meal..." : "ADD TO TODAY"}
                </button>
              </div>
            </div>
          )}

          {/* MANUAL FORM WORKFLOW PANEL */}
          {mode === "manual" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void saveManualEntry();
              }}
              className="rounded-xl border border-[#FF6B00] bg-[#111111] p-6 grid gap-4"
            >
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                <h2 className="font-bold text-white text-lg uppercase">
                  MANUAL MEAL ENTRY
                </h2>
                <button
                  type="button"
                  onClick={() => setMode("idle")}
                  className="text-xs font-mono text-[#A0A0A0] hover:text-white uppercase"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid gap-3">
                <div>
                  <label className="text-xs text-white font-medium">Meal Name / Label</label>
                  <input
                    value={manualLabel}
                    onChange={(e) => setManualLabel(e.target.value)}
                    placeholder="e.g., Paneer Paratha"
                    required
                    className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white placeholder-[#A0A0A0] focus:border-[#FF6B00] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-white font-medium">Total Calories (kcal)</label>
                  <input
                    type="number"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    placeholder="e.g., 420"
                    required
                    className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white placeholder-[#A0A0A0] focus:border-[#FF6B00] outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-white font-medium">Protein (g)</label>
                    <input
                      type="number"
                      value={manualProteinG}
                      onChange={(e) => setManualProteinG(e.target.value)}
                      placeholder="e.g., 18"
                      className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white font-medium">Carbs (g)</label>
                    <input
                      type="number"
                      value={manualCarbsG}
                      onChange={(e) => setManualCarbsG(e.target.value)}
                      placeholder="e.g., 52"
                      className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white font-medium">Fat (g)</label>
                    <input
                      type="number"
                      value={manualFatG}
                      onChange={(e) => setManualFatG(e.target.value)}
                      placeholder="e.g., 16"
                      className="w-full mt-1 rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-[#FF2D2D] bg-[#151515] p-3 text-xs text-[#FF2D2D]">
                  ⚠️ {error}
                </div>
              )}

              <button
                disabled={saving}
                type="submit"
                className="w-full mt-2 rounded-lg bg-[#FF6B00] border border-[#FF6B00] px-6 py-3 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "ADD MEAL ENTRY"}
              </button>
            </form>
          )}

          {/* BOTTOM SECTION: TODAY'S MEALS TIMELINE */}
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 grid gap-4">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <h2 className="font-bold text-white text-lg uppercase flex items-center gap-2">
                <span>TODAY'S MEALS</span>
              </h2>
              <span className="text-xs font-mono text-[#A0A0A0] uppercase font-bold">
                {entries.length} {entries.length === 1 ? "MEAL" : "MEALS"}
              </span>
            </div>

            {loading ? (
              <p className="text-xs text-[#A0A0A0] font-mono animate-pulse">Loading meals log...</p>
            ) : entries.length ? (
              <div className="grid gap-3">
                {entries.map((meal) => {
                  const cat = getMealCategory(meal.eatenAt);
                  return (
                    <div
                      key={meal.id}
                      className="rounded-lg border border-[#2A2A2A] bg-[#151515] p-4 flex flex-wrap items-center justify-between gap-4 hover:border-[#FF6B00]/50 transition-colors"
                    >
                      <div className="grid gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#FF6B00] font-bold uppercase">
                            {cat.icon} {cat.label}
                          </span>
                        </div>
                        <div className="font-bold text-white text-base">
                          {meal.label}
                        </div>
                        <div className="text-xs font-mono text-[#A0A0A0]">
                          {meal.proteinG}g protein • {meal.carbsG}g carbs • {meal.fatG}g fat
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold font-mono text-[#FF6B00]">
                          {meal.calories} kcal
                        </div>
                        <button
                          disabled={deletingId === meal.id}
                          onClick={() => void deleteMeal(meal.id)}
                          className="text-xs font-mono text-[#FF2D2D] hover:underline disabled:opacity-50 p-1"
                          title="Delete meal entry"
                        >
                          {deletingId === meal.id ? "..." : "✕"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center grid justify-items-center gap-3">
                <div className="text-3xl">🥗</div>
                <div className="font-bold text-white text-base">No meals logged yet.</div>
                <div className="text-xs text-[#A0A0A0] max-w-sm">
                  Take a photo or add your first meal to start tracking today's nutrition.
                </div>
                <button
                  onClick={() => setMode("manual")}
                  className="mt-2 rounded-lg bg-[#FF6B00] border border-[#FF6B00] px-5 py-2.5 text-xs font-bold text-white uppercase tracking-wider hover:bg-[#E05E00]"
                >
                  + ADD FIRST MEAL
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: PERSISTENT TODAY'S INTAKE & TARGET SUMMARY (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 grid gap-6">
            
            <div>
              <div className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider font-semibold">
                TODAY'S INTAKE
              </div>

              <div className="mt-3 flex items-baseline justify-between font-mono">
                <span className="text-2xl font-black text-white">
                  {totals.calories.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-[#A0A0A0]">
                  / {targetCal.toLocaleString()} kcal
                </span>
              </div>

              {/* Solid Progress Bar */}
              <div className="mt-3 h-3 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                <div
                  className="h-full bg-[#FF6B00] rounded-full transition-all"
                  style={{ width: `${Math.min(100, calPercent)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs font-mono">
                <span className="text-[#FF6B00] font-bold">{calPercent}% consumed</span>
                <span className="text-[#A0A0A0]">Remaining: {remainingCal.toLocaleString()} kcal</span>
              </div>
            </div>

            {/* Macro Progress Breakdown */}
            <div className="border-t border-[#2A2A2A] pt-4 grid gap-4">
              <div className="text-xs font-mono text-[#A0A0A0] uppercase font-semibold">
                MACRO BREAKDOWN
              </div>

              {/* Protein */}
              <div className="grid gap-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">PROTEIN</span>
                  <span className="text-[#A0A0A0]">{totals.proteinG} / {proteinTarget}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full transition-all"
                    style={{ width: `${Math.min(100, proteinPercent)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="grid gap-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">CARBS</span>
                  <span className="text-[#A0A0A0]">{totals.carbsG} / {carbsTarget}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full transition-all"
                    style={{ width: `${Math.min(100, carbsPercent)}%` }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div className="grid gap-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">FAT</span>
                  <span className="text-[#A0A0A0]">{totals.fatG} / {fatTarget}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full transition-all"
                    style={{ width: `${Math.min(100, fatPercent)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#2A2A2A] pt-4">
              <Link
                href="/products/analyze"
                className="w-full inline-flex items-center justify-center rounded-lg bg-[#151515] border border-[#2A2A2A] px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors"
              >
                Analyze Packaged Food →
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
