import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Stream from "@/models/Stream";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  await connectDB();

  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rawToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded: any = verifyToken(rawToken);

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id);

    if (!user || user.role !== "seller") {
      return NextResponse.json(
        { error: "Only sellers can end streams" },
        { status: 403 }
      );
    }

    const { streamId } = await req.json();

    if (!streamId) {
      return NextResponse.json(
        { error: "streamId is required" },
        { status: 400 }
      );
    }

    const stream = await Stream.findOneAndUpdate(
      { _id: streamId, seller: user._id },
      { status: "ended" },
      { new: true }
    );

    if (!stream) {
      return NextResponse.json(
        { error: "Stream not found or not owned by seller" },
        { status: 404 }
      );
    }

    return NextResponse.json(stream);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to end stream" },
      { status: 500 }
    );
  }
}