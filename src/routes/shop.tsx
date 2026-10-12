import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo } from "react";
import { productsQuery } from "@/lib/store";
import { CATEGORIES, categoryName } from "@/lib/format";
import { ProductCard, ProductGridSkeleton } from "@/components/site/ProductCard";

type ShopSearch = { q?: string | undefined; category?: string | undefined; sort?: "new" | "price-asc" | "price-desc" | "name" | undefined; stock?: "in" | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    category: typeof s["category"] === "string" && s["category"] ? s["category"] : undefined,
    sort: ["new", "price-asc", "price-desc", "name"].includes(s["sort"] as string) ? (s["sort"] as ShopSearch["sort"]) : undefined,
    stock: s["stock"] === "in" ? "in" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop Collections — Varam Vastra & Jewels" },
      { name: "description", content: "Browse sarees, women's clothing, girls' dresses, bangles and 1-gram gold jewellery with prices in ₹." },
      { property: "og:title", content: "Shop Collections — Varam Vastra & Jewels" },
      { property: "og:description", content: "Browse our full boutique: sarees, ethnic wear, bangles and temple jewellery." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { data, isLoading, error, refetch } = useQuery(productsQuery());
  const set = (patch: Partial<ShopSearch>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const list = useMemo(() => {
    let l = data ?? [];
    if (search.category) l = l.filter((p) => p.category === search.category);
    if (search.stock) l = l.filter((p) => p.stock > 0);
    if (search.q) {
      const q = search.q.toLowerCase();
      l = l.filter((p) => `${p.name} ${p.description} ${categoryName(p.category)}`.toLowerCase().includes(q));
    }
    const sorted = [...l];
    if (search.sort === "price-asc") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (search.sort === "price-desc") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    if (search.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (search.sort === "new") sorted.sort((a, b) => Number(b.new_arrival) - Number(a.new_arrival));
    return sorted;
  }, [data, search]);

  return (
    <div className="container-page py-10">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">Home</Link> / <span>Shop</span>
        {search.category && <> / <span className="text-foreground">{categoryName(search.category)}</span></>}
      </nav>
      <h1 className="mt-3 text-4xl text-primary">{search.category ? categoryName(search.category) : "All Collections"}</h1>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => set({ category: undefined })} className={`btn shrink-0 px-4 py-2 ${!search.category ? "btn-primary" : "btn-outline"}`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.slug} onClick={() => set({ category: c.slug })} className={`btn shrink-0 px-4 py-2 ${search.category === c.slug ? "btn-primary" : "btn-outline"}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <span className="sr-only">Search</span>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            defaultValue={search.q}
            key={search.q}
            onChange={(e) => set({ q: e.target.value || undefined })}
            className="field rounded-full pl-11"
            placeholder="Search sarees, bangles, jewellery..."
          />
        </label>
        <select aria-label="Sort" value={search.sort ?? ""} onChange={(e) => set({ sort: (e.target.value || undefined) as ShopSearch["sort"] })} className="field rounded-full">
          <option value="">Sort: Featured</option>
          <option value="new">New arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </select>
        <label className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
          <input type="checkbox" checked={!!search.stock} onChange={(e) => set({ stock: e.target.checked ? "in" : undefined })} />
          In stock only
        </label>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <ProductGridSkeleton />
        ) : error ? (
          <div className="rounded-2xl bg-card p-8 text-center">
            <p className="text-destructive">Couldn't load products.</p>
            <button onClick={() => refetch()} className="btn btn-outline mt-4">Retry</button>
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl bg-card p-12 text-center">
            <p className="font-display text-xl text-primary">No products found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a different search or category.</p>
            <button onClick={() => navigate({ search: {} })} className="btn btn-outline mt-4">Clear filters</button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{list.length} products</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
