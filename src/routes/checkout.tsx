import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { settingsQuery } from "@/lib/store";
import { deliveryFor, img, inr, INDIAN_STATES } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Varam Vastra & Jewels" },
      { name: "description", content: "Enter your delivery address and choose UPI or Cash on Delivery." },
      { property: "og:title", content: "Checkout — Varam Vastra & Jewels" },
      { property: "og:description", content: "Secure checkout with UPI or Cash on Delivery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

type Form = { customer_name: string; phone: string; email: string; address_line: string; landmark: string; city: string; state: string; pincode: string; payment_method: string; notes: string };
const EMPTY: Form = { customer_name: "", phone: "", email: "", address_line: "", landmark: "", city: "", state: "", pincode: "", payment_method: "", notes: "" };

export function validateCheckout(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (!f.customer_name.trim()) e.customer_name = "Please enter your full name";
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = "Enter a valid 10-digit mobile number";
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
  if (!f.address_line.trim()) e.address_line = "Please enter your house / street address";
  if (!f.city.trim()) e.city = "Please enter your city";
  if (!f.state) e.state = "Please select your state";
  if (!/^[1-9]\d{5}$/.test(f.pincode)) e.pincode = "Enter a valid 6-digit PIN code";
  if (!f.payment_method) e.payment_method = "Choose a payment method";
  return e;
}

function Checkout() {
  const cart = useCart();
  const { data: s } = useQuery(settingsQuery());
  const navigate = useNavigate();
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState(false);
  const delivery = deliveryFor(cart.subtotal, Number(s?.delivery_charge ?? 0), Number(s?.free_delivery_threshold ?? 0));

  const up = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF({ ...f, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  if (!cart.hydrated) return <div className="container-page py-20"><div className="h-40 animate-pulse rounded-3xl bg-muted" /></div>;
  if (cart.items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl text-primary">Your bag is empty</h1>
        <Link to="/shop" className="btn btn-primary mt-6">Continue shopping</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateCheckout(f);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted fields");
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("place_order", {
      _customer: f,
      _items: cart.items.map((i) => ({ product_id: i.productId, quantity: i.quantity, size: i.size ?? null, color: i.color ?? null })),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Couldn't place your order. Please try again.");
      return;
    }
    const res = data as { id: string; order_ref: string };
    cart.clear();
    navigate({ to: "/order/$id", params: { id: res.id } });
  };

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, required = true) => (
    <div>
      <label htmlFor={`f-${k}`} className="mb-1 block text-sm font-medium">{label}{required && <span className="text-destructive"> *</span>}</label>
      <input id={`f-${k}`} value={f[k]} onChange={up(k)} className="field" aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `e-${k}` : undefined} {...props} />
      {errors[k] && <p id={`e-${k}`} className="mt-1 text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl text-primary">Checkout</h1>
      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="text-xl text-primary">Contact details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {field("customer_name", "Full name", { autoComplete: "name" })}
              {field("phone", "Mobile number", { inputMode: "numeric", maxLength: 10, autoComplete: "tel-national", placeholder: "10-digit mobile" })}
              <div className="sm:col-span-2">{field("email", "Email (optional)", { type: "email", autoComplete: "email" }, false)}</div>
            </div>
          </section>
          <section className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="text-xl text-primary">Delivery address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{field("address_line", "House no., building, street, area", { autoComplete: "street-address" })}</div>
              <div className="sm:col-span-2">{field("landmark", "Landmark (optional)", {}, false)}</div>
              {field("city", "City / Town", { autoComplete: "address-level2" })}
              <div>
                <label htmlFor="f-state" className="mb-1 block text-sm font-medium">State<span className="text-destructive"> *</span></label>
                <select id="f-state" value={f.state} onChange={up("state")} className="field" aria-invalid={!!errors.state}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((st) => <option key={st}>{st}</option>)}
                </select>
                {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state}</p>}
              </div>
              {field("pincode", "PIN code", { inputMode: "numeric", maxLength: 6, autoComplete: "postal-code" })}
            </div>
          </section>
          <section className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="text-xl text-primary">Payment preference</h2>
            <div className="mt-4 grid gap-3" role="radiogroup" aria-label="Payment method">
              {s?.upi_enabled && (
                <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${f.payment_method === "upi" ? "border-primary bg-surface-low" : ""}`}>
                  <input type="radio" name="pay" id="f-payment_method" value="upi" checked={f.payment_method === "upi"} onChange={up("payment_method")} />
                  <div>
                    <p className="font-semibold">UPI (GPay, PhonePe, Paytm)</p>
                    <p className="text-xs text-muted-foreground">After placing the order, pay to our UPI ID and share the screenshot on WhatsApp. We confirm your order once payment is verified.</p>
                  </div>
                </label>
              )}
              {s?.cod_enabled && (
                <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${f.payment_method === "cod" ? "border-primary bg-surface-low" : ""}`}>
                  <input type="radio" name="pay" value="cod" checked={f.payment_method === "cod"} onChange={up("payment_method")} />
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay in cash when your parcel arrives.</p>
                  </div>
                </label>
              )}
              {errors.payment_method && <p className="text-xs text-destructive">{errors.payment_method}</p>}
            </div>
            <label htmlFor="f-notes" className="mb-1 mt-5 block text-sm font-medium">Order notes (optional)</label>
            <textarea id="f-notes" value={f.notes} onChange={up("notes")} rows={2} className="field" placeholder="Blouse stitching, gift wrap, preferred delivery time..." />
          </section>
        </div>

        <aside className="h-fit rounded-3xl bg-card p-6 shadow-soft lg:sticky lg:top-40">
          <h2 className="text-xl text-primary">Your order</h2>
          <ul className="mt-4 space-y-3">
            {cart.items.map((i) => (
              <li key={`${i.productId}${i.size}${i.color}`} className="flex gap-3 text-sm">
                <img src={img(i.image)} alt="" className="h-16 w-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{[i.size, i.color].filter(Boolean).join(" · ")} × {i.quantity}</p>
                </div>
                <span className="font-semibold">{inr(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(cart.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{delivery === 0 ? "Free" : inr(delivery)}</dd></div>
            <div className="flex justify-between border-t pt-3 text-base font-bold text-primary"><dt>Total</dt><dd>{inr(cart.subtotal + delivery)}</dd></div>
          </dl>
          <button type="submit" disabled={busy} className="btn btn-primary mt-5 w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Place Order
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Final prices and stock are confirmed when you place the order.</p>
        </aside>
      </form>
    </div>
  );
}
