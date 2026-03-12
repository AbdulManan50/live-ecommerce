"use client";

import { useEffect, useState } from "react";
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

export default function VendorOnboardingPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof STORE_CATEGORIES)[number]>(
    "Clothing & Fashion"
  );
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        const existing = await apiRequest("/api/vendor/store", "GET", undefined, {
          authToken: token,
        });
        if (existing?._id) {
          window.location.href = "/vendor";
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const uploadLogo = async (file: File) => {
    const token = getToken();
    if (!token) throw new Error("Unauthorized");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/uploads/store-logo", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    return data.url as string;
  };

  const handlePickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadLogo(file);
      setLogoUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to upload logo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = getToken();
    if (!token) {
      window.location.href = "/auth/login/vendor";
      return;
    }

    setSaving(true);
    try {
      await apiRequest(
        "/api/vendor/store",
        "POST",
        {
          name,
          description,
          category,
          logoUrl: logoUrl || undefined,
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
        },
        { authToken: token }
      );

      window.location.href = "/vendor";
    } catch (err: any) {
      setError(err?.message || "Failed to create store");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      requiredRole="seller"
      brand="Vendor Studio"
      nav={[
        { href: "/vendor", label: "My Products" },
        { href: "/vendor/add-product", label: "Add Product" },
        { href: "/vendor/orders", label: "Orders" },
        { href: "/vendor/live-streams", label: "Live Streams" },
        { href: "/vendor/earnings", label: "Earnings" },
      ]}
    >
      <div className="max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Create your store
          </h1>
          <p className="text-sm text-zinc-400">
            Add your store details to unlock your seller dashboard.
          </p>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Store name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
                required
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
              placeholder="What do you sell? What makes your store special?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Contact email (optional)
              </label>
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Contact phone (optional)
              </label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Store logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-zinc-500">Logo</span>
                )}
              </div>
              <label className="text-xs text-zinc-400">
                <span className="block mb-1">Store logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePickLogo}
                  disabled={uploading}
                  className="block w-full text-xs text-zinc-300"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-semibold px-4 py-2.5 transition-colors"
            >
              {saving ? "Creating…" : "Create store"}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}

