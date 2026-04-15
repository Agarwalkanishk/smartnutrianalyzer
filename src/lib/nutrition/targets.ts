export type Sex = "male" | "female";
export type GoalType = "lose" | "maintain" | "gain";

export type TargetInput = {
  ageYears: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityFactor: number;
  goalType: GoalType;
  paceKgPerWeek?: number;
};

export type MacroTargets = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type TargetResult = {
  bmr: number;
  tdee: number;
  targets: MacroTargets;
};

export function mifflinStJeorBmr(input: {
  ageYears: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
}) {
  const { ageYears, sex, heightCm, weightKg } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === "male" ? base + 5 : base - 161;
}

export function tdeeFromBmr(bmr: number, activityFactor: number) {
  return bmr * activityFactor;
}

export function dailyCalorieDeltaFromPace(input: {
  goalType: GoalType;
  paceKgPerWeek?: number;
}) {
  const pace = input.paceKgPerWeek ?? 0.5;
  const kcalPerKg = 7700;
  const dailyDelta = (pace * kcalPerKg) / 7;
  if (input.goalType === "maintain") return 0;
  return input.goalType === "lose" ? -dailyDelta : dailyDelta;
}

export function macroStarterSplit(calories: number): MacroTargets {
  // Starter split: 30% protein, 25% fat, rest carbs.
  const proteinG = Math.round((calories * 0.3) / 4);
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);
  return { calories, proteinG, carbsG, fatG };
}

export function computeTargets(input: TargetInput): TargetResult {
  const bmr = mifflinStJeorBmr(input);
  const tdee = tdeeFromBmr(bmr, input.activityFactor);
  const delta = dailyCalorieDeltaFromPace(input);
  const calories = Math.round(tdee + delta);
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targets: macroStarterSplit(calories),
  };
}

