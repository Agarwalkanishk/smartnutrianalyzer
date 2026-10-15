"use client";

import { computeTargets, type GoalType, type Sex } from "@/lib/nutrition/targets";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function numberOrUndefined(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

type ProfileResponse = {
  profile?: {
    age: number | null;
    sex: Sex | null;
    heightCm: number | null;
    weightKg: number | null;
    activityFactor: number | null;
    goalType: GoalType | null;
    paceKgPerWeek: number | null;
  } | null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [age, setAge] = useState("25");
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("70");
  const [activity, setActivity] = useState("1.55"); // moderate
  const [goal, setGoal] = useState<GoalType>("maintain");
  const [paceKgPerWeek, setPaceKgPerWeek] = useState("0.5");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const data = (await res.json().catch(() => null)) as ProfileResponse | null;
      const p = data?.profile;
      if (!p || cancelled) return;

      if (typeof p.age === "number") setAge(String(p.age));
      if (p.sex === "male" || p.sex === "female") setSex(p.sex);
      if (typeof p.heightCm === "number") setHeightCm(String(p.heightCm));
      if (typeof p.weightKg === "number") setWeightKg(String(p.weightKg));
      if (typeof p.activityFactor === "number")
        setActivity(String(p.activityFactor));
      if (p.goalType === "lose" || p.goalType === "maintain" || p.goalType === "gain")
        setGoal(p.goalType);
      if (typeof p.paceKgPerWeek === "number")
        setPaceKgPerWeek(String(p.paceKgPerWeek));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const preview = useMemo(() => {
    const a = numberOrUndefined(age);
    const h = numberOrUndefined(heightCm);
    const w = numberOrUndefined(weightKg);
    const act = numberOrUndefined(activity);
    if (!a || !h || !w || !act) return null;

    const pace =
      goal === "maintain" ? undefined : (numberOrUndefined(paceKgPerWeek) ?? 0.5);

    const result = computeTargets({
      ageYears: a,
      sex,
      heightCm: h,
      weightKg: w,
      activityFactor: act,
      goalType: goal,
      paceKgPerWeek: pace,
    });

    return result;
  }, [activity, age, heightCm, paceKgPerWeek, goal, sex, weightKg]);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
        Nutrition Goal Setup
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <form
          className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setStatus(null);

            const payload = {
              age: numberOrUndefined(age) ?? null,
              sex,
              heightCm: numberOrUndefined(heightCm) ?? null,
              weightKg: numberOrUndefined(weightKg) ?? null,
              activityFactor: numberOrUndefined(activity) ?? null,
              goalType: goal,
              paceKgPerWeek:
                goal === "maintain" ? null : (numberOrUndefined(paceKgPerWeek) ?? 0.5),
            };

            const res = await fetch("/api/profile", {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            });

            setSaving(false);
            if (!res.ok) {
              setStatus("Could not save profile. Please try again.");
              return;
            }
            setStatus("Saved successfully. Redirecting...");
            router.push("/dashboard");
            router.refresh();
          }}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white">Age</label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputMode="numeric"
                className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-white">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-white">Height (cm)</label>
              <input
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                inputMode="decimal"
                className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-white">Weight (kg)</label>
              <input
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                inputMode="decimal"
                className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-white">Activity Level</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
              >
                <option value="1.2">Sedentary (1.2)</option>
                <option value="1.375">Light Activity (1.375)</option>
                <option value="1.55">Moderate Activity (1.55)</option>
                <option value="1.725">Very Active (1.725)</option>
                <option value="1.9">Athlete (1.9)</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-white">Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as GoalType)}
                className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
              >
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight</option>
              </select>
            </div>

            {goal !== "maintain" ? (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-white">
                  Pace (kg per week)
                </label>
                <input
                  value={paceKgPerWeek}
                  onChange={(e) => setPaceKgPerWeek(e.target.value)}
                  inputMode="decimal"
                  className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
                />
                <p className="text-xs text-[#A0A0A0]">
                  Standard range: 0.25 – 1.0 kg/week.
                </p>
              </div>
            ) : null}

            {status ? (
              <div className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-[#FF6B00] font-mono">
                {status}
              </div>
            ) : null}

            <button
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-5 py-3 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] disabled:opacity-50 transition-colors border border-[#FF6B00]"
            >
              {saving ? "Saving..." : "Save & Calculate Targets"}
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6">
          <h2 className="font-bold text-white text-lg">
            Calculated Targets Preview
          </h2>
          {preview ? (
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
                <dt className="text-[#A0A0A0] font-mono">BMR (Basal Metabolic Rate)</dt>
                <dd className="font-bold text-white font-mono">{preview.bmr} kcal/day</dd>
              </div>
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
                <dt className="text-[#A0A0A0] font-mono">TDEE (Total Expenditure)</dt>
                <dd className="font-bold text-white font-mono">{preview.tdee} kcal/day</dd>
              </div>
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
                <dt className="text-[#A0A0A0] font-mono">TARGET CALORIES</dt>
                <dd className="font-bold text-[#FF6B00] font-mono text-base">{preview.targets.calories} kcal</dd>
              </div>
              <div className="mt-3 rounded-lg border border-[#2A2A2A] bg-[#151515] p-4">
                <div className="text-xs font-mono text-[#A0A0A0] uppercase">
                  Body Weight Adjusted Macro Targets
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[#2A2A2A] bg-[#111111] p-3 text-center">
                    <div className="text-xs font-mono text-[#A0A0A0]">PROTEIN</div>
                    <div className="mt-1 font-bold text-white font-mono">
                      {preview.targets.proteinG}g
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#2A2A2A] bg-[#111111] p-3 text-center">
                    <div className="text-xs font-mono text-[#A0A0A0]">CARBS</div>
                    <div className="mt-1 font-bold text-white font-mono">
                      {preview.targets.carbsG}g
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#2A2A2A] bg-[#111111] p-3 text-center">
                    <div className="text-xs font-mono text-[#A0A0A0]">FAT</div>
                    <div className="mt-1 font-bold text-white font-mono">
                      {preview.targets.fatG}g
                    </div>
                  </div>
                </div>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-[#A0A0A0]">
              Enter your metrics to preview calculated targets.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
