import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, MessageCircle, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { settingsQuery } from "@/lib/store";
import { site } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop All" },
  { to: "/shop", label: "Sarees", search: { category: "sarees" } },
  { to: "/shop", label: "Women's Wear", search: { category: "womens-clothing" } },
  { to: "/shop", label: "Girls' Outfits", search: { category: "girls-dresses" } },
  { to: "/shop", label: "Bangles & Jewellery", search: { category: "gold-jewellery" } },
  { to: "/about", label: "About Boutique" },
  { to: "/contact", label: "Contact & WhatsApp" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const { data: s } = useQuery(settingsQuery());
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: q.trim() || undefined } });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 shadow-soft backdrop-blur-md">
      <div className="bg-primary px-4 py-2 text-center text-gold">
        <p className="eyebrow inline-flex flex-wrap items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Free shipping across India on orders above ₹{Number(s?.free_delivery_threshold ?? 1999).toLocaleString("en-IN")}
          {s?.whatsapp && (
            <a
              className="ml-2 inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary-foreground"
              href={waLink(s.whatsapp, "Namaste! I'd like to place an order.")}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden /> Order on WhatsApp →
            </a>
          )}
        </p>
      </div>
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src={site("1")} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
          <div className="min-w-0">
            <span className="block truncate font-display text-lg text-primary sm:text-2xl">
              {s?.store_name ?? "Varam Vastra & Jewels"}
            </span>
            <span className="hidden truncate text-[10px] font-bold uppercase tracking-widest text-secondary sm:block">
              {s?.tagline}
            </span>
          </div>
        </Link>
        <form onSubmit={submit} className="relative mx-6 hidden max-w-md flex-1 xl:block" role="search">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="field rounded-full pl-11"
            placeholder="Search sarees, bangles, jewellery..."
            aria-label="Search products"
          />
        </form>
        <div className="flex shrink-0 items-center gap-1">
          <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-primary" aria-label={`Cart, ${count} items`}>
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <button className="p-2 text-muted-foreground lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      <nav className="hidden border-t lg:block" aria-label="Main">
        <ul className="container-page flex h-12 items-center justify-center gap-8 text-sm font-medium">
          {NAV.map((n) => (
            <li key={n.label}>
              <Link
                to={n.to}
                search={"search" in n ? n.search : undefined}
                className="text-muted-foreground transition-colors hover:text-primary"
                activeOptions={{ exact: true, includeSearch: true }}
                activeProps={{ className: "text-primary border-b-2 border-primary pb-1" }}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {open && (
        <div className="border-t bg-background lg:hidden">
          <form onSubmit={submit} className="container-page pt-4" role="search">
            <input value={q} onChange={(e) => setQ(e.target.value)} className="field rounded-full" placeholder="Search products..." aria-label="Search products" />
          </form>
          <ul className="container-page grid gap-1 py-4">
            {NAV.map((n) => (
              <li key={n.label}>
                <Link
                  to={n.to}
                  search={"search" in n ? n.search : undefined}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-foreground hover:bg-accent"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
