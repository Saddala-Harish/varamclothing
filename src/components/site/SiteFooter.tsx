import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { settingsQuery } from "@/lib/store";
import { CATEGORIES } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";

export function SiteFooter() {
  const { data: s } = useQuery(settingsQuery());
  return (
    <footer className="mt-20 border-t bg-surface-low">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl text-primary">{s?.store_name}</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            From humble WhatsApp Status beginnings to your doorstep — handpicked sarees, ethnic wear and 1-gram gold jewellery.
          </p>
        </div>
        <div>
          <p className="font-display text-lg text-primary">Our Collections</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to="/shop" search={{ category: c.slug }} className="hover:text-primary">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-display text-lg text-primary">Care & Policies</p>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{s?.shipping_policy}</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{s?.return_policy}</p>
        </div>
        <div>
          <p className="font-display text-lg text-primary">Boutique Concierge</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />{s?.address}</li>
            <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /><a href={`tel:${s?.phone}`}>{s?.phone}</a></li>
            {s?.whatsapp && (
              <li className="flex gap-2"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /><a href={waLink(s.whatsapp, "Namaste!")} target="_blank" rel="noreferrer">Chat on WhatsApp</a></li>
            )}
            <li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />{s?.business_hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {s?.store_name}. Handcrafted with reverence.</span>
          <Link to="/admin" className="hover:text-primary">Store admin</Link>
        </div>
      </div>
    </footer>
  );
}
