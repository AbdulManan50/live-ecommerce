"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import { startStream } from "@/services/stream.service";
import Link from "next/link";

type VendorStream = {
  _id: string;
  title: string;
  status: "live" | "ended";
  pinnedProduct?: string | null;
  createdAt?: string;
};

export default function VendorLiveStreamsPage() {
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [streams, setStreams] = useState<VendorStream[]>([]);
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
        const data = await apiRequest("/api/seller/streams", "POST", {
          sellerId: me._id,
        });
        setStreams(data || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        window.location.href = "/auth/login/vendor";
        return;
      }

      // startStream uses /api/streams/start which requires seller auth
      const stream = await startStream({
        title,
        categorySlug: categorySlug || undefined,
      });
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
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Live Streams
          </h1>
          <p className="text-sm text-zinc-400">
            Start a live stream and sell products in real time.
          </p>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">
            Start Live Stream
          </h2>
          <form
            onSubmit={handleStart}
            className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_auto] gap-3"
          >
            <input
              placeholder="Stream title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
              required
            />
            <input
              placeholder="Category slug (optional)"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-semibold px-4 py-2 transition-colors"
            >
              {loading ? "Starting…" : "Go live"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-100">
              Stream History
            </h2>
            <Link
              href="/streams"
              className="text-xs text-emerald-300 hover:text-emerald-200"
            >
              View public streams →
            </Link>
          </div>

          {streams.length === 0 ? (
            <p className="text-xs text-zinc-500">
              No streams yet. Start your first live stream above.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {streams.map((s) => (
                <li
                  key={s._id}
                  className="flex items-center justify-between gap-3 border border-zinc-900/80 rounded-xl px-3 py-2 bg-zinc-950/20"
                >
                  <div className="min-w-0">
                    <p className="text-zinc-100 font-medium line-clamp-1">
                      {s.title}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {s.status === "live" ? "Live" : "Ended"}
                    </p>
                  </div>
                  <Link
                    href={`/streams/${s._id}`}
                    className="text-xs text-emerald-300 hover:text-emerald-200 shrink-0"
                  >
                    Open →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

