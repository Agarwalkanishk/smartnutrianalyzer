type AlternativeRule = {
  matchesAny: RegExp[];
  suggestions: string[];
};

const PRODUCT_FAMILY_RULES: AlternativeRule[] = [
  {
    matchesAny: [/kitkat/, /\bmunch\b/, /perk/, /dairy milk/, /chocolate/, /wafer/],
    suggestions: [
      "RiteBite Max Protein Active Choco Slim bar",
      "The Whole Truth protein bars",
      "SuperYou Chocolate Protein Wafers",
    ],
  },
  {
    matchesAny: [/lays?/, /kurkure/, /bingo/, /chips?/, /namkeen/, /snack/],
    suggestions: [
      "Farmley Roasted Makhana packs",
      "SuperYou Multigrain Chips",
      "Roasted chana or peanuts in portion-controlled packs",
    ],
  },
  {
    matchesAny: [/maggi/, /yippee/, /top ramen/, /noodle/, /instant pasta/, /instant/],
    suggestions: [
      "Slurrp Farm Millet Noodles",
      "Slurrp Farm Zero Maida Hakka Noodles",
      "Whole wheat or millet noodles with added vegetables and paneer/egg",
    ],
  },
  {
    matchesAny: [/biscuit/, /cookie/, /cracker/, /cream biscuit/],
    suggestions: [
      "The Whole Truth protein bars",
      "Unsweetened peanut butter with whole wheat toast",
      "High-fiber atta crackers with no added sugar",
    ],
  },
  {
    matchesAny: [/cola/, /soda/, /soft drink/, /juice/, /drink/],
    suggestions: [
      "Plain chaas or unsweetened buttermilk",
      "Coconut water with no added sugar",
      "Lemon soda made at home without sugar",
    ],
  },
];

const FLAG_CATEGORY_RULES: Record<string, string[]> = {
  added_sugar: [
    "Pick a higher-protein snack with less added sugar, like a protein bar or roasted nuts",
  ],
  refined_flour: [
    "Prefer whole wheat, oats, or millet-based versions",
  ],
  trans_fat: [
    "Choose products made without hydrogenated fat or vanaspati",
  ],
  high_sodium: [
    "Look for lower-sodium versions or smaller single-serve packs",
  ],
};

export function getIndianMarketAlternatives(input: {
  productName?: string;
  categories?: string[];
}) {
  const lowerName = (input.productName ?? "").toLowerCase();
  const out: string[] = [];

  for (const rule of PRODUCT_FAMILY_RULES) {
    if (rule.matchesAny.some((pattern) => pattern.test(lowerName))) {
      out.push(...rule.suggestions);
    }
  }

  for (const category of input.categories ?? []) {
    out.push(...(FLAG_CATEGORY_RULES[category] ?? []));
  }

  out.push("Compare labels and prefer shorter ingredient lists with more protein or fiber");

  return Array.from(new Set(out)).slice(0, 8);
}
