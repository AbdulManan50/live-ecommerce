import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    // Connect to the in-app Socket.io endpoint
    socket = io({
      path: "/api/socket",
      transports: ["websocket"],
    });
  }

  return socket;
}

