"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

type CurrentUser = {
  _id: string;
  name: string;
  role: "user" | "seller" | "admin";
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    (async () => {
      try {
        const me = await apiRequest("/api/users/me", "GET", undefined, {
          authToken: token,
        });
        if (me && me._id) {
          setUser(me);
          // Already logged in: send directly to streams
          router.replace("/streams");
        }
      } catch {
        // token invalid, ignore
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, [router]);

  const handleLoginClick = () => {
    if (user) {
      router.push("/streams");
    } else {
      router.push("/auth/login");
    }
  };

  const handleSignupClick = () => {
    if (user) {
      router.push("/streams");
    } else {
      router.push("/auth/register");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black text-zinc-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-[-80px] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-emerald-500/90 flex items-center justify-center text-xs font-black text-black">
              LC
            </div>
            <span className="text-sm font-semibold tracking-tight">
              LiveCommerce
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoginClick}
              className="rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-1.5 text-xs font-medium text-zinc-200 hover:border-emerald-500/70 hover:text-emerald-200 transition-colors"
            >
              {user ? "Go to streams" : "Login"}
            </button>
            {!user && (
              <button
                onClick={handleSignupClick}
                className="rounded-full bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-black transition-colors"
              >
                Signup
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-14 md:flex-row md:items-stretch">
          <section className="w-full md:w-1/2 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200 tracking-wide uppercase">
              Live shopping platform
              <span className="h-1 w-1 rounded-full bg-emerald-300 animate-pulse" />
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-zinc-50">
              Go live. Showcase products.{" "}
              <span className="text-emerald-400">Sell in real time.</span>
            </h1>

            <p className="max-w-xl text-sm md:text-base text-zinc-400">
              LiveCommerce lets sellers stream product drops while viewers chat,
              discover, and buy instantly. Login or create an account to join
              live shows, pin products, and manage your storefront.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleLoginClick}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-black shadow-[0_0_40px_rgba(16,185,129,0.45)] transition-colors"
              >
                {user ? "Continue to live streams" : "Login to continue"}
              </button>
              {!user && (
                <button
                  onClick={handleSignupClick}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/70 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:border-emerald-500/70 hover:text-emerald-200 transition-colors"
                >
                  New here? Create an account
                </button>
              )}
            </div>

            {!user && !checkingAuth && (
              <p className="text-xs text-zinc-500">
                You are not logged in. Please login or signup to access live
                streams and shopping.
              </p>
            )}
            {checkingAuth && (
              <p className="text-xs text-zinc-500">
                Checking your session…
              </p>
            )}
          </section>

          <section className="w-full md:w-1/2">
            <div className="relative h-[260px] md:h-[320px] rounded-3xl border border-zinc-800 bg-zinc-950/70 overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.25)]">
              <div className="absolute inset-0 opacity-40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e33,_transparent_55%),radial-gradient(circle_at_bottom,_#06b6d433,_transparent_55%)]" />
              </div>

              <div className="relative z-10 h-full grid grid-cols-[1.7fr_1.1fr] gap-0">
                <div className="flex flex-col justify-between border-r border-zinc-800/80 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 font-semibold text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </span>
                    <span className="text-zinc-400">Featured stream</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-50">
                      “Neon Drop” apparel showcase
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Sellers demo products, answer questions, and pin items
                      viewers can buy instantly.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Real-time chat</span>
                    <span>1‑click checkout</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-4 bg-zinc-950/80">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-200">
                      What you can do
                    </p>
                    <ul className="space-y-1 text-[11px] text-zinc-400">
                      <li>• Join live streams as a shopper</li>
                      <li>• Start shows as a verified seller</li>
                      <li>• Monitor activity as an admin</li>
                    </ul>
                  </div>
                  <div className="space-y-1 text-[11px] text-zinc-500">
                    <p>Login or signup to get started.</p>
                    <p>Your session will automatically take you to live streams.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

