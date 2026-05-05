export type Category = string;
export type Diet = "Organic" | "Vegan" | "Gluten-Free";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  badges: string[];
  nutrition: {
    servingSize: string;
    calories: string;
    vitaminK?: string;
    vitaminC?: string;
    fiber?: string;
  };
  is_featured?: boolean;
  stock?: number;
};

export const dietaryPreferences = ["100% Natural", "Gluten-Free", "Vegan", "No Additives"];
export const flavorProfiles = ["Creamy", "Crunchy", "Smooth", "Roasted", "Unsalted"];

export const fallbackProducts: Product[] = [
  {
    slug: "organic-lacinato-kale",
    name: "Organic Lacinato Kale",
    tagline: "Vibrant, nutrient-dense heirloom variety",
    description:
      "Vibrant, nutrient-dense heirloom variety. Harvested daily from our regenerative farm in Ojai.",
    price: 4.99,
    unit: "250g bunch",
    image: "/images/product-kale.jpg",
    category: "Leafy Greens",
    badges: ["Organic", "Vegan"],
    nutrition: {
      servingSize: "100g",
      calories: "49 kcal",
      vitaminK: "681% DV",
      vitaminC: "134% DV",
      fiber: "4.1g",
    },
    is_featured: true,
    stock: 24,
  },
  {
    slug: "cherry-radish-bundle",
    name: "Cherry Radish Bundle",
    tagline: "Farm-to-table crunch in every bite",
    description:
      "Crisp, peppery cherry radishes with their greens still attached. Picked at sunrise, on shelves by noon.",
    price: 4.2,
    unit: "bunch",
    image: "/images/product-radish.jpg",
    category: "Root Vegetables",
    badges: ["Organic", "Vegan"],
    nutrition: { servingSize: "100g", calories: "16 kcal", vitaminC: "25% DV", fiber: "1.6g" },
    stock: 30,
  },
  {
    slug: "wild-blueberries",
    name: "Wild Blueberries",
    tagline: "Antioxidant-rich berries from high altitudes",
    description:
      "Tiny, intensely flavored wild blueberries — packed with anthocyanins. Sustainably foraged.",
    price: 6.75,
    unit: "150g box",
    image: "/images/product-blueberries.jpg",
    category: "Fresh Fruits",
    badges: ["Organic", "Vegan"],
    nutrition: { servingSize: "100g", calories: "57 kcal", vitaminC: "16% DV", fiber: "2.4g" },
    is_featured: true,
    stock: 26,
  },
  {
    slug: "heritage-rainbow-carrots",
    name: "Heritage Rainbow Carrots",
    tagline: "Multi-colored root vegetables, earthy and sweet",
    description: "Purple, orange and golden heirloom carrots with feathery tops. Sweet and earthy.",
    price: 5.3,
    unit: "bunch (~500g)",
    image: "/images/product-carrots.jpg",
    category: "Root Vegetables",
    badges: ["Organic", "Vegan", "Gluten-Free"],
    nutrition: { servingSize: "100g", calories: "41 kcal", vitaminC: "10% DV", fiber: "2.8g" },
    stock: 20,
  },
  {
    slug: "ancient-white-quinoa",
    name: "Ancient White Quinoa",
    tagline: "Pure, high-protein grains for lasting energy",
    description:
      "Single-origin Andean quinoa — naturally gluten-free, complete protein, light fluffy texture.",
    price: 12.5,
    unit: "500g pack",
    image: "/images/product-quinoa.jpg",
    category: "Whole Grains",
    badges: ["Organic", "Vegan", "Gluten-Free"],
    nutrition: { servingSize: "100g", calories: "368 kcal", fiber: "7g" },
    stock: 34,
  },
  {
    slug: "heirloom-tomatoes",
    name: "Heirloom Tomatoes",
    tagline: "Sun-ripened, vine to table",
    description:
      "A mix of heirloom varieties — Brandywine, Green Zebra, Cherokee Purple — grown without sprays.",
    price: 6.2,
    unit: "1kg mixed",
    image: "/images/product-tomatoes.jpg",
    category: "Fresh Fruits",
    badges: ["Organic", "Vegan", "Gluten-Free"],
    nutrition: { servingSize: "100g", calories: "18 kcal", vitaminC: "23% DV", fiber: "1.2g" },
    stock: 22,
  },
  {
    slug: "hass-avocados",
    name: "Hass Avocados",
    tagline: "Creamy, ripe, ready-to-eat",
    description: "Single-origin Ojai Valley Hass avocados, hand-selected at peak ripeness.",
    price: 2.4,
    unit: "each",
    image: "/images/product-avocado.jpg",
    category: "Fresh Fruits",
    badges: ["Organic", "Vegan", "Gluten-Free"],
    nutrition: { servingSize: "100g", calories: "160 kcal", fiber: "6.7g" },
    stock: 40,
  },
  {
    slug: "heirloom-vineyard-mix",
    name: "Heirloom Vineyard Mix",
    tagline: "Sweet, crisp, and bursting with antioxidants",
    description:
      "Hand-picked dark grapes from regenerative vineyards. Best-seller for snacking and salads.",
    price: 12.5,
    unit: "1kg",
    image: "/images/product-grapes.jpg",
    category: "Fresh Fruits",
    badges: ["Organic", "Vegan"],
    nutrition: { servingSize: "100g", calories: "69 kcal", vitaminC: "5% DV", fiber: "0.9g" },
    is_featured: true,
    stock: 18,
  },
  {
    slug: "vitality-green-juice",
    name: "Vitality Green Juice",
    tagline: "Cold-pressed, raw, never pasteurized",
    description:
      "Kale, cucumber, apple, lemon and ginger — pressed daily and bottled within the hour.",
    price: 9,
    unit: "330ml",
    image: "/images/product-juice-red.jpg",
    category: "Drinks",
    badges: ["Organic", "Vegan", "Gluten-Free"],
    nutrition: { servingSize: "330ml", calories: "120 kcal", vitaminC: "85% DV" },
    stock: 16,
  },
];
