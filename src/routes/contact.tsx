import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { settingsQuery } from "@/lib/store";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Varam Vastra & Jewels" },
      { name: "description", content: "Call or WhatsApp Varam Vastra & Jewels. Store address, business hours and ordering help." },
      { property: "og:title", content: "Contact & WhatsApp — Varam Vastra & Jewels" },
      { property: "og:description", content: "Reach our boutique on phone or WhatsApp." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { data: s, isLoading } = useQuery(settingsQuery());
  const items = s
    ? [
        { i: Phone, t: "Phone", v: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
        { i: MessageCircle, t: "WhatsApp", v: `+${s.whatsapp}`, href: waLink(s.whatsapp, "Namaste! I have a question.") },
        { i: Mail, t: "Email", v: s.email, href: `mailto:${s.email}` },
        { i: Clock, t: "Business hours", v: s.business_hours },
        { i: MapPin, t: "Store address", v: s.address, href: `https://maps.google.com/?q=${encodeURIComponent(s.address)}` },
      ]
    : [];
  return (
    <div className="container-page py-12">
      <p className="eyebrow text-secondary">We're here to help</p>
      <h1 className="mt-2 text-4xl text-primary">Contact & WhatsApp</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Questions about a saree drape, blouse stitching, sizes or an order? Message us anytime — we reply personally.</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="grid gap-4 sm:grid-cols-2">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <li key={i} className="h-28 animate-pulse rounded-3xl bg-muted" />)}
          {items.filter((x) => x.v).map(({ i: I, t, v, href }) => (
            <li key={t} className="rounded-3xl bg-card p-6 shadow-soft">
              <I className="h-6 w-6 text-secondary" />
              <p className="eyebrow mt-3 text-muted-foreground">{t}</p>
              {href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="mt-1 block font-medium text-primary hover:underline">{v}</a> : <p className="mt-1 font-medium">{v}</p>}
            </li>
          ))}
        </ul>
        {s?.whatsapp && (
          <div className="h-fit rounded-3xl bg-hero p-8 text-primary-foreground">
            <MessageCircle className="h-10 w-10 text-gold" />
            <h2 className="mt-4 text-2xl">Order directly on WhatsApp</h2>
            <p className="mt-2 text-sm text-primary-foreground/80">Send us a screenshot of anything you love and we'll take care of the rest.</p>
            <a href={waLink(s.whatsapp, "Namaste! I'd like to place an order.")} target="_blank" rel="noreferrer" className="btn btn-whatsapp mt-6 w-full">Chat on WhatsApp</a>
          </div>
        )}
      </div>
    </div>
  );
}
