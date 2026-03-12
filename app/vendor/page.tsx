import { redirect } from "next/navigation";

export default function VendorDashboardHome() {
  // Backwards-compatible: existing seller product CRUD lives on /seller for now.
  // Vendor Studio pages are being migrated incrementally.
  redirect("/seller");
}

