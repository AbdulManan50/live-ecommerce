"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

type ProductCardProps = {
  product: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBuyNow = async () => {
    if (adding) return;

    const token = getToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setAdding(true);
    try {
      const me = await apiRequest("/api/users/me", "GET", undefined, {
        authToken: token,
      });

      if (!me?._id) {
        router.push("/auth/login");
        return;
      }

      await apiRequest("/api/cart/add", "POST", {
        userId: me._id,
        productId: product._id,
        quantity: 1,
      });

      router.push("/cart");
    } catch {
      // For MVP, ignore errors; you could show feedback here.
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (saving) return;

    const token = getToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setSaving(true);
    try {
      const me = await apiRequest("/api/users/me", "GET", undefined, {
        authToken: token,
      });

      if (!me?._id) {
        router.push("/auth/login");
        return;
      }

      await apiRequest("/api/wishlist/add", "POST", {
        userId: me._id,
        productId: product._id,
      });

      router.push("/wishlist");
    } catch {
      // ignore for now
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-950/70 hover:border-emerald-500/50 transition-colors flex flex-col gap-3">
      <div className="aspect-video rounded-xl bg-zinc-900 overflow-hidden flex items-center justify-center">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-xs text-zinc-500">No image</div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-zinc-50 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-lg font-semibold text-emerald-300">
          {product.price != null ? `$${product.price.toFixed(2)}` : "Price not available"}
        </p>
      </div>

      <button
        onClick={handleBuyNow}
        disabled={adding}
        className="mt-1 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-medium py-2.5 transition-colors"
      >
        {adding ? "Adding…" : "Buy Now"}
      </button>

      <button
        onClick={handleWishlist}
        disabled={saving}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-100 text-sm font-medium py-2.5 transition-colors"
      >
        {saving ? "Saving…" : "Add to wishlist"}
      </button>
    </div>
  );
}
