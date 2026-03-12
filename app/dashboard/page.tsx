import DashboardShell from "@/components/dashboard/DashboardShell";

export default function UserDashboardHome() {
  return (
    <DashboardShell
      requiredRole="user"
      brand="User Dashboard"
      nav={[
        { href: "/dashboard", label: "My Orders" },
        { href: "/wishlist", label: "Wishlist" },
        { href: "/cart", label: "Cart" },
        { href: "/dashboard/profile", label: "Profile Settings" },
      ]}
    >
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            My Orders
          </h1>
          <p className="text-sm text-zinc-400">
            Track purchases made during live streams.
          </p>
        </header>

        <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 text-sm text-zinc-300">
          Orders UI coming next (we can connect this to `/api/orders` and filter
          by your user ID).
        </div>
      </div>
    </DashboardShell>
  );
}

