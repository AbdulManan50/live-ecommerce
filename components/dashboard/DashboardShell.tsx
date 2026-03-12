"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import { roleHomePath, type AppRole } from "@/lib/role-redirect";

type Me = {
  _id: string;
  name?: string;
  email?: string;
  role: AppRole;
};

type NavItem = { href: string; label: string };

export default function DashboardShell({
  requiredRole,
  brand,
  nav,
  children,
}: {
  requiredRole: AppRole;
  brand: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const activeRoleHome = useMemo(
    () => (me?.role ? roleHomePath(me.role) : null),
    [me?.role]
  );

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    (async () => {
      try {
        const user = await apiRequest("/api/users/me", "GET", undefined, {
          authToken: token,
        });
        if (!user?._id) {
          clearToken();
          router.replace("/auth/login");
          return;
        }
        setMe(user);

        if (user.role !== requiredRole) {
          router.replace(roleHomePath(user.role));
          return;
        }

        // Vendor onboarding gate
        if (
          requiredRole === "seller" &&
          !user.store &&
          !pathname?.startsWith("/vendor/onboarding")
        ) {
          router.replace("/vendor/onboarding");
          return;
        }
      } catch {
        clearToken();
        router.replace("/auth/login");
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [requiredRole, router, pathname]);

  const logout = () => {
    clearToken();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black text-zinc-50 flex items-center justify-center">
        <div className="text-sm text-zinc-400">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-120px] h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b md:border-b-0 md:border-r border-zinc-900/80 bg-zinc-950/40">
          <div className="px-5 py-5 border-b border-zinc-900/80">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl bg-emerald-500/90 flex items-center justify-center text-xs font-black text-black">
                  LC
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold tracking-tight">
                    {brand}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {me?.name || me?.email || "Account"}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                Logout
              </button>
            </div>
          </div>

          <nav className="p-3">
            <ul className="space-y-1">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={[
                        "block rounded-xl px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-emerald-500/12 text-emerald-200 border border-emerald-500/20"
                          : "text-zinc-200 hover:bg-zinc-900/60 border border-transparent",
                      ].join(" ")}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {activeRoleHome && activeRoleHome !== pathname && (
              <div className="mt-4 px-2 text-[11px] text-zinc-500">
                Signed in as <span className="text-zinc-300">{me?.role}</span>
              </div>
            )}
          </nav>
        </aside>

        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}

