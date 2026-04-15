import { computeRuleScoreAndVerdict, runRuleChecks } from "@/lib/ingredients/rules";

type CatalogSeed = {
  name: string;
  brand: string;
  category: string;
  ingredientsText: string;
};

const INDIA_PRODUCT_SEEDS: CatalogSeed[] = [
  {
    name: "Masala Potato Chips",
    brand: "Sample Indian Snack",
    category: "snacks",
    ingredientsText:
      "Potatoes, edible vegetable oil (palmolein), salt, sugar, spices, flavor enhancer (INS 621), acidity regulator (INS 330)",
  },
  {
    name: "Instant Noodles Masala",
    brand: "Sample Noodle Brand",
    category: "instant_food",
    ingredientsText:
      "Refined wheat flour (maida), edible vegetable oil (palm oil), salt, sugar, hydrolyzed vegetable protein, flavor enhancer (INS 621), color (INS 110)",
  },
  {
    name: "Cream Biscuit",
    brand: "Sample Biscuit Co",
    category: "biscuits",
    ingredientsText:
      "Refined wheat flour (maida), sugar, palm oil, invert sugar syrup, raising agents, emulsifiers, artificial flavoring substances",
  },
  {
    name: "Orange Flavoured Drink",
    brand: "Sample Beverage",
    category: "beverages",
    ingredientsText:
      "Water, sugar, acidity regulator, stabilizers, permitted class II preservatives (INS 211), permitted synthetic food color (INS 110), added flavor",
  },
  {
    name: "Diet Cola",
    brand: "Sample Soft Drink",
    category: "beverages",
    ingredientsText:
      "Carbonated water, acidity regulator, sweetener (aspartame, acesulfame-k), color, preservatives",
  },
  {
    name: "Sweet Bun",
    brand: "Sample Bakery",
    category: "bakery",
    ingredientsText:
      "Refined wheat flour (maida), sugar, hydrogenated vegetable oil (vanaspati), yeast, salt, emulsifiers",
  },
  {
    name: "Tomato Ketchup",
    brand: "Sample Sauces",
    category: "condiments",
    ingredientsText:
      "Tomato paste, sugar, salt, acidity regulator, stabilizer, preservative (INS 211)",
  },
  {
    name: "Packaged Fruit Yogurt",
    brand: "Sample Dairy",
    category: "dairy",
    ingredientsText:
      "Milk solids, sugar, fruit pulp, stabilizers, flavoring substances, color (INS 102)",
  },
  {
    name: "Namkeen Mixture",
    brand: "Sample Namkeen",
    category: "snacks",
    ingredientsText:
      "Gram flour, edible vegetable oil (palmolein), salt, spices, sugar, antioxidant",
  },
  {
    name: "Frozen Paratha",
    brand: "Sample Frozen Foods",
    category: "frozen_food",
    ingredientsText:
      "Refined wheat flour (maida), edible vegetable oil, salt, emulsifiers, raising agents",
  },
];

export function listIndianCatalogProducts() {
  return INDIA_PRODUCT_SEEDS.map((seed) => {
    const checks = runRuleChecks({ ingredientsText: seed.ingredientsText });
    const scoring = computeRuleScoreAndVerdict(checks.flags);
    return {
      ...seed,
      score: scoring.score,
      verdict: scoring.verdict,
      flagged: checks.flags.slice(0, 8),
    };
  });
}
