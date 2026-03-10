import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  await connectDB();

  try {
    const authHeader = req.headers.get("authorization");

    const rawToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader || "";

    const decoded: any = rawToken ? verifyToken(rawToken) : null;

    const { streamId, text } = await req.json();

    if (!streamId || !text) {
      return NextResponse.json(
        { error: "streamId and text are required" },
        { status: 400 }
      );
    }

    let userId: string | undefined;

    if (decoded && decoded.id) {
      const user = await User.findById(decoded.id);
      if (user) {
        userId = user._id.toString();
      }
    }

    const message = await Message.create({
      stream: streamId,
      user: userId,
      text,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}


