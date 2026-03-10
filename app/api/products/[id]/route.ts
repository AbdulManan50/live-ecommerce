import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const product = await Product.findById(params.id).populate("seller");

  if (!product) {
    return NextResponse.json({ error: "Product not found" });
  }

  return NextResponse.json(product);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const body = await req.json();

  const product = await Product.findByIdAndUpdate(
    params.id,
    body,
    { new: true }
  );

  return NextResponse.json(product);
}