import DashboardShell from "@/components/dashboard/DashboardShell";

export default function UserProfilePage() {
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
            Profile Settings
          </h1>
          <p className="text-sm text-zinc-400">Update your account details.</p>
        </header>

        <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 text-sm text-zinc-300">
          Profile settings UI coming next.
        </div>
      </div>
    </DashboardShell>
  );
}

