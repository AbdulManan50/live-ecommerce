"use client";

import { useEffect, useState } from "react";
import { getLiveStreams } from "@/services/stream.service";
import { getCategories, type Category } from "@/services/category.service";

type StreamListItem = {
  _id: string;
  title: string;
  status: "live" | "ended";
  categorySlug?: string;
};

export default function StreamsPage() {
  const [streams, setStreams] = useState<StreamListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | "all">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [streamData, categoryData] = await Promise.all([
          getLiveStreams(),
          getCategories().catch(() => []),
        ]);
        if (!active) return;
        setStreams(streamData);
        setCategories(categoryData);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Failed to load streams");
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50">
              Live Streams
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Discover live product showcases happening right now.
            </p>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="relative mb-6">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <span className="h-px w-6 bg-zinc-700" />
              <span>Categories</span>
            </div>
            <div className="overflow-x-auto [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 pb-1 min-w-max">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedCategory === "all"
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-200"
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedCategory === c.slug
                        ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                        : "border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-200"
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-64 text-zinc-500">
            Loading live streams…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100 mb-4">
            {error}
          </div>
        )}

        {!loading && !error && streams.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-8 text-center text-zinc-300">
            No live streams at the moment. Check back soon.
          </div>
        )}

        {!loading && streams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {streams
              .filter((s) =>
                selectedCategory === "all"
                  ? true
                  : s.categorySlug === selectedCategory
              )
              .map((s) => (
              <a
                key={s._id}
                href={`/streams/${s._id}`}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden hover:border-emerald-500/60 transition-colors"
              >
                <div className="aspect-video bg-linear-to-br from-zinc-900 via-black to-zinc-950 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full border border-zinc-700 flex items-center justify-center text-xs text-zinc-400 group-hover:border-emerald-400/70 group-hover:text-emerald-300 transition-colors">
                    LIVE
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h2 className="text-sm font-semibold text-zinc-50 line-clamp-2">
                    {s.title}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {s.status === "live" ? "Streaming now" : "Ended"}
                  </p>
                </div>
              </a>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
