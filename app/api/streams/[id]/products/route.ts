import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Stream from "@/models/Stream";
import Product from "@/models/Product";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;
  const stream = await Stream.findById(id).select("seller");
  if (!stream) {
    return NextResponse.json({ error: "Stream not found" }, { status: 404 });
  }

  const products = await Product.find({ seller: stream.seller })
    .sort({ createdAt: -1 })
    .select("title price images stock description")
    .limit(50);

  return NextResponse.json(products);
}

