import { describe, expect, it } from "vitest";
import { computeTargets } from "./targets";

const macroCalories = (p: number, c: number, f: number) => p * 4 + c * 4 + f * 9;

describe("computeTargets (nutrition targets)", () => {
  it("matches weight-based macros for male maintain (69kg, ~2530 kcal)", () => {
    const res = computeTargets({
      ageYears: 25,
      sex: "male",
      heightCm: 170,
      weightKg: 69,
      activityFactor: 1.55,
      goalType: "maintain",
    });

    // bmr/tdee depend on Mifflin; we only require approximate calorie target
    expect(res.targets.calories).toBeGreaterThan(2400);
    expect(res.targets.calories).toBeLessThan(2700);

    // Expected based on rules:
    // maintain => protein=2.0*weightKg, fat=1.0*weightKg
    expect(res.targets.proteinG).toBeGreaterThanOrEqual(136);
    expect(res.targets.proteinG).toBeLessThanOrEqual(140);

    expect(res.targets.fatG).toBeGreaterThanOrEqual(67);
    expect(res.targets.fatG).toBeLessThanOrEqual(71);

    // carbs are remaining calories after protein+fat
    // For ~2530 kcal: carbs expected ~339g (with rounding)
    expect(res.targets.carbsG).toBeGreaterThanOrEqual(337);
    expect(res.targets.carbsG).toBeLessThanOrEqual(341);

    // Total macro kcal should approximately equal target calories
    const totalMacroKcal = macroCalories(
      res.targets.proteinG,
      res.targets.carbsG,
      res.targets.fatG
    );
    expect(totalMacroKcal).toBeGreaterThanOrEqual(res.targets.calories - 4);
    expect(totalMacroKcal).toBeLessThanOrEqual(res.targets.calories + 4);
  });

  it("derives protein/fat from body weight for lose goal", () => {
    const res = computeTargets({
      ageYears: 30,
      sex: "male",
      heightCm: 175,
      weightKg: 70,
      activityFactor: 1.55,
      goalType: "lose",
      paceKgPerWeek: 0.5,
    });

    // lose => protein=2.2*kg, fat=0.8*kg
    expect(res.targets.proteinG).toBe(Math.round(70 * 2.2));
    expect(res.targets.fatG).toBe(Math.round(70 * 0.8));

    const totalMacroKcal = macroCalories(
      res.targets.proteinG,
      res.targets.carbsG,
      res.targets.fatG
    );
    expect(totalMacroKcal).toBeGreaterThanOrEqual(res.targets.calories - 4);
    expect(totalMacroKcal).toBeLessThanOrEqual(res.targets.calories + 4);
  });

  it("derives protein/fat from body weight for gain goal", () => {
    const res = computeTargets({
      ageYears: 30,
      sex: "male",
      heightCm: 175,
      weightKg: 70,
      activityFactor: 1.55,
      goalType: "gain",
      paceKgPerWeek: 0.5,
    });

    // gain => protein=2.0*kg, fat=1.0*kg
    expect(res.targets.proteinG).toBe(Math.round(70 * 2.0));
    expect(res.targets.fatG).toBe(Math.round(70 * 1.0));

    const totalMacroKcal = macroCalories(
      res.targets.proteinG,
      res.targets.carbsG,
      res.targets.fatG
    );
    expect(totalMacroKcal).toBeGreaterThanOrEqual(res.targets.calories - 4);
    expect(totalMacroKcal).toBeLessThanOrEqual(res.targets.calories + 4);
  });

  it("keeps existing calorie direction behavior: lose < maintain", () => {
    const maintain = computeTargets({
      ageYears: 30,
      sex: "female",
      heightCm: 165,
      weightKg: 80,
      activityFactor: 1.375,
      goalType: "maintain",
    });

    const lose = computeTargets({
      ageYears: 30,
      sex: "female",
      heightCm: 165,
      weightKg: 80,
      activityFactor: 1.375,
      goalType: "lose",
      paceKgPerWeek: 0.5,
    });

    expect(lose.targets.calories).toBeLessThan(maintain.targets.calories);

    // basic sanity
    expect(maintain.targets.proteinG).toBeGreaterThan(0);
    expect(maintain.targets.carbsG).toBeGreaterThan(0);
    expect(maintain.targets.fatG).toBeGreaterThan(0);
  });
});

