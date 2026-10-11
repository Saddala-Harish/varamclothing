import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { orderQuery, settingsQuery } from "@/lib/store";
import { img, inr } from "@/lib/format";
import { orderMessage, waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order Received — Varam Vastra & Jewels" },
      { name: "description", content: "Your order summary and delivery details." },
      { property: "og:title", content: "Order Received — Varam Vastra & Jewels" },
      { property: "og:description", content: "Thank you for shopping with Varam Vastra & Jewels." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

type Line = { name: string; image: string; price: number; quantity: number; size?: string | null; color?: string | null };

function OrderPage() {
  const { id } = Route.useParams();
  const { data: o, isLoading, error } = useQuery(orderQuery(id));
  const { data: s } = useQuery(settingsQuery());

  if (isLoading) return <div className="container-page py-20"><div className="mx-auto h-64 max-w-3xl animate-pulse rounded-3xl bg-muted" /></div>;
  if (error || !o) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl text-primary">Order not found</h1>
        <Link to="/shop" className="btn btn-primary mt-6">Continue shopping</Link>
      </div>
    );
  }

  const items = o.items as unknown as Line[];
  const address = [o.address_line, o.landmark, o.city, o.state, o.pincode].filter(Boolean).join(", ");
  const payLabel = o.payment_method === "upi" ? "UPI" : "Cash on Delivery";
  const msg = orderMessage({
    storeName: s?.store_name ?? "",
    orderRef: o.order_ref,
    items,
    subtotal: Number(o.subtotal),
    delivery: Number(o.delivery_charge),
    total: Number(o.total),
    customer: { name: o.customer_name, phone: o.phone, address, payment: payLabel },
  });

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-hero p-8 text-center text-primary-foreground">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
          <h1 className="mt-4 text-3xl sm:text-4xl">Thank you, {o.customer_name.split(" ")[0]}!</h1>
          <p className="mt-2 text-primary-foreground/80">Your order has been received.</p>
          <p className="mt-4 inline-block rounded-full bg-card px-5 py-2 font-mono text-lg font-bold text-primary">{o.order_ref}</p>
        </div>

        <div className="mt-6 rounded-3xl border bg-surface-low p-6">
          <p className="font-semibold text-primary">Payment: {payLabel} · <span className="text-muted-foreground">Not yet paid</span></p>
          {o.payment_method === "upi" ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Please pay <strong className="text-foreground">{inr(o.total)}</strong> to UPI ID <strong className="text-foreground">{s?.upi_id}</strong> with reference <strong className="text-foreground">{o.order_ref}</strong>, then send the screenshot on WhatsApp. We'll confirm your order once payment is verified.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Keep <strong className="text-foreground">{inr(o.total)}</strong> ready in cash at delivery. We'll call you on {o.phone} to confirm before dispatch.</p>
          )}
          {s?.whatsapp && (
            <a href={waLink(s.whatsapp, msg)} target="_blank" rel="noreferrer" className="btn btn-whatsapp mt-4">
              <MessageCircle className="h-4 w-4" /> Send order details on WhatsApp
            </a>
          )}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <section className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="text-lg text-primary">Delivery details</h2>
            <p className="mt-3 text-sm font-medium">{o.customer_name}</p>
            <p className="text-sm text-muted-foreground">{address}</p>
            <p className="mt-2 text-sm text-muted-foreground">📞 {o.phone}</p>
          </section>
          <section className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="text-lg text-primary">What happens next</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>We review your order and confirm on WhatsApp/phone.</li>
              <li>Your parcel is packed and dispatched.</li>
              <li>{s?.shipping_policy}</li>
            </ol>
          </section>
        </div>

        <section className="mt-6 rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="text-lg text-primary">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i, n) => (
              <li key={n} className="flex gap-3 text-sm">
                <img src={img(i.image)} alt="" className="h-16 w-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{[i.size, i.color].filter(Boolean).join(" · ")} × {i.quantity}</p>
                </div>
                <span className="font-semibold">{inr(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(o.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{Number(o.delivery_charge) === 0 ? "Free" : inr(o.delivery_charge)}</dd></div>
            <div className="flex justify-between border-t pt-3 text-base font-bold text-primary"><dt>Total</dt><dd>{inr(o.total)}</dd></div>
          </dl>
        </section>
        <div className="mt-8 text-center"><Link to="/shop" className="btn btn-outline">Continue shopping</Link></div>
      </div>
    </div>
  );
}
