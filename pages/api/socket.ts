import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // @ts-expect-error - Next.js attaches a custom server on the socket.
  if (!res.socket.server.io) {
    // @ts-expect-error - http server exists on socket.
    const httpServer = res.socket.server;

    const io = new IOServer(httpServer, {
      path: "/api/socket",
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      socket.on("join_stream", (streamId: string) => {
        if (!streamId) return;
        socket.join(streamId);
      });

      socket.on("send_message", (data: any) => {
        if (!data?.streamId) return;
        io.to(data.streamId).emit("receive_message", data);
      });

      socket.on("reaction", (data: any) => {
        if (!data?.streamId) return;
        io.to(data.streamId).emit("reaction", data);
      });
    });

    // @ts-expect-error - store singleton on server
    res.socket.server.io = io;
  }

  res.status(200).json({ ok: true });
}

