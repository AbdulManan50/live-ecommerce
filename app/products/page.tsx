"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";
import ProductCard from "@/components/product/ProductCard";

type Product = {
  _id: string;
  title: string;
  price: number;
  images?: string[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getProducts();
        if (!active) return;
        setProducts(data);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Failed to load products");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50">
            Products
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Browse products featured in live streams.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64 text-zinc-500">
            Loading products…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100 mb-4">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-8 text-center text-zinc-300">
            No products available yet.
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

