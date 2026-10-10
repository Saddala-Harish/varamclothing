import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { productQuery, productsQuery, settingsQuery } from "@/lib/store";
import { categoryName, discountPct, img, inr } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { waLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const name = params.slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
    return {
      meta: [
        { title: `${name} — Varam Vastra & Jewels` },
        { name: "description", content: `Shop ${name} at Varam Vastra & Jewels. Pan-India delivery, UPI & Cash on Delivery.` },
        { property: "og:title", content: `${name} — Varam Vastra & Jewels` },
        { property: "og:description", content: `${name}, handpicked by our boutique stylist.` },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p, isLoading } = useQuery(productQuery(slug));
  const { data: all } = useQuery(productsQuery());
  const { data: s } = useQuery(settingsQuery());
  const cart = useCart();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setActive(0);
    setQty(1);
    setSize(p?.sizes[0]);
    setColor(p?.colors[0]);
  }, [p?.id]);

  if (isLoading) {
    return (
      <div className="container-page grid animate-pulse gap-10 py-10 lg:grid-cols-2">
        <div className="aspect-[4/5] rounded-3xl bg-muted" />
        <div className="space-y-4"><div className="h-10 w-3/4 rounded bg-muted" /><div className="h-6 w-1/3 rounded bg-muted" /></div>
      </div>
    );
  }
  if (!p) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl text-primary">Product not found</h1>
        <Link to="/shop" className="btn btn-primary mt-6">Back to shop</Link>
      </div>
    );
  }

  const off = discountPct(Number(p.price), p.mrp ? Number(p.mrp) : null);
  const out = p.stock <= 0;
  const maxQty = Math.min(p.stock, 10);

  const addToCart = () => {
    if (p.sizes.length && !size) return toast.error("Please choose a size");
    cart.add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0] ?? "", price: Number(p.price), size, color, quantity: qty, stock: p.stock });
    return true;
  };

  const enquiry = [
    `Namaste! I'm interested in *${p.name}* (${inr(p.price)}).`,
    size && `Size: ${size}`,
    color && `Colour: ${color}`,
    `Quantity: ${qty}`,
    typeof window !== "undefined" ? window.location.href : "",
  ].filter(Boolean).join("\n");

  const related = all?.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4) ?? [];

  return (
    <div className="container-page py-8">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/shop" search={{ category: p.category }} className="hover:text-primary">{categoryName(p.category)}</Link> / <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-3xl bg-muted">
            <img src={img(p.images[active])} alt={p.name} className="aspect-[4/5] w-full object-cover" />
            {p.best_seller && <span className="eyebrow absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5 text-primary-foreground">Bestseller</span>}
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {p.images.map((im, i) => (
                <button key={i} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`} className={`overflow-hidden rounded-xl border-2 ${i === active ? "border-primary" : "border-transparent"}`}>
                  <img src={img(im)} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-card p-6 shadow-soft sm:p-8">
          <p className="eyebrow text-secondary">{categoryName(p.category)}</p>
          <h1 className="mt-2 text-3xl leading-tight text-primary sm:text-4xl">{p.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-surface-low p-4">
            <span className="font-display text-3xl text-primary">{inr(p.price)}</span>
            {off > 0 && (
              <>
                <span className="text-muted-foreground line-through">{inr(p.mrp)}</span>
                <span className="eyebrow rounded-full bg-gold-soft px-2.5 py-1 text-primary">{off}% off</span>
              </>
            )}
            <span className="text-xs text-muted-foreground">Incl. all taxes</span>
          </div>

          <p className={`mt-4 rounded-full px-4 py-2 text-sm font-medium ${out ? "bg-muted text-muted-foreground" : p.stock <= 5 ? "bg-primary-soft text-primary" : "bg-surface-low text-success"}`}>
            {out ? "Currently out of stock — enquire on WhatsApp for restock" : p.stock <= 5 ? `Limited stock: only ${p.stock} left` : "In stock, ready to ship"}
          </p>

          {p.colors.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">Colour: <span className="font-normal text-muted-foreground">{color}</span></legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} aria-pressed={color === c} className={`btn px-4 py-2 ${color === c ? "btn-primary" : "btn-outline"}`}>{c}</button>
                ))}
              </div>
            </fieldset>
          )}
          {p.sizes.length > 0 && (
            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Size</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.sizes.map((sz) => (
                  <button key={sz} onClick={() => setSize(sz)} aria-pressed={size === sz} className={`btn min-w-14 px-4 py-2 ${size === sz ? "btn-primary" : "btn-outline"}`}>{sz}</button>
                ))}
              </div>
            </fieldset>
          )}

          {!out && (
            <div className="mt-5 flex items-center gap-4">
              <span className="text-sm font-semibold">Quantity</span>
              <div className="flex items-center rounded-full border bg-surface-low">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
                <button onClick={() => setQty(Math.min(maxQty, qty + 1))} className="p-3" aria-label="Increase"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button disabled={out} onClick={() => addToCart() && toast.success("Added to your bag")} className="btn btn-outline">
              <ShoppingBag className="h-4 w-4" /> Add to Bag
            </button>
            <button disabled={out} onClick={() => addToCart() && navigate({ to: "/checkout" })} className="btn btn-primary">
              <Zap className="h-4 w-4" /> Buy It Now
            </button>
          </div>
          {s?.whatsapp && (
            <a href={waLink(s.whatsapp, enquiry)} target="_blank" rel="noreferrer" className="btn btn-whatsapp mt-3 w-full">
              <MessageCircle className="h-4 w-4" /> Enquire & Order on WhatsApp
            </a>
          )}

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            <div className="rounded-xl border p-3"><ShieldCheck className="mx-auto mb-1 h-4 w-4 text-secondary" />Quality checked</div>
            <div className="rounded-xl border p-3"><RotateCcw className="mx-auto mb-1 h-4 w-4 text-secondary" />7-day exchange</div>
            <div className="rounded-xl border p-3"><Truck className="mx-auto mb-1 h-4 w-4 text-secondary" />Insured transit</div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl text-primary">Description</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{p.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-3xl text-primary">You may also love</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
