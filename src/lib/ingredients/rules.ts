export type RuleFlag = {
  ingredient: string;
  category:
    | "allergen"
    | "added_sugar"
    | "high_sodium"
    | "additive"
    | "trans_fat"
    | "sweetener"
    | "refined_flour"
    | "palm_oil"
    | "other";
  severity: "low" | "medium" | "high";
  reason: string;
  alternatives?: string[];
};

export type RuleVerdict = "healthy" | "moderate" | "unhealthy";

const allergenKeywords = [
  { key: "milk", aliases: ["milk", "casein", "whey", "lactose"] },
  { key: "egg", aliases: ["egg", "albumin"] },
  { key: "peanut", aliases: ["peanut"] },
  { key: "tree_nut", aliases: ["almond", "cashew", "walnut", "hazelnut", "pistachio", "pecan"] },
  { key: "soy", aliases: ["soy", "soya", "soybean", "lecithin"] },
  { key: "wheat", aliases: ["wheat", "gluten", "barley", "rye", "malt"] },
  { key: "fish", aliases: ["fish"] },
  { key: "shellfish", aliases: ["shrimp", "prawn", "crab", "lobster"] },
  { key: "sesame", aliases: ["sesame", "tahini"] },
];

const addedSugarAliases = [
  "sugar",
  "cane sugar",
  "brown sugar",
  "corn syrup",
  "high fructose corn syrup",
  "dextrose",
  "fructose",
  "glucose",
  "maltose",
  "maltodextrin",
  "invert sugar",
  "honey",
  "agave",
];

const sodiumAliases = [
  "salt",
  "sodium",
  "monosodium glutamate",
  "msg",
  "sodium nitrite",
  "sodium nitrate",
  "sodium benzoate",
  "disodium",
  "trisodium",
];

const additiveAliases = [
  "ins 102",
  "ins 110",
  "ins 211",
  "ins 250",
  "ins 621",
  "tartrazine",
  "sunset yellow",
  "sodium benzoate",
];

const transFatAliases = [
  "partially hydrogenated",
  "hydrogenated vegetable oil",
  "vanaspati",
  "shortening",
];

const sweetenerAliases = [
  "aspartame",
  "sucralose",
  "acesulfame",
  "acesulfame-k",
  "saccharin",
];

const refinedFlourAliases = ["maida", "refined wheat flour"];
const palmOilAliases = ["palm oil", "palmolein"];

function includesWord(haystack: string, needle: string) {
  const n = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${n}\\b`, "i").test(haystack);
}

export function normalizeIngredientsText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[•·]/g, ",")
    .trim();
}

export function runRuleChecks(input: {
  ingredientsText: string;
  userAllergens?: string[];
}) {
  const normalized = normalizeIngredientsText(input.ingredientsText);
  const lower = normalized.toLowerCase();
  const flags: RuleFlag[] = [];

  const userAllergens = (input.userAllergens ?? [])
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean);

  for (const a of allergenKeywords) {
    const hit = a.aliases.find((kw) => includesWord(lower, kw));
    if (!hit) continue;
    const isUserAllergen =
      userAllergens.includes(a.key) || userAllergens.includes(hit);
    flags.push({
      ingredient: hit,
      category: "allergen",
      severity: isUserAllergen ? "high" : "medium",
      reason: isUserAllergen
        ? "Matches an allergen in your profile."
        : "Common allergen marker.",
      alternatives: ["Choose an allergen-free alternative in this category."],
    });
  }

  for (const kw of addedSugarAliases) {
    if (!includesWord(lower, kw)) continue;
    flags.push({
      ingredient: kw,
      category: "added_sugar",
      severity: "medium",
      reason: "Added sugar marker (can increase overall added sugar intake).",
      alternatives: ["Look for unsweetened / no-added-sugar versions."],
    });
  }

  for (const kw of sodiumAliases) {
    if (!includesWord(lower, kw)) continue;
    flags.push({
      ingredient: kw,
      category: "high_sodium",
      severity: "low",
      reason: "Sodium/salt marker (consider overall sodium intake).",
      alternatives: ["Choose low-sodium versions when possible."],
    });
  }

  for (const kw of additiveAliases) {
    if (!includesWord(lower, kw)) continue;
    flags.push({
      ingredient: kw,
      category: "additive",
      severity: "low",
      reason: "Contains additive/color/preservative marker.",
      alternatives: ["Choose products with shorter, simpler ingredient lists."],
    });
  }

  for (const kw of transFatAliases) {
    if (!includesWord(lower, kw)) continue;
    flags.push({
      ingredient: kw,
      category: "trans_fat",
      severity: "high",
      reason: "Possible trans fat/hydrogenated fat marker.",
      alternatives: ["Choose products with non-hydrogenated oils."],
    });
  }

  for (const kw of sweetenerAliases) {
    if (!includesWord(lower, kw)) continue;
    flags.push({
      ingredient: kw,
      category: "sweetener",
      severity: "medium",
      reason: "Artificial sweetener marker.",
      alternatives: ["Prefer unsweetened products or naturally sweet options."],
    });
  }

  for (const kw of refinedFlourAliases) {
    if (!includesWord(lower, kw)) continue;
    flags.push({
      ingredient: kw,
      category: "refined_flour",
      severity: "medium",
      reason: "Refined flour marker (lower fiber than whole grain).",
      alternatives: ["Prefer whole wheat/millet/oats based options."],
    });
  }

  for (const kw of palmOilAliases) {
    if (!includesWord(lower, kw)) continue;
    flags.push({
      ingredient: kw,
      category: "palm_oil",
      severity: "low",
      reason: "Palm oil marker (watch overall saturated fat intake).",
      alternatives: ["Prefer oils lower in saturated fat where possible."],
    });
  }

  // Deduplicate by category+ingredient
  const seen = new Set<string>();
  const deduped = flags.filter((f) => {
    const k = `${f.category}:${f.ingredient.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return { normalized, flags: deduped };
}

export function computeRuleScoreAndVerdict(
  flags: RuleFlag[],
): { score: number; verdict: RuleVerdict } {
  const score = flags.reduce((sum, flag) => {
    if (flag.severity === "high") return sum + 25;
    if (flag.severity === "medium") return sum + 12;
    return sum + 6;
  }, 0);

  const boundedScore = Math.min(100, score);
  const verdict: RuleVerdict =
    boundedScore >= 61 ? "unhealthy" : boundedScore >= 31 ? "moderate" : "healthy";

  return { score: boundedScore, verdict };
}

