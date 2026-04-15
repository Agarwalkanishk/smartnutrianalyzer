"use client";

import { useEffect, useMemo, useState } from "react";

type MealEntry = {
  id: string;
  eatenAt: string;
  label: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

function todayYmdUtc() {
  return new Date().toISOString().slice(0, 10);
}

export default function LogMealPage() {
  const [date, setDate] = useState(todayYmdUtc());
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState("");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [fatG, setFatG] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/meals?date=${encodeURIComponent(date)}`);
    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      setLoading(false);
      setError(data?.error ?? "Could not load meals.");
      return;
    }
    setEntries(data.entries ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

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

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Log meal
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setError(null);

            const payload = {
              eatenAt: `${date}T12:00:00.000Z`,
              label: label.trim(),
              calories: Number(calories),
              proteinG: proteinG ? Number(proteinG) : 0,
              carbsG: carbsG ? Number(carbsG) : 0,
              fatG: fatG ? Number(fatG) : 0,
            };

            const res = await fetch("/api/meals", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = (await res.json().catch(() => null)) as any;
            setSaving(false);
            if (!res.ok) {
              setError(data?.error ?? "Could not save meal.");
              return;
            }

            setLabel("");
            setCalories("");
            setProteinG("");
            setCarbsG("");
            setFatG("");
            await load();
          }}
        >
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Add entry
          </h2>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Label</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Chicken salad"
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Calories</label>
              <input
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                inputMode="numeric"
                placeholder="e.g., 450"
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Protein (g)</label>
                <input
                  value={proteinG}
                  onChange={(e) => setProteinG(e.target.value)}
                  inputMode="numeric"
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Carbs (g)</label>
                <input
                  value={carbsG}
                  onChange={(e) => setCarbsG(e.target.value)}
                  inputMode="numeric"
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Fat (g)</label>
                <input
                  value={fatG}
                  onChange={(e) => setFatG(e.target.value)}
                  inputMode="numeric"
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
                />
              </div>
            </div>
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}
            <button
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {saving ? "Saving..." : "Add"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Today totals
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-black">
              <div className="text-xs text-zinc-500">Calories</div>
              <div className="mt-1 text-lg font-semibold">{totals.calories}</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-black">
              <div className="text-xs text-zinc-500">Protein</div>
              <div className="mt-1 text-lg font-semibold">
                {totals.proteinG}g
              </div>
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

          <h3 className="mt-6 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Entries
          </h3>
          {loading ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Loading...
            </p>
          ) : entries.length ? (
            <ul className="mt-3 grid gap-2">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {e.label}
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-300">
                      {e.calories} kcal
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    P {e.proteinG}g • C {e.carbsG}g • F {e.fatG}g
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              No entries yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

