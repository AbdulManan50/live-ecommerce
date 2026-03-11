"use client";

import LivePlayer from "@/components/stream/LivePlayer";
import ChatBox from "@/components/stream/ChatBox";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStreamById } from "@/services/stream.service";
import { getToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

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
};

export default function StreamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getStreamById(params.id);
        if (!active) return;
        setStream(data);
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

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-7">
            <div className="lg:col-span-2 space-y-4">
              <LivePlayer title={stream.title} isLive={stream.status === "live"} />
            </div>

            <div className="space-y-4">
              {stream.pinnedProduct && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">
                    Featured Product
                  </p>
                  <h3 className="text-sm font-semibold text-zinc-50">
                    {stream.pinnedProduct.title}
                  </h3>
                  <p className="mt-1 text-lg font-semibold text-emerald-300">
                    ${stream.pinnedProduct.price.toFixed(2)}
                  </p>
                  <button
                    onClick={handleBuyPinned}
                    disabled={adding}
                    className="mt-3 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-medium py-2.5 transition-colors"
                  >
                    {adding ? "Adding…" : "Buy Now"}
                  </button>
                </div>
              )}

              <div className="h-[440px]">
                <ChatBox streamId={params.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
