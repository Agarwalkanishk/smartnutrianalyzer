"use client";

import { computeTargets, type GoalType, type Sex } from "@/lib/nutrition/targets";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function numberOrUndefined(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

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
      const data = (await res.json().catch(() => null)) as
        | { profile?: any }
        | null;
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
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Onboarding
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <form
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
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
            setStatus("Saved. Redirecting to dashboard...");
            router.push("/dashboard");
            router.refresh();
          }}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Age</label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputMode="numeric"
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Height (cm)</label>
              <input
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                inputMode="decimal"
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Weight (kg)</label>
              <input
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                inputMode="decimal"
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Activity level</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
              >
                <option value="1.2">Sedentary (1.2)</option>
                <option value="1.375">Light (1.375)</option>
                <option value="1.55">Moderate (1.55)</option>
                <option value="1.725">Very active (1.725)</option>
                <option value="1.9">Athlete (1.9)</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as GoalType)}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
              >
                <option value="lose">Lose weight</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain weight</option>
              </select>
            </div>

            {goal !== "maintain" ? (
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Pace (kg per week)
                </label>
                <input
                  value={paceKgPerWeek}
                  onChange={(e) => setPaceKgPerWeek(e.target.value)}
                  inputMode="decimal"
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
                />
                <p className="text-xs text-zinc-500">
                  Typical range is 0.25–1.0 kg/week. This is only a starting
                  estimate.
                </p>
              </div>
            ) : null}

            {status ? (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-zinc-200">
                {status}
              </div>
            ) : null}

            <button
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {saving ? "Saving..." : "Save & continue"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Preview
          </h2>
          {preview ? (
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-zinc-600 dark:text-zinc-300">BMR</dt>
                <dd className="font-medium">{preview.bmr} kcal/day</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-zinc-600 dark:text-zinc-300">TDEE</dt>
                <dd className="font-medium">{preview.tdee} kcal/day</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-zinc-600 dark:text-zinc-300">
                  Target calories
                </dt>
                <dd className="font-medium">{preview.targets.calories} kcal</dd>
              </div>
              <div className="mt-2 rounded-xl bg-zinc-50 p-4 dark:bg-black">
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Macro starter split
                </div>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-xs text-zinc-500">Protein</div>
                    <div className="mt-1 font-semibold">
                      {preview.targets.proteinG}g
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-xs text-zinc-500">Carbs</div>
                    <div className="mt-1 font-semibold">
                      {preview.targets.carbsG}g
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-xs text-zinc-500">Fat</div>
                    <div className="mt-1 font-semibold">
                      {preview.targets.fatG}g
                    </div>
                  </div>
                </div>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              Fill in the form to preview your targets.
            </p>
          )}
          <div className="mt-6 text-xs text-zinc-500">
            Next step: we’ll save this to your account and use it across meal
            logging and recommendations.
          </div>
        </div>
      </div>
    </div>
  );
}

