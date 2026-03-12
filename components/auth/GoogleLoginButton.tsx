"use client";

import { useEffect, useRef, useState } from "react";
import { saveToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import { roleHomePath } from "@/lib/role-redirect";

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleLoginButton() {
  const btnRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [clientId]);

  useEffect(() => {
    if (!ready || !clientId || !btnRef.current) return;
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        const res = await apiRequest("/api/auth/google", "POST", {
          credential: response.credential,
        });
        if (res?.token && res?.user?.role) {
          saveToken(res.token);
          window.location.href = roleHomePath(res.user.role);
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      shape: "pill",
    });
  }, [ready, clientId]);

  if (!clientId) return null;

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <div ref={btnRef} />
      <p className="text-[11px] text-zinc-500">
        Google login is available for user accounts.
      </p>
    </div>
  );
}

