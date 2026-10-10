import { Link } from "@tanstack/react-router";
import { categoryName, discountPct, img, inr } from "@/lib/format";
import type { Product } from "@/lib/store";

export function ProductCard({ p }: { p: Product }) {
  const off = discountPct(Number(p.price), p.mrp ? Number(p.mrp) : null);
  const out = p.stock <= 0;
  return (
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition-shadow hover:shadow-card"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={img(p.images[0])}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {p.new_arrival && <span className="eyebrow rounded-full bg-primary px-2.5 py-1 text-primary-foreground">New</span>}
          {p.best_seller && <span className="eyebrow rounded-full bg-gold-soft px-2.5 py-1 text-primary">Bestseller</span>}
        </div>
        {out && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="eyebrow rounded-full bg-foreground px-3 py-1.5 text-background">Out of stock</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="eyebrow text-secondary">{categoryName(p.category)}</span>
        <h3 className="mt-1 line-clamp-2 font-display text-base text-foreground">{p.name}</h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-3">
          <span className="text-lg font-bold text-primary">{inr(p.price)}</span>
          {off > 0 && (
            <>
              <span className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>
              <span className="text-xs font-semibold text-success">{off}% off</span>
            </>
          )}
        </div>
        {!out && p.stock <= 5 && <span className="mt-1 text-xs text-destructive">Only {p.stock} left</span>}
      </div>
    </Link>
  );
}

export function ProductGridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-card">
          <div className="aspect-[4/5] bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
