"use client";

import Link from "next/link";
import { computeTargets, type GoalType, type Sex } from "@/lib/nutrition/targets";
import { useEffect, useMemo, useState } from "react";

function todayYmdUtc() {
  return new Date().toISOString().slice(0, 10);
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

type Totals = { calories: number; proteinG: number; carbsG: number; fatG: number };

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totals, setTotals] = useState<Totals>({
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [pRes, mRes] = await Promise.all([
        fetch("/api/profile"),
        fetch(`/api/meals?date=${encodeURIComponent(todayYmdUtc())}`),
      ]);
      const pData = (await pRes.json().catch(() => null)) as any;
      const mData = (await mRes.json().catch(() => null)) as any;
      setProfile(pData?.profile ?? null);
      setTotals(mData?.totals ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
      setLoading(false);
    })();
  }, []);

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

  const calProgress = targets ? Math.min(1, totals.calories / Math.max(1, targets.calories)) : 0;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Dashboard
      </h1>
      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Today
              </h2>
              <Link
                href="/log"
                className="text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
              >
                Add meal
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-black">
                <div className="text-xs text-zinc-500">Calories</div>
                <div className="mt-1 text-lg font-semibold">{totals.calories}</div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-black">
                <div className="text-xs text-zinc-500">Protein</div>
                <div className="mt-1 text-lg font-semibold">{totals.proteinG}g</div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-black">
                <div className="text-xs text-zinc-500">Carbs</div>
                <div className="mt-1 text-lg font-semibold">{totals.carbsG}g</div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-black">
                <div className="text-xs text-zinc-500">Fat</div>
                <div className="mt-1 text-lg font-semibold">{totals.fatG}g</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Target progress
              </h2>
              <Link
                href="/profile/onboarding"
                className="text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
              >
                Update target
              </Link>
            </div>

            {targets ? (
              <div className="mt-4 grid gap-4">
                <div>
                  <div className="flex items-baseline justify-between text-sm">
                    <div className="text-zinc-600 dark:text-zinc-300">
                      Calories
                    </div>
                    <div className="font-medium">
                      {totals.calories} / {targets.calories} kcal
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <div
                      className="h-2 rounded-full bg-zinc-900 dark:bg-zinc-50"
                      style={{ width: `${Math.round(calProgress * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-black">
                    <div className="text-xs text-zinc-500">Protein</div>
                    <div className="mt-1 font-semibold">
                      {totals.proteinG} / {targets.proteinG}g
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-black">
                    <div className="text-xs text-zinc-500">Carbs</div>
                    <div className="mt-1 font-semibold">
                      {totals.carbsG} / {targets.carbsG}g
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-black">
                    <div className="text-xs text-zinc-500">Fat</div>
                    <div className="mt-1 font-semibold">
                      {totals.fatG} / {targets.fatG}g
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                Complete onboarding to see target progress.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

