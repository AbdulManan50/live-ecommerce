import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Stream from "@/models/Stream";

export async function POST(req: Request) {

  await connectDB();

  const { sellerId } = await req.json();

  const streams = await Stream.find({
    seller: sellerId
  });

  return NextResponse.json(streams);
}