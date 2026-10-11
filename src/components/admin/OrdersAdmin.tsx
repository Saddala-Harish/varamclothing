import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
type Line = { name: string; quantity: number; size?: string | null; color?: string | null };

export function OrdersAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });

  const update = async (id: string, patch: { status?: string; payment_status?: string }) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-muted" />;
  if (!data?.length) return <p className="rounded-2xl bg-card p-10 text-center text-muted-foreground">No orders yet.</p>;

  return (
    <ul className="space-y-4">
      {data.map((o) => (
        <li key={o.id} className="rounded-2xl bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono font-bold text-primary">{o.order_ref}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</p>
            </div>
            <p className="text-lg font-bold text-primary">{inr(o.total)}</p>
          </div>
          <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-medium">{o.customer_name} · <a href={`tel:${o.phone}`} className="text-primary">{o.phone}</a></p>
              <p className="text-muted-foreground">{[o.address_line, o.landmark, o.city, o.state, o.pincode].filter(Boolean).join(", ")}</p>
              {o.notes && <p className="mt-1 italic text-muted-foreground">“{o.notes}”</p>}
            </div>
            <ul className="text-muted-foreground">
              {(o.items as unknown as Line[]).map((i, n) => <li key={n}>{i.name} {[i.size, i.color].filter(Boolean).join("/")} × {i.quantity}</li>)}
            </ul>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-surface-low px-3 py-1">{o.payment_method === "upi" ? "UPI" : "COD"}</span>
            <label className="flex items-center gap-2">Payment
              <select className="field w-auto py-1.5" value={o.payment_status} onChange={(e) => update(o.id, { payment_status: e.target.value })}>
                <option value="unpaid">Unpaid</option><option value="paid">Paid (verified)</option><option value="refunded">Refunded</option>
              </select>
            </label>
            <label className="flex items-center gap-2">Status
              <select className="field w-auto py-1.5 capitalize" value={o.status} onChange={(e) => update(o.id, { status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
        </li>
      ))}
    </ul>
  );
}
