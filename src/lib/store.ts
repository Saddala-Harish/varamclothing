import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type StoreSettings = Tables<"store_settings">;
export type Order = Tables<"orders">;

export const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  store_name: "Varam Vastra & Jewels",
  tagline: "Handcrafted Sarees, Ethnic Wear & 1-Gram Gold Jewels",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  business_hours: "",
  delivery_charge: 99,
  free_delivery_threshold: 1999,
  cod_enabled: true,
  upi_enabled: true,
  upi_id: "",
  shipping_policy: "",
  return_policy: "",
  updated_at: "",
};

export const settingsQuery = () =>
  queryOptions({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data ?? DEFAULT_SETTINGS;
    },
    staleTime: 60_000,
  });

export const orderQuery = (id: string) =>
  queryOptions({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_order", { _id: id });
      if (error) throw error;
      return (data?.[0] ?? null) as Order | null;
    },
  });
