"use client";

import { useMemo, useState } from "react";
import { loginUser } from "@/services/auth.service";
import { saveToken } from "@/lib/auth-client";
import { roleHomePath, type AppRole } from "@/lib/role-redirect";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export default function RoleLoginForm({
  role,
  title,
  subtitle,
}: {
  role: AppRole;
  title: string;
  subtitle: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabel = useMemo(() => {
    if (role === "admin") return "Admin";
    if (role === "seller") return "Vendor";
    return "User";
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginUser({ email, password, expectedRole: role });
      if (res?.token && res?.user?.role) {
        saveToken(res.token);
        window.location.href = roleHomePath(res.user.role);
      } else if (res?.error) {
        setError(res.error);
      } else {
        setError("Login failed");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-black via-zinc-950 to-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 px-6 py-8 shadow-2xl">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
          {roleLabel} portal
        </p>
        <h1 className="text-2xl font-semibold text-zinc-50 mb-1">{title}</h1>
        <p className="text-sm text-zinc-400 mb-6">{subtitle}</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-medium py-2.5 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {role === "user" && <GoogleLoginButton />}

        {role !== "admin" && (
          <p className="mt-4 text-xs text-zinc-400 text-center">
            New here?{" "}
            <a
              href="/auth/register"
              className="text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline"
            >
              Create an account
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

