"use client";

import LivePlayer from "@/components/stream/LivePlayer";
import ChatBox from "@/components/stream/ChatBox";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStreamById } from "@/services/stream.service";
import { getToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import { getSocket } from "@/lib/socket-client";

type StreamDetail = {
  _id: string;
  title: string;
  status: "live" | "ended";
  pinnedProduct?: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
  } | null;
  seller?: {
    _id: string;
    name?: string;
    avatarUrl?: string;
  };
};

type StreamProduct = {
  _id: string;
  title: string;
  price: number;
  images?: string[];
  stock?: number;
};

export default function StreamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [products, setProducts] = useState<StreamProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);
  const [reacting, setReacting] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [data, vendorProducts] = await Promise.all([
          getStreamById(params.id),
          apiRequest(`/api/streams/${params.id}/products`, "GET").catch(() => []),
        ]);
        if (!active) return;
        setStream(data);
        setProducts(vendorProducts || []);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Failed to load stream");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [params.id]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join_stream", params.id);

    socket.on("reaction", (data: any) => {
      if (data?.streamId !== params.id) return;
      setReactionCount((c) => c + 1);
    });

    return () => {
      socket.off("reaction");
    };
  }, [params.id]);

  const handleBuyPinned = async () => {
    if (!stream?.pinnedProduct || adding) return;

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
        productId: stream.pinnedProduct._id,
        quantity: 1,
      });

      router.push("/cart");
    } catch {
      // ignore for now
    } finally {
      setAdding(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
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
      await apiRequest("/api/cart/add", "POST", {
        userId: me._id,
        productId,
        quantity: 1,
      });
      router.push("/cart");
    } catch {
      // ignore for now
    } finally {
      setAdding(false);
    }
  };

  const handleReact = async () => {
    if (reacting) return;
    setReacting(true);
    try {
      const socket = getSocket();
      socket.emit("reaction", { streamId: params.id });
      setReactionCount((c) => c + 1);
    } finally {
      setTimeout(() => setReacting(false), 250);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-2 md:py-6">
        {loading && (
          <div className="flex items-center justify-center h-[420px] text-zinc-500">
            Loading stream…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && !stream && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
            Stream not found.
          </div>
        )}

        {stream && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-5 md:gap-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-zinc-950/60 border border-zinc-900/80 flex items-center justify-center overflow-hidden">
                    {stream.seller?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={stream.seller.avatarUrl}
                        alt={stream.seller?.name || "Seller"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {stream.seller?.name?.slice(0, 1)?.toUpperCase() || "S"}
                      </span>
                    )}
                  </div>
                  <div className="leading-tight">
                    <h1 className="text-lg md:text-xl font-semibold text-zinc-50">
                      {stream.title}
                    </h1>
                    <p className="text-xs text-zinc-400">
                      {stream.status === "live" ? "Live now" : "Ended"}{" "}
                      {stream.seller?.name ? `• ${stream.seller.name}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReact}
                    className="rounded-xl border border-zinc-900/80 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/50 transition-colors"
                    type="button"
                  >
                    React ❤️ <span className="text-zinc-400">({reactionCount})</span>
                  </button>
                </div>
              </div>

              <LivePlayer title={stream.title} isLive={stream.status === "live"} />

              <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-zinc-100">
                    Products from this vendor
                  </h2>
                  <a
                    href="/products"
                    className="text-xs text-emerald-300 hover:text-emerald-200"
                  >
                    View all →
                  </a>
                </div>

                {products.length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    No products listed for this vendor yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-3">
                    {products.map((p) => (
                      <div
                        key={p._id}
                        className="rounded-xl border border-zinc-900/80 bg-zinc-950/30 p-3 flex gap-3"
                      >
                        <div className="h-16 w-16 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                          {p.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-zinc-500">No image</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-zinc-100 line-clamp-1">
                            {p.title}
                          </p>
                          <p className="text-xs text-emerald-300 mt-0.5">
                            ${Number(p.price || 0).toFixed(2)}
                          </p>
                          <div className="mt-2">
                            <button
                              onClick={() => handleAddToCart(p._id)}
                              disabled={adding}
                              className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-xs font-semibold py-2 transition-colors"
                              type="button"
                            >
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {stream.pinnedProduct && (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4">
                  <p className="text-xs font-semibold text-emerald-300 mb-1">
                    Featured product
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                      {stream.pinnedProduct.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={stream.pinnedProduct.images[0]}
                          alt={stream.pinnedProduct.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-500">No image</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-50 line-clamp-1">
                        {stream.pinnedProduct.title}
                      </h3>
                      <p className="mt-0.5 text-base font-semibold text-emerald-300">
                        ${stream.pinnedProduct.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBuyPinned}
                    disabled={adding}
                    className="mt-3 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-medium py-2.5 transition-colors"
                  >
                    {adding ? "Adding…" : "Buy now"}
                  </button>
                </div>
              )}

              <div className="h-[520px]">
                <ChatBox streamId={params.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
