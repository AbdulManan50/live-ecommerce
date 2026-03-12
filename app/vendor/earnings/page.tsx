import DashboardShell from "@/components/dashboard/DashboardShell";

export default function VendorEarningsPage() {
  return (
    <DashboardShell
      requiredRole="seller"
      brand="Vendor Studio"
      nav={[
        { href: "/vendor", label: "My Products" },
        { href: "/vendor/add-product", label: "Add Product" },
        { href: "/vendor/orders", label: "Orders" },
        { href: "/vendor/live-streams", label: "Live Streams" },
        { href: "/vendor/earnings", label: "Earnings" },
      ]}
    >
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Earnings
          </h1>
          <p className="text-sm text-zinc-400">
            Track sales and payouts over time.
          </p>
        </header>

        <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 text-sm text-zinc-300">
          Earnings dashboard coming next (aggregate paid orders by vendor).
        </div>
      </div>
    </DashboardShell>
  );
}

