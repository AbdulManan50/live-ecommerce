"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth-client";
import { roleHomePath } from "@/lib/role-redirect";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type Me = {
  _id: string;
  name?: string;
  email?: string;
  role: "user" | "seller" | "admin";
  avatarUrl?: string;
};

function Icon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24" };
  if (name === "home")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z" />
      </svg>
    );
  if (name === "streams")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7h16M4 12h10M4 17h16" />
      </svg>
    );
  if (name === "products")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7H4l2 14h12l2-14Z" />
        <path d="M8 7a4 4 0 0 1 8 0" />
      </svg>
    );
  if (name === "categories")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
      </svg>
    );
  if (name === "cart")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 6h15l-2 10H8L6 6Z" />
        <path d="M6 6 5 3H2" />
        <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
    );
  if (name === "wishlist")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-7-4.6-9.5-8.7C.2 8.7 2.3 5.5 6 5.5c2 0 3.2 1 4 2 0 0 1.4-2 4-2 3.7 0 5.8 3.2 3.5 6.8C19 16.4 12 21 12 21Z" />
      </svg>
    );
  if (name === "user")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21a8 8 0 1 0-16 0" />
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      </svg>
    );
  if (name === "vendor")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-6 9 6-1 12H4L3 9Z" />
        <path d="M9 22V12h6v10" />
      </svg>
    );
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h16" />
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const rawPathname = usePathname();
  const pathname = rawPathname || "/";

  const hideShell =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/dashboard");

  const [me, setMe] = useState<Me | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMe(null);
      setAuthChecked(true);
      return;
    }

    (async () => {
      try {
        const user = await apiRequest("/api/users/me", "GET", undefined, {
          authToken: token,
        });
        setMe(user);
      } catch {
        clearToken();
        setMe(null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  const items: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { href: "/", label: "Home", icon: <Icon name="home" /> },
      { href: "/streams", label: "Live Streams", icon: <Icon name="streams" /> },
      { href: "/products", label: "Products", icon: <Icon name="products" /> },
      { href: "/categories", label: "Categories", icon: <Icon name="categories" /> },
      { href: "/cart", label: "Cart", icon: <Icon name="cart" /> },
      { href: "/wishlist", label: "Wishlist", icon: <Icon name="wishlist" /> },
    ];

    // Role-aware dashboard links
    if (me?.role === "user") {
      base.push({
        href: "/dashboard",
        label: "User Dashboard",
        icon: <Icon name="user" />,
      });
    } else if (me?.role === "seller") {
      base.push({
        href: "/vendor",
        label: "Vendor Dashboard",
        icon: <Icon name="vendor" />,
      });
    } else if (me?.role === "admin") {
      base.push({
        href: "/admin",
        label: "Admin Console",
        icon: <Icon name="user" />,
      });
    } else {
      // Logged out: show both entries as options
      base.push(
        { href: "/dashboard", label: "User Dashboard", icon: <Icon name="user" /> },
        { href: "/vendor", label: "Vendor Dashboard", icon: <Icon name="vendor" /> }
      );
    }

    return base;
  }, [me?.role]);

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("lc_sidebar_collapsed") === "1";
  });

  const toggle = () => {
    setCollapsed((p) => {
      const next = !p;
      window.localStorage.setItem("lc_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  };

  if (hideShell) return <>{children}</>;

  const logout = () => {
    clearToken();
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-120px] h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div
        className={[
          "relative z-10 grid min-h-screen",
          collapsed
            ? "grid-cols-1 md:grid-cols-[76px_minmax(0,1fr)]"
            : "grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]",
        ].join(" ")}
      >
        <aside className="border-b md:border-b-0 md:border-r border-zinc-900/80 bg-zinc-950/40">
          <div className="px-4 py-4 border-b border-zinc-900/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-emerald-500/90 flex items-center justify-center text-xs font-black text-black">
                LC
              </div>
              {!collapsed && (
                <div className="leading-tight">
                  <div className="text-sm font-semibold tracking-tight">
                    LiveCommerce
                  </div>
                  <div className="text-[11px] text-zinc-500">Navigation</div>
                </div>
              )}
            </div>
            <button
              onClick={toggle}
              className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1 text-xs text-zinc-300 hover:text-zinc-50 hover:border-emerald-500/40 transition-colors"
              aria-label="Toggle sidebar"
              type="button"
            >
              {collapsed ? "→" : "←"}
            </button>
          </div>

          <nav className="p-2">
            <ul className="space-y-1">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors",
                        active
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                          : "border-transparent text-zinc-200 hover:bg-zinc-900/60",
                        collapsed ? "justify-center" : "",
                      ].join(" ")}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="text-zinc-200">{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">
          <main className="px-4 md:px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

