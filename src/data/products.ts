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
  nutrition: { servingSize: string; calories: string; vitaminK?: string; vitaminC?: string; fiber?: string };
  is_featured?: boolean;
};

export const diets: Diet[] = ["Organic", "Gluten-Free", "Vegan"];
