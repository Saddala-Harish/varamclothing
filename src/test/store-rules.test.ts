import { describe, expect, it } from "vitest";
import { deliveryFor, inr } from "@/lib/format";
import { cartSubtotal } from "@/lib/cart";

describe("delivery charges", () => {
  it("charges the flat fee below the free-delivery threshold", () => {
    expect(deliveryFor(1500, 99, 1999)).toBe(99);
  });
  it("is free at or above the threshold", () => {
    expect(deliveryFor(1999, 99, 1999)).toBe(0);
  });
});

describe("cart", () => {
  it("subtotal multiplies price by quantity", () => {
    expect(cartSubtotal([{ price: 1250, quantity: 2 }, { price: 599, quantity: 1 }] as never)).toBe(3099);
  });
});

it("formats rupees Indian-style", () => {
  expect(inr(125000)).toBe("₹1,25,000");
});
