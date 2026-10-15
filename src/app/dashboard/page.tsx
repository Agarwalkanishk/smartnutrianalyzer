"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { computeTargets, type GoalType, type Sex } from "@/lib/nutrition/targets";
import { useEffect, useMemo, useState } from "react";

function todayYmdUtc() {
  return new Date().toISOString().slice(0, 10);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

type Profile = {
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  activityFactor: number | null;
  goalType: GoalType | null;
  paceKgPerWeek: number | null;
};

type MealEntry = {
  id: string;
  eatenAt: string;
  label: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

type Totals = { calories: number; proteinG: number; carbsG: number; fatG: number };
type ProfileResponse = { profile?: Profile | null };
type MealsResponse = { totals?: Totals; entries?: MealEntry[] };

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totals, setTotals] = useState<Totals>({
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
  });
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    const [pRes, mRes] = await Promise.all([
      fetch("/api/profile"),
      fetch(`/api/meals?date=${encodeURIComponent(todayYmdUtc())}`),
    ]);
    const pData = (await pRes.json().catch(() => null)) as ProfileResponse | null;
    const mData = (await mRes.json().catch(() => null)) as MealsResponse | null;
    setProfile(pData?.profile ?? null);
    setTotals(mData?.totals ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
    setEntries(mData?.entries ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const handleDeleteMeal = async (id: string) => {
    if (!confirm("Are you sure you want to remove this meal entry?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/meals?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setDeletingId(null);
    if (res.ok) {
      void fetchDashboardData();
    }
  };

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

  // Calculations
  const targetCal = targets?.calories ?? 2000;
  const remainingCal = targetCal - totals.calories;
  const calPercent = Math.min(100, Math.round((totals.calories / Math.max(1, targetCal)) * 100));

  const proteinTarget = targets?.proteinG ?? 150;
  const proteinPercent = Math.min(100, Math.round((totals.proteinG / Math.max(1, proteinTarget)) * 100));

  const carbsTarget = targets?.carbsG ?? 250;
  const carbsPercent = Math.min(100, Math.round((totals.carbsG / Math.max(1, carbsTarget)) * 100));

  const fatTarget = targets?.fatG ?? 65;
  const fatPercent = Math.min(100, Math.round((totals.fatG / Math.max(1, fatTarget)) * 100));

  const userName = session?.user?.name ? session.user.name.split(" ")[0] : "there";
  const greeting = getGreeting();

  return (
    <div className="grid gap-8 animate-in fade-in duration-300">
      {/* 1. HEADER / GREETING */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">
            {greeting}, {userName}
          </h1>
          <p className="mt-1 text-sm text-[#A0A0A0]">
            Here is your daily nutrition progress and target breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/log"
            className="rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-bold text-white uppercase hover:bg-[#E05E00] border border-[#FF6B00] transition-colors"
          >
            + Log meal
          </Link>
          <Link
            href="/products/analyze"
            className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-4 py-2 text-xs font-bold text-white hover:border-[#FF6B00] transition-colors"
          >
            Analyze product →
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-8">
          <p className="text-sm text-[#FF6B00] font-mono animate-pulse">Loading daily nutrition data...</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {/* 2. MAIN CALORIE HERO & TODAY'S INSIGHT */}
          <div className="grid gap-6 md:grid-cols-12">
            {/* Main Calorie Progress Card (Span 7) */}
            <div className="md:col-span-7 rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#A0A0A0]">
                  <span>Today's calories</span>
                  <span className="text-[#FF6B00] font-bold">{calPercent}% consumed</span>
                </div>

                <div className="mt-3 flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl md:text-5xl font-black text-white tracking-tight font-mono">
                    {totals.calories.toLocaleString()}
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-[#A0A0A0] font-mono">
                    / {targets ? targets.calories.toLocaleString() : "—"} kcal
                  </span>
                </div>

                <div className="mt-2 text-sm font-semibold">
                  {remainingCal >= 0 ? (
                    <span className="text-[#FF6B00] font-mono">{remainingCal.toLocaleString()} kcal remaining</span>
                  ) : (
                    <span className="text-[#FF2D2D] font-mono">{Math.abs(remainingCal).toLocaleString()} kcal over target</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="h-4 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      remainingCal < 0 ? "bg-[#FF2D2D]" : "bg-[#FF6B00]"
                    }`}
                    style={{ width: `${Math.min(100, calPercent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Today's Insight & Target Summary (Span 5) */}
            <div className="md:col-span-5 rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-[#A0A0A0] font-semibold uppercase">
                  Today's summary
                </div>
                <div className="mt-3 space-y-3">
                  <p className="text-sm sm:text-base text-white font-medium leading-snug">
                    {!targets ? (
                      "Set your body metrics and weight goal to generate personalized daily targets."
                    ) : remainingCal > 0 ? (
                      proteinTarget - totals.proteinG > 30 ? (
                        `You are ${proteinTarget - totals.proteinG}g low on protein today. Consider adding a protein-dense meal.`
                      ) : (
                        `You still have ${remainingCal.toLocaleString()} kcal available today. Keep your macros balanced.`
                      )
                    ) : remainingCal === 0 ? (
                      "Target hit! You have consumed your exact daily calorie allowance."
                    ) : (
                      `Calorie target reached. You are ${Math.abs(remainingCal).toLocaleString()} kcal over your daily goal.`
                    )}
                  </p>

                  {targets && (
                    <div className="rounded-lg border border-[#2A2A2A] bg-[#151515] p-3 text-xs text-[#A0A0A0] font-mono">
                      {totals.proteinG < targets.proteinG ? (
                        <span>● Protein is at {proteinPercent}% of daily target ({totals.proteinG}g / {targets.proteinG}g).</span>
                      ) : (
                        <span className="text-white">✓ Daily protein target achieved ({totals.proteinG}g).</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2A2A2A] flex justify-end">
                <Link
                  href="/profile/onboarding"
                  className="text-xs font-bold text-[#FF6B00] hover:underline uppercase tracking-wider"
                >
                  {targets ? "Update targets →" : "Set targets →"}
                </Link>
              </div>
            </div>
          </div>

          {/* 3. TODAY'S MACROS GRID */}
          <div>
            <div className="text-xs font-mono text-[#A0A0A0] font-semibold mb-3 uppercase">
              Today's nutrition
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Calories */}
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#A0A0A0]">
                    <span>Calories</span>
                    <span className="text-[#FF6B00] font-bold">{calPercent}%</span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-white font-mono">
                    {totals.calories} <span className="text-xs text-[#A0A0A0] font-normal">/ {targets?.calories ?? "—"}</span>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full transition-all"
                    style={{ width: `${Math.min(100, calPercent)}%` }}
                  />
                </div>
              </div>

              {/* Protein */}
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#A0A0A0]">
                    <span>Protein</span>
                    <span className="text-white font-bold">{proteinPercent}%</span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-white font-mono">
                    {totals.proteinG}g <span className="text-xs text-[#A0A0A0] font-normal">/ {targets?.proteinG ?? "—"}g</span>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full transition-all"
                    style={{ width: `${Math.min(100, proteinPercent)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#A0A0A0]">
                    <span>Carbs</span>
                    <span className="text-[#A0A0A0] font-bold">{carbsPercent}%</span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-white font-mono">
                    {totals.carbsG}g <span className="text-xs text-[#A0A0A0] font-normal">/ {targets?.carbsG ?? "—"}g</span>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full transition-all"
                    style={{ width: `${Math.min(100, carbsPercent)}%` }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#A0A0A0]">
                    <span>Fat</span>
                    <span className="text-[#A0A0A0] font-bold">{fatPercent}%</span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-white font-mono">
                    {totals.fatG}g <span className="text-xs text-[#A0A0A0] font-normal">/ {targets?.fatG ?? "—"}g</span>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full transition-all"
                    style={{ width: `${Math.min(100, fatPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. TODAY'S MEALS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono text-[#A0A0A0] font-semibold uppercase">
                Today's meals ({entries.length})
              </div>
              {entries.length > 0 && (
                <Link
                  href="/log"
                  className="text-xs font-bold text-[#FF6B00] hover:underline uppercase tracking-wider"
                >
                  + Add meal
                </Link>
              )}
            </div>

            {entries.length > 0 ? (
              <div className="grid gap-3">
                {entries.map((meal) => (
                  <div
                    key={meal.id}
                    className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4 flex items-center justify-between gap-4 flex-wrap hover:border-[#FF6B00]/60 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-white text-base">
                        {meal.label}
                      </div>
                      <div className="text-xs font-mono text-[#A0A0A0] mt-1">
                        {meal.proteinG}g protein • {meal.carbsG}g carbs • {meal.fatG}g fat
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold font-mono text-[#FF6B00]">
                        {meal.calories} kcal
                      </div>
                      <button
                        disabled={deletingId === meal.id}
                        onClick={() => void handleDeleteMeal(meal.id)}
                        className="text-xs font-mono text-[#FF2D2D] hover:underline disabled:opacity-50 p-1"
                        title="Delete meal entry"
                      >
                        {deletingId === meal.id ? "..." : "✕"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-[#151515] border border-[#2A2A2A] text-[#FF6B00] flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
                    <path
                      d="M4 13h16M6 13v1.5A4.5 4.5 0 0 0 10.5 19h3A4.5 4.5 0 0 0 18 14.5V13"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10c.5-1.4 1.6-2 3-2m2 2c.4-1 1.3-1.5 2.3-1.7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-base">No meals logged yet today</h3>
                <p className="mt-1 text-sm text-[#A0A0A0] max-w-md">
                  Start tracking your daily nutrition by logging your first meal via photo or manual entry.
                </p>
                <Link
                  href="/log"
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] border border-[#FF6B00] transition-colors"
                >
                  + Log first meal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
