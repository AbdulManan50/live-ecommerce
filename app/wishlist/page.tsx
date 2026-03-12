"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

type WishlistProduct = {
  _id: string;
  title: string;
  price: number;
  images?: string[];
};

type WishlistItem = {
  product: WishlistProduct;
};

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingAuth(false);
      router.replace("/auth/login");
      return;
    }

    (async () => {
      try {
        const me = await apiRequest("/api/users/me", "GET", undefined, {
          authToken: token,
        });

        const wishlist = await apiRequest("/api/wishlist", "POST", {
          userId: me._id,
        });

        setItems(
          wishlist?.items?.map((it: any) => ({ product: it.product })) || []
        );
      } catch (err: any) {
        setError(err?.message || "Failed to load wishlist");
      } finally {
        setLoading(false);
        setCheckingAuth(false);
      }
    })();
  }, [router]);

  const handleRemove = async (productId: string) => {
    const token = getToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const me = await apiRequest("/api/users/me", "GET", undefined, {
        authToken: token,
      });

      const wishlist = await apiRequest("/api/wishlist/remove", "POST", {
        userId: me._id,
        productId,
      });

      setItems(
        wishlist?.items?.map((it: any) => ({ product: it.product })) || []
      );
    } catch {
      // ignore for now
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black text-zinc-50">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Wishlist</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Products you saved for later.
          </p>
        </header>

        {checkingAuth || loading ? (
          <div className="flex items-center justify-center h-64 text-zinc-500">
            Loading your wishlist…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : !items.length ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-8 text-center text-zinc-300">
            Your wishlist is empty.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div
                key={it.product._id}
                className="flex gap-3 border border-zinc-800 rounded-xl p-3 bg-zinc-950/70"
              >
                <div className="w-24 h-24 rounded-lg bg-zinc-900 overflow-hidden flex items-center justify-center">
                  {it.product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.product.images[0]}
                      alt={it.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-zinc-500">No image</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold line-clamp-2">
                      {it.product.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">
                      ${(Number(it.product.price) || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    <button
                      onClick={() => handleRemove(it.product._id)}
                      className="text-[11px] text-zinc-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

