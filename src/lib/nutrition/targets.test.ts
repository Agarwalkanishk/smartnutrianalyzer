import { describe, expect, it } from "vitest";
import { computeTargets } from "./targets";

describe("computeTargets", () => {
  it("computes reasonable maintain calories/macros", () => {
    const res = computeTargets({
      ageYears: 25,
      sex: "male",
      heightCm: 175,
      weightKg: 70,
      activityFactor: 1.55,
      goalType: "maintain",
    });

    expect(res.bmr).toBeGreaterThan(1200);
    expect(res.tdee).toBeGreaterThan(res.bmr);
    expect(res.targets.calories).toBeGreaterThan(1600);
    expect(res.targets.proteinG).toBeGreaterThan(0);
    expect(res.targets.carbsG).toBeGreaterThan(0);
    expect(res.targets.fatG).toBeGreaterThan(0);
  });

  it("decreases calories for loss goal", () => {
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
  });
});

