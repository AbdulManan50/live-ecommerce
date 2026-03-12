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

export default function LoginChooserPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="max-w-2xl space-y-3">
          <p className="text-[11px] uppercase tracking-widest text-zinc-500">
            Choose your portal
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Sign in to LiveCommerce
          </h1>
          <p className="text-sm text-zinc-400">
            Separate portals keep vendor tools, admin controls, and shopping
            experience clean and secure.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            title="Login as User"
            description="Watch streams, wishlist items, and checkout."
            onClick={() => router.push("/auth/login/user")}
          />
          <Card
            title="Login as Vendor / Seller"
            description="Manage products, go live, and fulfill orders."
            onClick={() => router.push("/auth/login/vendor")}
          />
          <Card
            title="Admin login"
            description="Manage platform users, vendors, products and orders."
            onClick={() => router.push("/auth/login/admin")}
          />
        </div>

        <div className="mt-6 text-xs text-zinc-500">
          Don&apos;t have an account?{" "}
          <a
            href="/auth/register"
            className="text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline"
          >
            Create a user account
          </a>
        </div>
      </div>
    </div>
  );
}
