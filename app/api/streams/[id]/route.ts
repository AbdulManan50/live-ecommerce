import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Stream from "@/models/Stream";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  try {
    const { id } = await params;

    const stream = await Stream.findById(id)
      .populate("seller")
      .populate("pinnedProduct");

    if (!stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(stream);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load stream" },
      { status: 500 }
    );
  }
}

