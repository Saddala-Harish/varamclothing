import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, categoryName, img, inr } from "@/lib/format";
import type { Product } from "@/lib/store";

type Draft = {
  id?: string; name: string; slug: string; category: string; description: string; price: string; mrp: string;
  images: string; sizes: string; colors: string; stock: string; featured: boolean; new_arrival: boolean; best_seller: boolean; active: boolean;
};

const blank: Draft = { name: "", slug: "", category: "sarees", description: "", price: "", mrp: "", images: "", sizes: "", colors: "", stock: "0", featured: false, new_arrival: true, best_seller: false, active: true };
const list = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function ProductsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const [edit, setEdit] = useState<Draft | null>(null);
  const [filter, setFilter] = useState("");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["product"] });
  };

  const open = (p?: Product) =>
    setEdit(p ? {
      id: p.id, name: p.name, slug: p.slug, category: p.category, description: p.description, price: String(p.price), mrp: p.mrp ? String(p.mrp) : "",
      images: p.images.join("\n"), sizes: p.sizes.join(", "), colors: p.colors.join(", "), stock: String(p.stock),
      featured: p.featured, new_arrival: p.new_arrival, best_seller: p.best_seller, active: p.active,
    } : blank);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const price = Number(edit.price);
    const stock = parseInt(edit.stock, 10);
    if (!edit.name.trim() || !(price >= 0) || edit.price === "" || !(stock >= 0)) return void toast.error("Name, a valid price and stock are required");
    const row = {
      name: edit.name.trim(), slug: edit.slug.trim() || slugify(edit.name), category: edit.category, description: edit.description,
      price, mrp: edit.mrp ? Number(edit.mrp) : null, images: list(edit.images), sizes: list(edit.sizes), colors: list(edit.colors), stock,
      featured: edit.featured, new_arrival: edit.new_arrival, best_seller: edit.best_seller, active: edit.active,
    };
    const { error } = edit.id ? await supabase.from("products").update(row).eq("id", edit.id) : await supabase.from("products").insert(row);
    if (error) return void toast.error(error.message);
    toast.success("Product saved");
    setEdit(null);
    refresh();
  };

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return void toast.error(error.message);
    toast.success("Product deleted");
    refresh();
  };

  const rows = (data ?? []).filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()) || p.category === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search products..." className="field max-w-xs rounded-full" />
        <button onClick={() => open()} className="btn btn-primary px-4 py-2"><Plus className="h-4 w-4" /> Add product</button>
      </div>
      {isLoading ? <div className="mt-6 h-40 animate-pulse rounded-2xl bg-muted" /> : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-surface-low text-left"><tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3" /></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3"><div className="flex items-center gap-3"><img src={img(p.images[0])} alt="" className="h-12 w-10 rounded object-cover" /><span className="font-medium">{p.name}</span></div></td>
                  <td className="p-3">{categoryName(p.category)}</td>
                  <td className="p-3">{inr(p.price)}</td>
                  <td className={`p-3 font-semibold ${p.stock === 0 ? "text-destructive" : ""}`}>{p.stock}</td>
                  <td className="p-3">{p.active ? "Visible" : "Hidden"}</td>
                  <td className="p-3"><div className="flex justify-end gap-1">
                    <button onClick={() => open(p)} className="p-2 hover:text-primary" aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => del(p)} className="p-2 hover:text-destructive" aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-foreground/40 p-4" role="dialog" aria-modal="true">
          <form onSubmit={save} className="my-8 w-full max-w-2xl rounded-3xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between"><h2 className="text-2xl text-primary">{edit.id ? "Edit product" : "Add product"}</h2><button type="button" onClick={() => setEdit(null)} aria-label="Close"><X /></button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <L label="Name *"><input className="field" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></L>
              <L label="URL slug (auto if empty)"><input className="field" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} /></L>
              <L label="Category"><select className="field" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></L>
              <L label="Stock *"><input type="number" min={0} className="field" value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: e.target.value })} /></L>
              <L label="Price (₹) *"><input type="number" min={0} className="field" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} /></L>
              <L label="MRP (₹, optional)"><input type="number" min={0} className="field" value={edit.mrp} onChange={(e) => setEdit({ ...edit, mrp: e.target.value })} /></L>
              <L label="Sizes (comma separated)"><input className="field" value={edit.sizes} onChange={(e) => setEdit({ ...edit, sizes: e.target.value })} placeholder="S, M, L or 2.4, 2.6" /></L>
              <L label="Colours (comma separated)"><input className="field" value={edit.colors} onChange={(e) => setEdit({ ...edit, colors: e.target.value })} /></L>
              <div className="sm:col-span-2"><L label="Image URLs (one per line)"><textarea rows={3} className="field" value={edit.images} onChange={(e) => setEdit({ ...edit, images: e.target.value })} placeholder="https://..." /></L></div>
              <div className="sm:col-span-2"><L label="Description"><textarea rows={4} className="field" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></L></div>
              <div className="flex flex-wrap gap-4 text-sm sm:col-span-2">
                {(["active", "featured", "new_arrival", "best_seller"] as const).map((k) => (
                  <label key={k} className="flex items-center gap-2 capitalize"><input type="checkbox" checked={edit[k]} onChange={(e) => setEdit({ ...edit, [k]: e.target.checked })} />{k === "active" ? "Visible in shop" : k.replace("_", " ")}</label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEdit(null)} className="btn btn-outline">Cancel</button><button className="btn btn-primary">Save</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-medium">{label}</span>{children}</label>;
}
