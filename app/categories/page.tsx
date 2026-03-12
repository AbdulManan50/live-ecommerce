"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Category = { _id: string; title: string; slug: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiRequest("/api/categories", "GET");
        if (!active) return;
        setCategories(data || []);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Failed to load categories");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Categories
        </h1>
        <p className="text-sm text-zinc-400">
          Browse streams and products by category.
        </p>
      </header>

      {loading && <div className="text-sm text-zinc-400">Loading…</div>}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 text-sm text-zinc-300">
          No categories yet.
        </div>
      )}

      {categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c._id}
              className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5"
            >
              <p className="text-sm font-semibold text-zinc-50">{c.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{c.slug}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

