import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, type StoreSettings } from "@/lib/store";

const TEXT: [keyof StoreSettings, string][] = [
  ["store_name", "Store name"], ["tagline", "Tagline"], ["phone", "Phone"], ["whatsapp", "WhatsApp number (with country code, digits only, e.g. 919876543210)"],
  ["email", "Email"], ["upi_id", "UPI ID"], ["address", "Store address"], ["business_hours", "Business hours"],
];

export function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery(settingsQuery());
  const [f, setF] = useState<StoreSettings | null>(null);
  useEffect(() => { if (data) setF(data); }, [data]);
  if (!f) return <div className="h-40 animate-pulse rounded-2xl bg-muted" />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id: _id, updated_at: _u, ...rest } = f;
    const { error } = await supabase.from("store_settings").update({ ...rest, delivery_charge: Number(f.delivery_charge), free_delivery_threshold: Number(f.free_delivery_threshold), updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return void toast.error(error.message);
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  return (
    <form onSubmit={save} className="grid gap-4 rounded-3xl bg-card p-6 shadow-soft sm:grid-cols-2">
      {TEXT.map(([k, label]) => (
        <label key={k} className="block"><span className="mb-1 block text-sm font-medium">{label}</span>
          <input className="field" value={String(f[k] ?? "")} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>
      ))}
      <label className="block"><span className="mb-1 block text-sm font-medium">Delivery charge (₹)</span>
        <input type="number" min={0} className="field" value={f.delivery_charge} onChange={(e) => setF({ ...f, delivery_charge: Number(e.target.value) })} /></label>
      <label className="block"><span className="mb-1 block text-sm font-medium">Free delivery at or above (₹)</span>
        <input type="number" min={0} className="field" value={f.free_delivery_threshold} onChange={(e) => setF({ ...f, free_delivery_threshold: Number(e.target.value) })} /></label>
      <div className="flex gap-6 text-sm sm:col-span-2">
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.upi_enabled} onChange={(e) => setF({ ...f, upi_enabled: e.target.checked })} /> Accept UPI</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.cod_enabled} onChange={(e) => setF({ ...f, cod_enabled: e.target.checked })} /> Accept Cash on Delivery</label>
      </div>
      <label className="block sm:col-span-2"><span className="mb-1 block text-sm font-medium">Shipping policy</span>
        <textarea rows={3} className="field" value={f.shipping_policy} onChange={(e) => setF({ ...f, shipping_policy: e.target.value })} /></label>
      <label className="block sm:col-span-2"><span className="mb-1 block text-sm font-medium">Return / exchange policy</span>
        <textarea rows={3} className="field" value={f.return_policy} onChange={(e) => setF({ ...f, return_policy: e.target.value })} /></label>
      <div className="sm:col-span-2"><button className="btn btn-primary">Save settings</button></div>
    </form>
  );
}
