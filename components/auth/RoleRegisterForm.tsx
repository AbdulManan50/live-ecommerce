"use client";

import { useState } from "react";
import { registerUser } from "@/services/auth.service";
import { saveToken } from "@/lib/auth-client";
import { roleHomePath, type AppRole } from "@/lib/role-redirect";

export default function RoleRegisterForm({
  role,
  title,
  subtitle,
}: {
  role: Extract<AppRole, "user" | "seller">;
  title: string;
  subtitle: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerUser({ name, email, password, role });
      if (res?.token && res?.user?.role) {
        saveToken(res.token);
        if (res.user.role === "seller") {
          window.location.href = "/vendor/onboarding";
        } else {
          window.location.href = roleHomePath(res.user.role);
        }
      } else if (res?.error) {
        setError(res.error);
      } else {
        setError("Signup failed");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-black via-zinc-950 to-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 px-6 py-8 shadow-2xl">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
          {role === "seller" ? "Seller" : "User"} signup
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
              required
            />
          </div>

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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-xs text-zinc-400 text-center">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

