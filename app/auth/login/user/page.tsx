import RoleLoginForm from "@/components/auth/RoleLoginForm";

export default function UserLoginPage() {
  return (
    <RoleLoginForm
      role="user"
      title="Welcome back"
      subtitle="Sign in to watch streams, shop, and track orders."
    />
  );
}

