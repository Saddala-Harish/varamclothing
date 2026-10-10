import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { lineKey, useCart } from "@/lib/cart";
import { settingsQuery } from "@/lib/store";
import { deliveryFor, img, inr } from "@/lib/format";
import { orderMessage, waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Shopping Bag — Varam Vastra & Jewels" },
      { name: "description", content: "Review your selected sarees, jewellery and ethnic wear before checkout." },
      { property: "og:title", content: "Shopping Bag — Varam Vastra & Jewels" },
      { property: "og:description", content: "Review your bag and checkout with UPI or Cash on Delivery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { data: s } = useQuery(settingsQuery());
  const delivery = deliveryFor(cart.subtotal, Number(s?.delivery_charge ?? 0), Number(s?.free_delivery_threshold ?? 0));
  const total = cart.subtotal + delivery;
  const remaining = Number(s?.free_delivery_threshold ?? 0) - cart.subtotal;

  if (!cart.hydrated) return <div className="container-page py-20"><div className="h-40 animate-pulse rounded-3xl bg-muted" /></div>;

  if (cart.items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <ShoppingBag className="mx-auto h-14 w-14 text-secondary" />
        <h1 className="mt-4 text-3xl text-primary">Your bag is empty</h1>
        <p className="mt-2 text-muted-foreground">Discover our handpicked sarees, jewellery and ethnic wear.</p>
        <Link to="/shop" className="btn btn-primary mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl text-primary">Shopping Bag</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          {cart.items.map((i) => {
            const k = lineKey(i);
            return (
              <li key={k} className="flex gap-4 rounded-2xl bg-card p-4 shadow-soft">
                <Link to="/product/$slug" params={{ slug: i.slug }} className="shrink-0">
                  <img src={img(i.image)} alt={i.name} className="h-28 w-24 rounded-xl object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link to="/product/$slug" params={{ slug: i.slug }} className="font-display text-lg text-primary hover:underline">{i.name}</Link>
                    <button onClick={() => cart.remove(k)} className="p-1 text-muted-foreground hover:text-destructive" aria-label={`Remove ${i.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <p className="text-xs text-muted-foreground">{[i.size && `Size: ${i.size}`, i.color && `Colour: ${i.color}`].filter(Boolean).join(" · ")}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <div className="flex items-center rounded-full border bg-surface-low">
                      <button onClick={() => cart.setQty(k, i.quantity - 1)} className="p-2" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{i.quantity}</span>
                      <button onClick={() => cart.setQty(k, i.quantity + 1)} disabled={i.quantity >= i.stock} className="p-2 disabled:opacity-40" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <span className="font-bold text-primary">{inr(i.price * i.quantity)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-3xl bg-card p-6 shadow-soft lg:sticky lg:top-40">
          <h2 className="text-xl text-primary">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal ({cart.count} items)</dt><dd>{inr(cart.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{delivery === 0 ? <span className="text-success">Free</span> : inr(delivery)}</dd></div>
            <div className="flex justify-between border-t pt-3 text-base font-bold text-primary"><dt>Total</dt><dd>{inr(total)}</dd></div>
          </dl>
          {remaining > 0 && <p className="mt-3 rounded-xl bg-surface-low p-3 text-xs text-muted-foreground">Add {inr(remaining)} more for free delivery.</p>}
          <Link to="/checkout" className="btn btn-primary mt-5 w-full">Proceed to Checkout</Link>
          {s?.whatsapp && (
            <a
              href={waLink(s.whatsapp, orderMessage({ storeName: s.store_name, items: cart.items, subtotal: cart.subtotal, delivery, total }))}
              target="_blank" rel="noreferrer" className="btn btn-whatsapp mt-3 w-full"
            >
              <MessageCircle className="h-4 w-4" /> Order this bag on WhatsApp
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
