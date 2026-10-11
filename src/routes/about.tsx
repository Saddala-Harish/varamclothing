import { createFileRoute, Link } from "@tanstack/react-router";
import { site } from "@/lib/format";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Varam Vastra & Jewels" },
      { name: "description", content: "How a home-based WhatsApp Status boutique grew into Varam Vastra & Jewels — handpicked sarees, ethnic wear and 1-gram gold jewellery." },
      { property: "og:title", content: "Our Story — Varam Vastra & Jewels" },
      { property: "og:description", content: "From WhatsApp Status drops to a cherished online boutique." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="bg-hero text-primary-foreground">
        <div className="container-page py-16 text-center">
          <p className="eyebrow text-gold">Our Story</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl sm:text-5xl">A boutique born from love, trust and WhatsApp Status</h1>
        </div>
      </section>
      <section className="container-page mt-16 grid items-center gap-10 lg:grid-cols-2">
        <img src={site("19")} alt="Our founder inspecting a handloom saree" className="aspect-[4/5] w-full rounded-3xl object-cover shadow-card" />
        <div className="space-y-5 leading-7 text-muted-foreground">
          <h2 className="text-3xl text-primary">Where it began</h2>
          <p>Varam started at home — a few handpicked Kanjivaram sarees and temple jewellery pieces shared on WhatsApp Status with friends, neighbours and family. Word spread, and every new lot sold out within days.</p>
          <p>Our patrons trusted us because we chose every piece as if we were buying it for ourselves: honest photos, genuine fabrics and personal video calls so you could see the drape before you decide.</p>
          <p>Today we're bringing that same personal care online — so women across India can shop sarees, ethnic wear, girls' pattu pavadai, bangles and 1-gram gold jewellery with confidence.</p>
        </div>
      </section>
      <section className="container-page mt-20 grid gap-6 md:grid-cols-3">
        {[
          { img: "3", t: "From the looms", d: "Sourced directly from weaver clusters in Kanchipuram, Banaras and beyond." },
          { img: "4", t: "Honest quality", d: "Pure silks and carefully plated 1-gram gold, described exactly as they are." },
          { img: "5", t: "Artisan crafted", d: "Temple jewellery set by hand by skilled craftspeople." },
        ].map((v) => (
          <div key={v.t} className="overflow-hidden rounded-3xl bg-card shadow-soft">
            <img src={site(v.img)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="p-6"><h3 className="text-xl text-primary">{v.t}</h3><p className="mt-2 text-sm text-muted-foreground">{v.d}</p></div>
          </div>
        ))}
      </section>
      <div className="mt-16 text-center"><Link to="/shop" className="btn btn-primary">Explore the collection</Link></div>
    </>
  );
}
