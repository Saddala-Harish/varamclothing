import { STITCH_IMAGES } from "./stitch-images";

export const CATEGORIES = [
  { slug: "sarees", name: "Sarees", blurb: "Kanjivaram, Banarasi & Pattu" },
  { slug: "womens-clothing", name: "Women's Clothing", blurb: "Anarkalis, Kurtas & Sets" },
  { slug: "girls-dresses", name: "Girls' Dresses", blurb: "Pattu Pavadai & Festive Frocks" },
  { slug: "bangles", name: "Bangles", blurb: "Kundan, Meenakari & Glass" },
  { slug: "gold-jewellery", name: "1-Gram Gold Jewellery", blurb: "Temple, Chokers & Harams" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function categoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function inr(value: number | string | null | undefined) {
  return inrFormatter.format(Number(value ?? 0));
}

/** Resolve a stored image reference ("stitch:N" placeholder or full URL). */
export function img(ref: string | null | undefined) {
  if (!ref) return STITCH_IMAGES["7"];
  if (ref.startsWith("stitch:")) return STITCH_IMAGES[ref.slice(7)] ?? STITCH_IMAGES["7"];
  return ref;
}

export function site(key: string) {
  return STITCH_IMAGES[key];
}

export function discountPct(price: number, mrp?: number | null) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Delivery is free at or above the threshold, otherwise the flat charge applies. */
export function deliveryFor(subtotal: number, charge: number, freeAbove: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= freeAbove ? 0 : charge;
}

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];
