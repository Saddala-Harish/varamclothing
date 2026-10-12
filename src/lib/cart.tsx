import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size?: string | undefined;
  color?: string | undefined;
  quantity: number;
  stock: number;
};

const KEY = "varam-cart-v1";

export const lineKey = (i: Pick<CartItem, "productId" | "size" | "color">) =>
  `${i.productId}|${i.size ?? ""}|${i.color ?? ""}`;

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  add: (item: CartItem) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupt cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      hydrated,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: cartSubtotal(items),
      add: (item) =>
        setItems((prev) => {
          const k = lineKey(item);
          const existing = prev.find((p) => lineKey(p) === k);
          if (existing) {
            return prev.map((p) =>
              lineKey(p) === k ? { ...p, quantity: Math.min(p.quantity + item.quantity, item.stock) } : p,
            );
          }
          return [...prev, { ...item, quantity: Math.min(item.quantity, item.stock) }];
        }),
      setQty: (key, qty) =>
        setItems((prev) =>
          prev.map((p) => (lineKey(p) === key ? { ...p, quantity: Math.max(1, Math.min(qty, p.stock)) } : p)),
        ),
      remove: (key) => setItems((prev) => prev.filter((p) => lineKey(p) !== key)),
      clear: () => setItems([]),
    }),
    [items, hydrated],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
