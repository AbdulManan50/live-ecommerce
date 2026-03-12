"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket-client";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type ChatMessage = {
  _id?: string;
  text: string;
  userName?: string;
  userAvatarUrl?: string;
};

export default function ChatBox({ streamId }: { streamId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Load existing messages via HTTP
    (async () => {
      try {
        const data = await apiRequest("/api/streams/messages", "POST", {
          streamId,
        });
        const mapped: ChatMessage[] = (data || []).map((m: any) => ({
          _id: m._id,
          text: m.text,
          userName: m.user?.name,
          userAvatarUrl: m.user?.avatarUrl,
        }));
        setMessages(mapped);
      } catch {
        // fail silently for MVP
      }
    })();

    // Best-effort realtime via socket.io if configured
    const socket = getSocket();

    socket.emit("join_stream", streamId);

    socket.on("receive_message", (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: data._id,
          text: data.text,
          userName: data.user?.name,
          userAvatarUrl: data.user?.avatarUrl,
        },
      ]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [streamId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const payload = {
      streamId,
      text: message,
    };

    const token = getToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Persist via HTTP and refresh local list
    try {
      const created = await apiRequest("/api/streams/messages/send", "POST", payload, {
        authToken: token,
      });

      // Broadcast to others with full user info (so UI can show avatar/name instantly)
      try {
        const socket = getSocket();
        socket.emit("send_message", {
          ...created,
          user: created.user,
        });
      } catch {
        // ignore socket failures in MVP
      }

      const data = await apiRequest("/api/streams/messages", "POST", {
        streamId,
      });
      const mapped: ChatMessage[] = (data || []).map((m: any) => ({
        _id: m._id,
        text: m.text,
        userName: m.user?.name,
        userAvatarUrl: m.user?.avatarUrl,
      }));
      setMessages(mapped);
    } catch {
      // ignore errors for now
    }

    setMessage("");
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-950/60">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-100">Live Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
        {messages.length === 0 ? (
          <p className="text-zinc-500">No messages yet. Be the first to say hi!</p>
        ) : (
          messages.map((m, idx) => (
            <div key={m._id || idx} className="flex gap-2">
              <div className="shrink-0">
                {m.userAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.userAvatarUrl}
                    alt={m.userName || "User"}
                    className="h-7 w-7 rounded-full object-cover border border-zinc-800"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                    {m.userName?.slice(0, 1)?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                {m.userName && (
                  <span className="text-xs font-medium text-emerald-400">
                    {m.userName}
                  </span>
                )}
                <span className="text-zinc-100">{m.text}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 px-3 py-3 border-t border-zinc-800">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border border-zinc-800 bg-zinc-900 text-sm text-zinc-100 rounded-lg px-3 py-2 flex-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
          placeholder="Type your message..."
        />

        <button
          onClick={sendMessage}
          className="px-3 py-2 text-sm font-medium rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
