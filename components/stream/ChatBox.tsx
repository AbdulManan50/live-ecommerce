"use client";

import { useState } from "react";
import { socket } from "@/lib/socket";

export default function ChatBox({ streamId }: any) {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    socket.emit("send_message", {
      streamId,
      text: message,
    });

    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">Messages</div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 flex-1"
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
