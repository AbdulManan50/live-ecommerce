"use client";

import { useRouter } from "next/navigation";

function Card({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 hover:border-emerald-500/50 hover:bg-zinc-950/85 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-zinc-50">{title}</p>
          <p className="text-xs text-zinc-400">{description}</p>
        </div>
        <span className="text-xs text-emerald-300 group-hover:text-emerald-200">
          Continue →
        </span>
      </div>
    </button>
  );
}

export default function RegisterChooserPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="max-w-2xl space-y-3">
          <p className="text-[11px] uppercase tracking-widest text-zinc-500">
            Create an account
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Join LiveCommerce
          </h1>
          <p className="text-sm text-zinc-400">
            Sign up as a shopper, or create a store and sell as a vendor.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            title="Signup as User"
            description="Watch streams, wishlist items, and checkout."
            onClick={() => router.push("/auth/register/user")}
          />
          <Card
            title="Signup as Seller (Vendor)"
            description="Create a store, list products, and start live streams."
            onClick={() => router.push("/auth/register/vendor")}
          />
        </div>

        <div className="mt-6 text-xs text-zinc-500">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
