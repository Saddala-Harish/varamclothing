import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, BadgeCheck, MessageCircle, Truck, Video } from "lucide-react";
import { productsQuery, settingsQuery } from "@/lib/store";
import { CATEGORIES, inr, site } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import { ProductCard, ProductGridSkeleton } from "@/components/site/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Varam Vastra & Jewels — Where Tradition Meets Sacred Grace" },
      { name: "description", content: "Shop handcrafted Kanjivaram sarees, ethnic wear, girls' pattu pavadai, bangles and 1-gram gold temple jewellery. Pan-India delivery, UPI & COD." },
      { property: "og:title", content: "Varam Vastra & Jewels — Indian Boutique" },
      { property: "og:description", content: "Handpicked sarees, ethnic wear, bangles and 1-gram gold jewellery delivered across India." },
    ],
  }),
  component: Home,
});

const CAT_IMG: Record<string, string> = {
  sarees: "9",
  "gold-jewellery": "11",
  "womens-clothing": "12",
  bangles: "13",
  "girls-dresses": "14",
};

function Section({ eyebrow, title, link, children }: { eyebrow: string; title: string; link?: boolean; children: React.ReactNode }) {
  return (
    <section className="container-page mt-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-secondary">{eyebrow}</p>
          <h2 className="mt-2 text-3xl text-primary sm:text-4xl">{title}</h2>
        </div>
        {link && (
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Home() {
  const { data: products, isLoading, error } = useQuery(productsQuery());
  const { data: s } = useQuery(settingsQuery());
  const hero = products?.find((p) => p.featured && p.category === "sarees");

  const grid = (list: typeof products) =>
    isLoading ? (
      <ProductGridSkeleton n={4} />
    ) : error ? (
      <p className="text-destructive">Couldn't load products. Please refresh.</p>
    ) : (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list?.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    );

  return (
    <>
      {/* Hero */}
      <section className="bg-hero text-primary-foreground">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="eyebrow inline-flex rounded-full bg-gold-soft px-3 py-1.5 text-primary">Festive Heritage Collection</span>
            <h1 className="mt-6 text-4xl leading-tight sm:text-6xl">
              Where Tradition <br />
              <em className="text-gold">Meets Sacred Grace</em>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-primary-foreground/80">
              Handcrafted royal weaves, bespoke bridal silks, antique temple heirlooms and artisan-stacked glass bangles — curated from
              sovereign looms to your cherished celebrations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn btn-gold">Explore Collection <ArrowRight className="h-4 w-4" /></Link>
              {s?.whatsapp && (
                <a href={waLink(s.whatsapp, "Namaste! I'd like to see your latest collection.")} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                  <MessageCircle className="h-4 w-4" /> Order on WhatsApp
                </a>
              )}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <img src={site("10")} alt="Bride draped in a crimson Kanjivaram saree" className="aspect-[4/5] w-full rounded-3xl object-cover shadow-card" />
            {hero && (
              <Link
                to="/product/$slug"
                params={{ slug: hero.slug }}
                className="absolute -bottom-6 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl bg-card p-4 text-foreground shadow-card"
              >
                <div className="min-w-0">
                  <p className="eyebrow text-secondary">Special Royal Weave</p>
                  <p className="truncate font-display text-lg text-primary">{hero.name}</p>
                </div>
                <span className="shrink-0 text-lg font-bold text-primary">{inr(hero.price)}</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b bg-surface-low">
        <div className="container-page grid gap-4 py-6 text-sm sm:grid-cols-3">
          {[
            { i: BadgeCheck, t: "100% Handpicked Quality", d: "Each piece checked by our stylist" },
            { i: Truck, t: "Insured Pan-India Shipping", d: `Free above ${inr(s?.free_delivery_threshold ?? 1999)}` },
            { i: Video, t: "Video Call Shopping", d: "See the drape live on WhatsApp" },
          ].map(({ i: I, t, d }) => (
            <div key={t} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-primary"><I className="h-5 w-5" /></span>
              <div><p className="font-semibold text-foreground">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <Section eyebrow="Artisanal Discovery" title="Shop by Royal Category">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className={`group relative overflow-hidden rounded-3xl ${i < 2 ? "col-span-2 aspect-[16/10] lg:col-span-3" : i === 4 ? "col-span-2 aspect-[16/10] lg:col-span-2 lg:aspect-[4/5]" : "aspect-[4/5] lg:col-span-2"}`}
            >
              <img src={site(CAT_IMG[c.slug] ?? "9")} alt={c.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 p-5 text-primary-foreground">
                <div>
                  <h3 className="text-xl sm:text-2xl">{c.name}</h3>
                  <p className="text-xs text-primary-foreground/80">{c.blurb}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-primary"><ArrowUpRight className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Curated by Priya" title="Featured Pieces" link>{grid(products?.filter((p) => p.featured))}</Section>

      {/* Offer banner */}
      <section className="container-page mt-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-hero p-8 text-primary-foreground sm:p-12 lg:flex-row lg:items-center">
          <div>
            <p className="eyebrow text-gold">Festive Offer</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Up to 25% off + free delivery above {inr(s?.free_delivery_threshold ?? 1999)}</h2>
            <p className="mt-2 text-primary-foreground/80">Unsure of the drape or colour? Book a free WhatsApp video call with our stylist.</p>
          </div>
          {s?.whatsapp && (
            <a href={waLink(s.whatsapp, "Namaste! I'd like to book a video call to see some pieces.")} target="_blank" rel="noreferrer" className="btn btn-whatsapp shrink-0">
              <Video className="h-4 w-4" /> Book Video Call
            </a>
          )}
        </div>
      </section>

      <Section eyebrow="Fresh from the looms" title="New Arrivals" link>{grid(products?.filter((p) => p.new_arrival))}</Section>
      <Section eyebrow="Loved by our patrons" title="Best Sellers" link>{grid(products?.filter((p) => p.best_seller))}</Section>

      {/* Story */}
      <section className="container-page mt-20 grid items-center gap-10 lg:grid-cols-2">
        <img src={site("19")} alt="Priya, founder, inspecting a handloom saree" loading="lazy" className="aspect-[4/5] w-full rounded-3xl object-cover shadow-card" />
        <div>
          <p className="eyebrow text-secondary">Our story</p>
          <h2 className="mt-2 text-3xl text-primary sm:text-4xl">From Daily WhatsApp Status Drops to a Cherished Atelier</h2>
          <p className="mt-5 leading-7 text-muted-foreground">
            Varam began in a living room — sharing handpicked Kanjivarams and 1-gram gold jewellery with friends and family on
            WhatsApp Status. Today, the same personal care reaches homes across India.
          </p>
          <Link to="/about" className="mt-6 inline-flex items-center gap-1 font-semibold text-primary hover:underline">Read our story <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* WhatsApp CTA */}
      {s?.whatsapp && (
        <section className="container-page mt-20">
          <div className="rounded-3xl bg-hero px-6 py-14 text-center text-primary-foreground">
            <MessageCircle className="mx-auto h-10 w-10 text-gold" />
            <h2 className="mt-4 text-3xl sm:text-4xl">Get First Look at New Lots on WhatsApp</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">Our one-of-a-kind pieces sell fast. Message us to join our VIP broadcast list.</p>
            <a href={waLink(s.whatsapp, "Namaste! Please add me to your VIP WhatsApp list.")} target="_blank" rel="noreferrer" className="btn btn-whatsapp mt-6">Join WhatsApp VIP Circle</a>
          </div>
        </section>
      )}
    </>
  );
}
