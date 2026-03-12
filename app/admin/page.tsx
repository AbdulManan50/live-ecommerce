import DashboardShell from "@/components/dashboard/DashboardShell";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "seller" | "admin";
};

type AdminStream = {
  _id: string;
  title: string;
  status: "live" | "ended";
};

type AdminOrder = {
  _id: string;
  totalPrice: number;
};

export default function AdminDashboard() {
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
            Platform Overview
          </h1>
          <p className="text-sm text-zinc-400">
            Manage users, vendors, products, and orders.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Users", value: "—" },
            { label: "Active streams", value: "—" },
            { label: "Orders", value: "—" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5"
            >
              <p className="text-xs text-zinc-400">{kpi.label}</p>
              <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-5 text-sm text-zinc-300">
          Next: I can re-add live data panels here by calling your existing admin
          APIs, but now within this sidebar shell.
        </div>
      </div>
    </DashboardShell>
  );
}

