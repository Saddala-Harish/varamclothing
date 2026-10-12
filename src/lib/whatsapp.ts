import { inr } from "./format";

export function waLink(number: string, message: string) {
  const digits = (number || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

type Line = { name: string; quantity: number; price: number; size?: string | null | undefined; color?: string | null | undefined };

export function orderMessage(opts: {
  storeName: string;
  items: Line[];
  subtotal: number;
  delivery: number;
  total: number;
  orderRef?: string;
  customer?: { name: string; phone: string; address: string; payment: string };
}) {
  const lines = opts.items.map((i, n) => {
    const variant = [i.size && `Size: ${i.size}`, i.color && `Colour: ${i.color}`].filter(Boolean).join(", ");
    return `${n + 1}. ${i.name}${variant ? ` (${variant})` : ""} × ${i.quantity} = ${inr(i.price * i.quantity)}`;
  });
  const parts = [
    `Namaste ${opts.storeName}! 🙏`,
    opts.orderRef ? `I've placed order *${opts.orderRef}*:` : "I'd like to order:",
    "",
    ...lines,
    "",
    `Subtotal: ${inr(opts.subtotal)}`,
    `Delivery: ${opts.delivery === 0 ? "Free" : inr(opts.delivery)}`,
    `*Total: ${inr(opts.total)}*`,
  ];
  if (opts.customer) {
    parts.push(
      "",
      `Name: ${opts.customer.name}`,
      `Phone: ${opts.customer.phone}`,
      `Address: ${opts.customer.address}`,
      `Payment: ${opts.customer.payment}`,
    );
  }
  return parts.join("\n");
}
