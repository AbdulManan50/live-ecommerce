import RoleLoginForm from "@/components/auth/RoleLoginForm";

export default function AdminLoginPage() {
  return (
    <RoleLoginForm
      role="admin"
      title="Admin sign in"
      subtitle="Manage users, vendors, products, and orders."
    />
  );
}

