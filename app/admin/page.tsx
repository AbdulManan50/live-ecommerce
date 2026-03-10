"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [streams, setStreams] = useState<AdminStream[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        const [usersData, streamsData, ordersData] = await Promise.all([
          apiRequest("/api/admin/users", "GET", undefined, {
            authToken: token,
          }),
          apiRequest("/api/admin/streams", "GET", undefined, {
            authToken: token,
          }),
          apiRequest("/api/admin/orders", "GET", undefined, {
            authToken: token,
          }),
        ]);

        setUsers(usersData || []);
        setStreams(streamsData || []);
        setOrders(ordersData || []);
      } catch {
        // For MVP, we don't show detailed admin errors
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50">
              Admin Control Center
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Monitor users, streams, and orders.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">
              Users
            </h2>
            <p className="text-2xl font-semibold text-zinc-50">
              {users.length}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">
              Active streams
            </h2>
            <p className="text-2xl font-semibold text-zinc-50">
              {streams.filter((s) => s.status === "live").length}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">
              Orders
            </h2>
            <p className="text-2xl font-semibold text-zinc-50">
              {orders.length}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">
              Users & roles
            </h2>
            <ul className="space-y-2 text-sm max-h-72 overflow-y-auto">
              {users.map((u) => (
                <li
                  key={u._id}
                  className="flex items-center justify-between border border-zinc-800 rounded-lg px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-zinc-100">{u.name}</span>
                    <span className="text-xs text-zinc-500">{u.email}</span>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-emerald-300">
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">
              Recent streams
            </h2>
            <ul className="space-y-2 text-sm max-h-72 overflow-y-auto">
              {streams.map((s) => (
                <li
                  key={s._id}
                  className="flex items-center justify-between border border-zinc-800 rounded-lg px-3 py-2"
                >
                  <span className="text-zinc-100 line-clamp-1">{s.title}</span>
                  <span className="text-xs text-zinc-500">{s.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

