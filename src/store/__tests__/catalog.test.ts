import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCatalog } from "../catalog";

// Mock Supabase
vi.mock("@/lib/supabase", () => {
  return {
    isSupabaseConfigured: true,
    supabase: {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          then: vi.fn().mockImplementation((callback) => {
            callback({ error: null });
            return Promise.resolve({ error: null });
          }),
        }),
      }),
    },
  };
});

describe("Catalog Store - addProduct", () => {
  beforeEach(() => {
    useCatalog.setState({ products: [] });
  });

  it("generates a clean slug with a unique random suffix for normal English names", () => {
    const catalog = useCatalog.getState();
    catalog.addProduct({
      name: "Organic Apple",
      tagline: "Crisp and sweet",
      description: "Organic fuji apples",
      price: 1.99,
      unit: "1 lb",
      image: "apple.jpg",
      category: "Fresh Fruits",
      badges: ["Organic"],
      nutrition: { servingSize: "1 medium", calories: "95 kcal" },
      stock: 50,
    });

    const products = useCatalog.getState().products;
    expect(products.length).toBe(1);
    expect(products[0].slug).toMatch(/^organic-apple-[a-z0-9]{5}$/);
  });

  it("generates a fallback slug with a unique suffix for Arabic names", () => {
    const catalog = useCatalog.getState();
    catalog.addProduct({
      name: "تفاح عضوي",
      tagline: "Crisp and sweet in Arabic",
      description: "Arabic organic apples",
      price: 2.50,
      unit: "1 kg",
      image: "arabic-apple.jpg",
      category: "Fresh Fruits",
      badges: ["Organic"],
      nutrition: { servingSize: "100g", calories: "50 kcal" },
      stock: 30,
    });

    const products = useCatalog.getState().products;
    expect(products.length).toBe(1);
    expect(products[0].slug).toMatch(/^product-[a-z0-9]{5}$/);
  });

  it("respects pre-provided slug if explicitly specified", () => {
    const catalog = useCatalog.getState();
    catalog.addProduct({
      slug: "explicit-slug-123",
      name: "Explicit Name",
      tagline: "Custom",
      description: "Explicit",
      price: 3.00,
      unit: "1 pack",
      image: "explicit.jpg",
      category: "Whole Grains",
      badges: [],
      nutrition: { servingSize: "100g", calories: "100" },
      stock: 10,
    });

    const products = useCatalog.getState().products;
    expect(products.length).toBe(1);
    expect(products[0].slug).toBe("explicit-slug-123");
  });
});
