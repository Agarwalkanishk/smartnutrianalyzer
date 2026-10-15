"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { computeTargets, type GoalType, type Sex } from "@/lib/nutrition/targets";

type Profile = {
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  activityFactor: number | null;
  goalType: GoalType | null;
  paceKgPerWeek: number | null;
};

type ProfileResponse = {
  profile?: Profile | null;
};

function getActivityLabel(factor: number | null): string {
  if (!factor) return "Not specified";
  if (factor <= 1.25) return "Sedentary (1.2)";
  if (factor <= 1.45) return "Light Activity (1.375)";
  if (factor <= 1.65) return "Moderate Activity (1.55)";
  if (factor <= 1.8) return "Very Active (1.725)";
  return "Athlete / Heavy (1.9)";
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCalculationFlow, setShowCalculationFlow] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as ProfileResponse | null;
        setProfile(data?.profile ?? null);
      }
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/sign-in" });
  };

  const computed = useMemo(() => {
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

    return computeTargets({
      ageYears: profile.age,
      sex: profile.sex,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      activityFactor: profile.activityFactor,
      goalType: profile.goalType,
      paceKgPerWeek:
        profile.goalType === "maintain" ? undefined : profile.paceKgPerWeek ?? 0.5,
    });
  }, [profile]);

  const hasCompleteProfile = Boolean(computed);

  return (
    <div className="grid gap-8">
      
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            Profile
          </h1>
          <p className="mt-1 text-sm text-[#A0A0A0]">
            Manage your body metrics, goals, and daily nutrition targets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/profile/onboarding"
            className="inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#E05E00] border border-[#FF6B00] transition-colors"
          >
            Recalculate target →
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-4 py-2.5 text-xs font-bold text-white hover:border-[#FF2D2D] hover:text-[#FF2D2D] transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-8">
          <p className="text-xs font-mono text-[#A0A0A0] animate-pulse">Loading your profile...</p>
        </div>
      ) : !hasCompleteProfile ? (
        
        /* INCOMPLETE / UNFINISHED PROFILE STATE */
        <div className="rounded-xl border border-[#FF6B00] bg-[#111111] p-8 text-center grid justify-items-center gap-4">
          <div className="text-4xl mb-1">🎯</div>
          <h2 className="text-xl font-bold text-white uppercase">
            COMPLETE YOUR NUTRITION PROFILE
          </h2>
          <p className="text-sm text-[#A0A0A0] max-w-md">
            Set your age, height, weight, activity level, and weight goal to generate personalized daily calorie and macro targets.
          </p>
          <Link
            href="/profile/onboarding"
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] border border-[#FF6B00] transition-colors"
          >
            Start Onboarding →
          </Link>
        </div>
      ) : (

        /* COMPLETE NUTRITION SETUP DASHBOARD */
        <div className="grid gap-8">
          
          {/* 1. YOUR GOAL SECTION */}
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#A0A0A0] uppercase tracking-wider font-semibold">
                YOUR GOAL
              </div>
              <h2 className="text-2xl font-black text-[#FF6B00] uppercase tracking-tight mt-1 font-mono">
                {profile?.goalType === "lose"
                  ? "LOSE WEIGHT"
                  : profile?.goalType === "gain"
                  ? "GAIN WEIGHT"
                  : "MAINTAIN WEIGHT"}
              </h2>
              <p className="mt-1 text-sm text-[#A0A0A0]">
                {profile?.goalType === "lose"
                  ? "Your calorie and macro targets are currently optimized for weight loss."
                  : profile?.goalType === "gain"
                  ? "Your calorie and macro targets are currently optimized for muscle and weight gain."
                  : "Your calorie and macro targets are currently set to maintain your body weight."}
              </p>
            </div>

            <Link
              href="/profile/onboarding"
              className="text-xs font-bold text-[#FF6B00] hover:underline uppercase tracking-wider"
            >
              Update Goal →
            </Link>
          </div>

          {/* 2. YOUR BODY METRICS */}
          <div>
            <div className="text-xs font-mono text-[#A0A0A0] uppercase tracking-wider font-semibold mb-3">
              YOUR BODY METRICS
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <div className="text-xs font-mono text-[#A0A0A0]">AGE</div>
                <div className="mt-1 text-xl font-bold text-white font-mono">
                  {profile?.age ? `${profile.age} yrs` : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <div className="text-xs font-mono text-[#A0A0A0]">HEIGHT</div>
                <div className="mt-1 text-xl font-bold text-white font-mono">
                  {profile?.heightCm ? `${profile.heightCm} cm` : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <div className="text-xs font-mono text-[#A0A0A0]">WEIGHT</div>
                <div className="mt-1 text-xl font-bold text-white font-mono">
                  {profile?.weightKg ? `${profile.weightKg} kg` : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <div className="text-xs font-mono text-[#A0A0A0]">SEX</div>
                <div className="mt-1 text-xl font-bold text-white font-mono">
                  {profile?.sex ? (profile.sex === "male" ? "Male" : "Female") : "—"}
                </div>
              </div>

            </div>
          </div>

          {/* 3. DAILY NUTRITION TARGET */}
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 md:p-8 grid gap-6">
            <div>
              <div className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider font-semibold">
                DAILY NUTRITION TARGET
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-black text-[#FF6B00] font-mono tracking-tight">
                  {computed?.targets.calories.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-[#A0A0A0] uppercase font-mono">
                  kcal / day
                </span>
              </div>
              <div className="mt-1 text-xs font-mono text-[#A0A0A0]">
                BMR: {computed?.bmr} kcal/day • TDEE: {computed?.tdee} kcal/day
              </div>
            </div>

            {/* Macro Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#2A2A2A] pt-6">
              
              <div className="rounded-lg border border-[#2A2A2A] bg-[#151515] p-4">
                <div className="text-xs font-mono text-[#A0A0A0]">PROTEIN</div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">
                  {computed?.targets.proteinG}g
                </div>
                <div className="text-[10px] font-mono text-[#A0A0A0] mt-1">
                  Weight-based ratio
                </div>
              </div>

              <div className="rounded-lg border border-[#2A2A2A] bg-[#151515] p-4">
                <div className="text-xs font-mono text-[#A0A0A0]">CARBOHYDRATES</div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">
                  {computed?.targets.carbsG}g
                </div>
                <div className="text-[10px] font-mono text-[#A0A0A0] mt-1">
                  Energy balance allocation
                </div>
              </div>

              <div className="rounded-lg border border-[#2A2A2A] bg-[#151515] p-4">
                <div className="text-xs font-mono text-[#A0A0A0]">FAT</div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">
                  {computed?.targets.fatG}g
                </div>
                <div className="text-[10px] font-mono text-[#A0A0A0] mt-1">
                  Essential lipid target
                </div>
              </div>

            </div>
          </div>

          {/* 4. TARGET VISUALIZATION (MACRO SPLIT) */}
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 grid gap-4">
            <div className="text-xs font-mono text-[#A0A0A0] uppercase tracking-wider font-semibold">
              MACRO DISTRIBUTION
            </div>

            <div className="grid gap-3 text-xs font-mono">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold">PROTEIN</span>
                  <span className="text-[#FF6B00]">{computed?.targets.proteinG}g</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full"
                    style={{ width: `${Math.min(100, Math.round(((computed?.targets.proteinG ?? 0) * 4 / Math.max(1, computed?.targets.calories ?? 1)) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold">CARBS</span>
                  <span className="text-[#FF6B00]">{computed?.targets.carbsG}g</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full"
                    style={{ width: `${Math.min(100, Math.round(((computed?.targets.carbsG ?? 0) * 4 / Math.max(1, computed?.targets.calories ?? 1)) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold">FAT</span>
                  <span className="text-[#FF6B00]">{computed?.targets.fatG}g</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#151515] border border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full"
                    style={{ width: `${Math.min(100, Math.round(((computed?.targets.fatG ?? 0) * 9 / Math.max(1, computed?.targets.calories ?? 1)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. ACTIVITY & PLAN */}
          <div>
            <div className="text-xs font-mono text-[#A0A0A0] uppercase tracking-wider font-semibold mb-3">
              ACTIVITY & PLAN
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <div className="text-xs font-mono text-[#A0A0A0]">ACTIVITY LEVEL</div>
                <div className="mt-1 font-bold text-white text-base">
                  {getActivityLabel(profile?.activityFactor ?? null)}
                </div>
              </div>

              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <div className="text-xs font-mono text-[#A0A0A0]">GOAL PACE</div>
                <div className="mt-1 font-bold text-white text-base">
                  {profile?.goalType === "maintain"
                    ? "Maintain Weight"
                    : `${profile?.paceKgPerWeek ?? 0.5} kg / week`}
                </div>
              </div>

              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <div className="text-xs font-mono text-[#A0A0A0]">CALORIE ADJUSTMENT</div>
                <div className="mt-1 font-bold text-[#FF6B00] text-base font-mono">
                  {computed?.calorieAdjustment
                    ? `${computed.calorieAdjustment > 0 ? "+" : ""}${computed.calorieAdjustment} kcal/day`
                    : "0 kcal/day"}
                </div>
              </div>

            </div>
          </div>

          {/* 6. CALCULATION EXPLANATION (COLLAPSIBLE) */}
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6">
            <button
              onClick={() => setShowCalculationFlow(!showCalculationFlow)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="text-xs font-mono text-[#A0A0A0] uppercase font-semibold">
                HOW YOUR TARGET IS CALCULATED
              </div>
              <span className="text-xs font-mono text-[#FF6B00] font-bold">
                {showCalculationFlow ? "Hide [-]" : "Show Details [+]"}
              </span>
            </button>

            {showCalculationFlow && (
              <div className="mt-4 pt-4 border-t border-[#2A2A2A] text-xs font-mono text-white leading-relaxed grid gap-3">
                <div className="bg-[#151515] p-3 rounded-lg border border-[#2A2A2A]">
                  <span className="text-[#FF6B00] font-bold">CALCULATION FLOW:</span><br />
                  BMR (Basal Rate) → TDEE (Activity Multiplier) → Goal Adjustment → Daily Target Calories → Weight-Based Macro Split
                </div>
                <p className="text-[#A0A0A0]">
                  Your daily calorie target is calculated from your body metrics (BMR via Mifflin-St Jeor), activity level (TDEE), and weight goal. Protein and fat targets are calculated strictly from your body weight, with remaining calories allocated to carbohydrates.
                </p>
              </div>
            )}
          </div>

          {/* 7. ACCOUNT SECTION */}
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#A0A0A0] uppercase font-semibold">
                ACCOUNT
              </div>
              <div className="mt-1 font-bold text-white text-base">
                {session?.user?.email ?? "User Account"}
              </div>
              {session?.user?.name && (
                <div className="text-xs font-mono text-[#A0A0A0]">
                  Name: {session.user.name}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-5 py-2.5 text-xs font-bold text-white uppercase hover:border-[#FF2D2D] hover:text-[#FF2D2D] transition-colors"
            >
              Logout
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
