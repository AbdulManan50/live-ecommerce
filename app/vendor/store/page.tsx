"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

const STORE_CATEGORIES = [
  "Clothing & Fashion",
  "Electronics",
  "Shoes & Footwear",
  "Beauty & Cosmetics",
  "Home & Kitchen",
  "Sports & Fitness",
  "Bags & Accessories",
  "Mobile & Gadgets",
  "Jewelry & Watches",
  "Kids & Toys",
] as const;

type Store = {
  _id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  category: (typeof STORE_CATEGORIES)[number];
};

export default function VendorStorePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof STORE_CATEGORIES)[number]>(
    "Clothing & Fashion"
  );
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const nav = useMemo(
    () => [
      { href: "/vendor", label: "My Products" },
      { href: "/vendor/add-product", label: "Add Product" },
      { href: "/vendor/orders", label: "Orders" },
      { href: "/vendor/live-streams", label: "Live Streams" },
      { href: "/vendor/earnings", label: "Earnings" },
      { href: "/vendor/store", label: "Store Profile" },
    ],
    []
  );

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        const data = await apiRequest("/api/vendor/store", "GET", undefined, {
          authToken: token,
        });
        if (!data?._id) {
          setStore(null);
          return;
        }
        setStore(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setCategory(data.category || "Clothing & Fashion");
        setContactEmail(data.contactEmail || "");
        setContactPhone(data.contactPhone || "");
      } catch (err: any) {
        setError(err?.message || "Failed to load store");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await apiRequest(
        "/api/vendor/store",
        "PUT",
        { name, description, category, contactEmail, contactPhone },
        { authToken: token }
      );
      setStore(updated);
    } catch (err: any) {
      setError(err?.message || "Failed to save store");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell requiredRole="seller" brand="Vendor Studio" nav={nav}>
      <div className="max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Store Profile
          </h1>
          <p className="text-sm text-zinc-400">
            Your store category is used across your vendor dashboard and stream
            pages.
          </p>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-sm text-zinc-400">Loading…</div>
        ) : !store ? (
          <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 text-sm text-zinc-300">
            No store found. Please complete onboarding.
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center">
                {store.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-zinc-500">Logo</span>
                )}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-zinc-100">{store.name}</p>
                <p className="text-xs text-emerald-300">{store.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Store name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Store category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as (typeof STORE_CATEGORIES)[number])
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
                >
                  {STORE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Store description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-28 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Contact email
                </label>
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Contact phone
                </label>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-semibold px-4 py-2.5 transition-colors"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

