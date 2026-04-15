import { describe, expect, it } from "vitest";
import {
  computeRuleScoreAndVerdict,
  normalizeIngredientsText,
  runRuleChecks,
} from "./rules";

describe("normalizeIngredientsText", () => {
  it("normalizes whitespace and bullets", () => {
    expect(normalizeIngredientsText("A  B\n\nC • D")).toBe("A B C , D");
  });
});

describe("runRuleChecks", () => {
  it("flags common allergens and sugars", () => {
    const res = runRuleChecks({
      ingredientsText: "Whey protein, Sugar, Cocoa, Salt",
      userAllergens: ["milk"],
    });
    const cats = res.flags.map((f) => f.category);
    expect(cats).toContain("allergen");
    expect(cats).toContain("added_sugar");
  });

  it("flags india-market concern markers", () => {
    const res = runRuleChecks({
      ingredientsText: "Maida, sugar, palm oil, vanaspati, INS 110",
    });
    const cats = res.flags.map((f) => f.category);
    expect(cats).toContain("refined_flour");
    expect(cats).toContain("trans_fat");
    expect(cats).toContain("additive");
  });
});

describe("computeRuleScoreAndVerdict", () => {
  it("returns high score for severe flags", () => {
    const res = runRuleChecks({
      ingredientsText: "Sugar, vanaspati, sodium benzoate",
    });
    const scored = computeRuleScoreAndVerdict(res.flags);
    expect(scored.score).toBeGreaterThan(30);
    expect(["moderate", "unhealthy"]).toContain(scored.verdict);
  });
});

