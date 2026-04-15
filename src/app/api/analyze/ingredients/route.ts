import { prisma } from "@/db/prisma";
import { openAICompatJsonChat } from "@/lib/ai/openaiCompat";
import {
  computeRuleScoreAndVerdict,
  runRuleChecks,
  type RuleFlag,
} from "@/lib/ingredients/rules";
import { getIndianMarketAlternatives } from "@/lib/products/indiaAlternatives";
import crypto from "crypto";
import { z } from "zod";

const requestSchema = z.object({
  ingredientsText: z.string().min(1).max(20000),
  userAllergens: z.array(z.string()).optional(),
  productName: z.string().min(1).max(160).optional(),
});

const outputSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  verdict: z.enum(["healthy", "moderate", "unhealthy"]),
  score: z.number().int().min(0).max(100),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1).max(800),
  flagged: z
    .array(
      z.object({
        ingredient: z.string().min(1).max(120),
        category: z.string().min(1).max(50),
        severity: z.enum(["low", "medium", "high"]),
        reason: z.string().min(1).max(400),
        alternatives: z.array(z.string().min(1).max(120)).optional(),
      }),
    )
    .max(60),
  betterAlternatives: z.array(z.string().min(1).max(180)).max(12).optional(),
  disclaimers: z.array(z.string().min(1).max(300)).max(10),
});

function riskFromFlags(flags: RuleFlag[]) {
  if (flags.some((f) => f.severity === "high")) return "high" as const;
  if (flags.some((f) => f.severity === "medium")) return "medium" as const;
  return flags.length ? ("low" as const) : ("low" as const);
}

function buildBetterAlternatives(input: {
  flags: RuleFlag[];
  productName?: string;
}) {
  const categories = new Set(input.flags.map((f) => f.category));
  const out = getIndianMarketAlternatives({
    productName: input.productName,
    categories: Array.from(categories),
  });

  if (categories.has("trans_fat")) {
    out.push("Avoid vanaspati/PHVO; pick products with non-hydrogenated oils");
  }

  return Array.from(new Set(out)).slice(0, 8);
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { normalized, flags } = runRuleChecks({
    ingredientsText: parsed.data.ingredientsText,
    userAllergens: parsed.data.userAllergens,
  });
  const deterministic = computeRuleScoreAndVerdict(flags);

  const analyzerVersion = "v2";
  const model = process.env.AI_MODEL ?? "gpt-4.1-mini";
  const normalizedProductName = (parsed.data.productName ?? "").trim().toLowerCase();
  const inputHash = crypto
    .createHash("sha256")
    .update(`${analyzerVersion}|${model}|${normalizedProductName}|${normalized}`)
    .digest("hex");

  let dbAvailable = true;
  try {
    const cached = await prisma.ingredientAnalysis.findUnique({
      where: { inputHash },
    });
    if (cached) {
      return Response.json({ ok: true, cached: true, analysis: cached.output });
    }
  } catch {
    dbAvailable = false;
  }

  const llmRes = await openAICompatJsonChat({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a nutrition ingredient assistant. Be cautious and factual. Return ONLY a single JSON object that matches the requested schema. Do not include markdown or extra text.",
      },
      {
        role: "user",
        content: [
          "Analyze this ingredients list for potential concerns and provide safer alternatives.",
          "",
          "IngredientsText:",
          normalized,
          "",
          "DeterministicRuleFlags (use these as strong hints):",
          JSON.stringify(flags),
          "",
          "Return JSON with keys:",
          "- riskLevel: low|medium|high (overall)",
          "- verdict: healthy|moderate|unhealthy",
          "- score: integer 0..100",
          "- confidence: number 0..1",
          "- summary: short plain-English summary",
          "- flagged: array of {ingredient, category, severity, reason, alternatives[]}",
          "- betterAlternatives: array of concise food swap suggestions",
          "- disclaimers: array of short disclaimers (include: 'Not medical advice')",
        ].join("\n"),
      },
    ],
  });

  let analysis: z.infer<typeof outputSchema>;
  if (!llmRes.ok) {
    analysis = {
      riskLevel: riskFromFlags(flags),
      verdict: deterministic.verdict,
      score: deterministic.score,
      confidence: 0.35,
      summary:
        flags.length
          ? "Some ingredients matched common concern markers. Configure AI_API_KEY for deeper analysis."
          : "No obvious concern markers detected. Configure AI_API_KEY for deeper analysis.",
      flagged: flags.map((f) => ({
        ingredient: f.ingredient,
        category: f.category,
        severity: f.severity,
        reason: f.reason,
        alternatives: f.alternatives,
      })),
      betterAlternatives: buildBetterAlternatives({
        flags,
        productName: parsed.data.productName,
      }),
      disclaimers: ["Not medical advice."],
    };
  } else {
    const parsedJson = (() => {
      try {
        return JSON.parse(llmRes.content);
      } catch {
        return null;
      }
    })();

    const validated = outputSchema.safeParse(parsedJson);
    if (!validated.success) {
      analysis = {
        riskLevel: riskFromFlags(flags),
        verdict: deterministic.verdict,
        score: deterministic.score,
        confidence: 0.3,
        summary:
          "AI response could not be validated. Showing deterministic rule checks only.",
        flagged: flags.map((f) => ({
          ingredient: f.ingredient,
          category: f.category,
          severity: f.severity,
          reason: f.reason,
          alternatives: f.alternatives,
        })),
        betterAlternatives: buildBetterAlternatives({
          flags,
          productName: parsed.data.productName,
        }),
        disclaimers: ["Not medical advice."],
      };
    } else {
      analysis = validated.data;
      // Always ensure rule flags are represented (avoid missing allergens/sugar markers).
      const existing = new Set(
        analysis.flagged.map(
          (f) => `${f.category}:${f.ingredient.toLowerCase()}`,
        ),
      );
      for (const f of flags) {
        const k = `${f.category}:${f.ingredient.toLowerCase()}`;
        if (existing.has(k)) continue;
        analysis.flagged.push({
          ingredient: f.ingredient,
          category: f.category,
          severity: f.severity,
          reason: f.reason,
          alternatives: f.alternatives,
        });
      }
      analysis.flagged = analysis.flagged.slice(0, 60);
      if (!analysis.disclaimers.some((d) => /not medical advice/i.test(d))) {
        analysis.disclaimers = ["Not medical advice.", ...analysis.disclaimers].slice(
          0,
          10,
        );
      }
      const deterministicAlternatives = buildBetterAlternatives({
        flags,
        productName: parsed.data.productName,
      });
      analysis.betterAlternatives = Array.from(
        new Set([...(analysis.betterAlternatives ?? []), ...deterministicAlternatives]),
      ).slice(0, 12);
      if (!Number.isInteger(analysis.score)) {
        analysis.score = deterministic.score;
      }
    }
  }

  if (dbAvailable) {
    await prisma.ingredientAnalysis
      .create({
        data: {
          inputHash,
          inputText: parsed.data.ingredientsText,
          normalizedText: normalized,
          model,
          output: analysis as any,
        },
      })
      .catch(() => null);
  }

  return Response.json({ ok: true, cached: false, analysis });
}

