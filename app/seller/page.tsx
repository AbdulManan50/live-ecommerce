"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import { startStream } from "@/services/stream.service";

type SellerStream = {
  _id: string;
  title: string;
  status: "live" | "ended";
};

type SellerProduct = {
  _id: string;
  title: string;
  price: number;
};

export default function SellerDashboard() {
  const [streams, setStreams] = useState<SellerStream[]>([]);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        const me = await apiRequest("/api/users/me", "GET", undefined, {
          authToken: token,
        });

        const [streamsData, productsData] = await Promise.all([
          apiRequest("/api/seller/streams", "POST", { sellerId: me._id }),
          apiRequest("/api/seller/products", "POST", { sellerId: me._id }),
        ]);

        setStreams(streamsData || []);
        setProducts(productsData || []);
      } catch {
        // ignore for MVP
      }
    })();
  }, []);

  const handleStartStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        setError("You must be logged in as a seller.");
        return;
      }

      const stream = await startStream(
        { title, categorySlug: categorySlug || undefined },
      );

      setStreams((prev) => [stream, ...prev]);
      setTitle("");
      setCategorySlug("");
    } catch (err: any) {
      setError(err?.message || "Failed to start stream");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50">
              Seller Studio
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Start live streams and manage your products.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">
            Start a new live stream
          </h2>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-xs text-red-100">
              {error}
            </div>
          )}

          <form
            onSubmit={handleStartStream}
            className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_auto] gap-3"
          >
            <input
              placeholder="Stream title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
              required
            />
            <input
              placeholder="Category slug (optional)"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-medium px-4 py-2 transition-colors"
            >
              {loading ? "Starting…" : "Go live"}
            </button>
          </form>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">
              Your streams
            </h2>
            {streams.length === 0 ? (
              <p className="text-xs text-zinc-500">
                You haven't started any streams yet.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {streams.map((s) => (
                  <li
                    key={s._id}
                    className="flex items-center justify-between border border-zinc-800 rounded-lg px-3 py-2"
                  >
                    <span className="text-zinc-100 line-clamp-1">
                      {s.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {s.status === "live" ? "Live" : "Ended"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">
              Your products
            </h2>
            {products.length === 0 ? (
              <p className="text-xs text-zinc-500">
                No products yet. Create products via your backend tools for now.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {products.map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between border border-zinc-800 rounded-lg px-3 py-2"
                  >
                    <span className="text-zinc-100 line-clamp-1">
                      {p.title}
                    </span>
                    <span className="text-xs text-emerald-300">
                      ${p.price.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

