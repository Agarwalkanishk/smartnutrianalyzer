import { describe, expect, it, vi } from "vitest";

vi.mock("@/db/prisma", () => {
  type IngredientAnalysisCreateInput = {
    data: Record<string, unknown>;
  };

  return {
    prisma: {
      ingredientAnalysis: {
        findUnique: vi.fn(async () => null),
        create: vi.fn(async ({ data }: IngredientAnalysisCreateInput) => ({
          id: "x",
          ...data,
        })),
      },
    },
  };
});

vi.mock("@/lib/ai/openaiCompat", () => {
  return {
    openAICompatJsonChat: vi.fn(async () => ({
      ok: false,
      error: "GEMINI_API_KEY is not configured",
    })),
  };
});

import { POST } from "./route";
import { prisma } from "@/db/prisma";

describe("/api/analyze/ingredients", () => {
  it("returns rule-based analysis when AI not configured", async () => {
    const req = new Request("http://localhost/api/analyze/ingredients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ingredientsText: "Whey, sugar, salt",
        userAllergens: ["milk"],
        productName: "Potato chips",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.analysis).toBeTruthy();
    expect(Array.isArray(json.analysis.flagged)).toBe(true);
    expect(typeof json.analysis.score).toBe("number");
    expect(["healthy", "moderate", "unhealthy"]).toContain(
      json.analysis.verdict,
    );
    expect(Array.isArray(json.analysis.betterAlternatives)).toBe(true);
    expect(json.analysis.disclaimers.join(" ")).toMatch(/not medical advice/i);

    expect(prisma.ingredientAnalysis.create).toHaveBeenCalled();
  });

  it("returns Indian market alternatives for chocolate and snack products", async () => {
    const req = new Request("http://localhost/api/analyze/ingredients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ingredientsText: "Sugar, wheat flour, palm oil, milk solids",
        productName: "KitKat",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.analysis.betterAlternatives).toEqual(
      expect.arrayContaining([
        "RiteBite Max Protein Active Choco Slim bar",
        "The Whole Truth protein bars",
      ]),
    );
  });
});

