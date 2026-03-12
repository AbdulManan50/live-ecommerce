import RoleLoginForm from "@/components/auth/RoleLoginForm";

export default function VendorLoginPage() {
  return (
    <RoleLoginForm
      role="seller"
      title="Vendor sign in"
      subtitle="Manage products, go live, and fulfill orders."
    />
  );
}

