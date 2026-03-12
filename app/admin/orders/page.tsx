import DashboardShell from "@/components/dashboard/DashboardShell";

export default function AdminOrdersPage() {
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
            Manage Orders
          </h1>
          <p className="text-sm text-zinc-400">
            Monitor orders, payments, and fulfillment.
          </p>
        </header>

        <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 text-sm text-zinc-300">
          Hook this to <span className="font-mono">/api/admin/orders</span> next.
        </div>
      </div>
    </DashboardShell>
  );
}

