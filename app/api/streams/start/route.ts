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
        { error: "Only sellers can start streams" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, categorySlug } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const stream = await Stream.create({
      title,
      seller: user._id,
      status: "live",
      categorySlug: categorySlug || undefined,
    });

    return NextResponse.json(stream, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start stream" },
      { status: 500 }
    );
  }
}

