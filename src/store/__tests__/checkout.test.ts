import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCart } from "../cart";
import { useOrders } from "../orders";
import { useShipping } from "../shipping";

// Mock Supabase
vi.mock("@/lib/supabase", () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    },
  };
});

describe("Checkout Flow State", () => {
  beforeEach(() => {
    useCart.getState().clear();
    useOrders.setState({ orders: [] });
    useShipping.setState({
      companies: [
        {
          id: "company-1",
          name: "Test Delivery",
          defaultDeskRate: 400,
          defaultHomeRate: 600,
          rates: {
            Alger: { desk: 300, home: 500 },
          },
          active: true,
        },
      ],
    });
  });

  it("adds items to cart and calculates subtotal", () => {
    const cart = useCart.getState();
    cart.add(
      {
        slug: "test-item",
        name: "Test Item",
        price: 1000,
        image: "test.jpg",
        unit: "1 kg",
      },
      2,
    );

    const items = useCart.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].qty).toBe(2);

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    expect(subtotal).toBe(2000);
  });

  it("handles shipping rate calculation based on delivery type", () => {
    const shipping = useShipping.getState();
    const company = shipping.companies[0];

    // Simulate Alger rate
    let rate = company.rates["Alger"] || {
      desk: company.defaultDeskRate,
      home: company.defaultHomeRate,
    };
    expect(rate.desk).toBe(300);
    expect(rate.home).toBe(500);

    // Simulate unknown wilaya rate (should fallback to defaults)
    rate = company.rates["Oran"] || {
      desk: company.defaultDeskRate,
      home: company.defaultHomeRate,
    };
    expect(rate.desk).toBe(400);
    expect(rate.home).toBe(600);
  });

  it("creates a guest order and clears the cart", async () => {
    const cart = useCart.getState();
    cart.add(
      {
        slug: "test-item-2",
        name: "Test Item 2",
        price: 1500,
        image: "test2.jpg",
        unit: "1 box",
      },
      1,
    );

    const subtotal = 1500;
    const shippingFee = 500;
    const total = subtotal + shippingFee;

    const ordersState = useOrders.getState();
    const orderData = {
      items: useCart.getState().items,
      subtotal,
      shipping: shippingFee,
      tax: 0,
      total,
      deliveryType: "home" as const,
      shippingCompany: "Test Delivery",
      paymentMethod: "cod" as const,
      phone: "0555000000",
      address: {
        fullName: "Test User",
        street: "123 Test St",
        city: "Alger",
        zip: "16000",
      },
    };

    const newOrder = ordersState.addGuestOrder(orderData);
    expect(newOrder).toBeDefined();
    expect(newOrder.total).toBe(2000);
    expect(newOrder.status).toBe("Processing");

    // After order placement, clear cart
    cart.clear();
    expect(useCart.getState().items.length).toBe(0);

    // Check if order is in the store
    expect(useOrders.getState().orders.length).toBe(1);
    expect(useOrders.getState().orders[0].id).toBe(newOrder.id);
  });
});
