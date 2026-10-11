import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Store Admin — Varam Vastra & Jewels" },
      { name: "description", content: "Manage products, stock, orders and store settings." },
      { property: "og:title", content: "Store Admin — Varam Vastra & Jewels" },
      { property: "og:description", content: "Boutique administration." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: session!.user.id, _role: "admin" });
      return !!data;
    },
  });
  const [tab, setTab] = useState<"products" | "orders" | "settings">("products");

  if (session === undefined || (session && isLoading)) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!session) return <Login />;
  if (!isAdmin) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl text-primary">Not authorised</h1>
        <p className="mt-2 text-muted-foreground">{session.user.email} doesn't have admin access.</p>
        <button onClick={() => supabase.auth.signOut()} className="btn btn-outline mt-6">Sign out</button>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl text-primary">Store Admin</h1>
        <button onClick={() => supabase.auth.signOut()} className="btn btn-outline px-4 py-2"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto" role="tablist">
        {(["products", "orders", "settings"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`btn px-5 py-2 capitalize ${tab === t ? "btn-primary" : "btn-outline"}`}>{t}</button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "products" && <ProductsAdmin />}
        {tab === "orders" && <OrdersAdmin />}
        {tab === "settings" && <SettingsAdmin />}
      </div>
    </div>
  );
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success("Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  };

  return (
    <div className="container-page flex justify-center py-16">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-card">
        <h1 className="text-2xl text-primary">{mode === "in" ? "Admin sign in" : "Create admin account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Store owners only.</p>
        <label htmlFor="em" className="mb-1 mt-6 block text-sm font-medium">Email</label>
        <input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" />
        <label htmlFor="pw" className="mb-1 mt-4 block text-sm font-medium">Password</label>
        <input id="pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="field" autoComplete={mode === "in" ? "current-password" : "new-password"} />
        <button disabled={busy} className="btn btn-primary mt-6 w-full">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "in" ? "Sign in" : "Sign up"}</button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-sm text-primary hover:underline">
          {mode === "in" ? "First time? Create the owner account" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
