import DashboardShell from "@/components/dashboard/DashboardShell";

export default function AdminVendorsPage() {
  return (
    <DashboardShell
      requiredRole="admin"
      brand="Admin Console"
      nav={[
        { href: "/admin", label: "Platform Overview" },
        { href: "/admin/users", label: "Manage Users" },
        { href: "/admin/vendors", label: "Manage Vendors" },
        { href: "/admin/products", label: "Manage Products" },
        { href: "/admin/orders", label: "Manage Orders" },
        { href: "/admin/settings", label: "Platform Settings" },
      ]}
    >
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Manage Vendors
          </h1>
          <p className="text-sm text-zinc-400">
            Approve, review, and manage seller accounts.
          </p>
        </header>

        <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 text-sm text-zinc-300">
          Next: filter users by <span className="font-mono">role=seller</span>
          and add vendor actions.
        </div>
      </div>
    </DashboardShell>
  );
}

