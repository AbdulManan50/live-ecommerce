    import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req: Request) {

  await connectDB();

  const { sellerId } = await req.json();

  const products = await Product.find({
    seller: sellerId
  });

  return NextResponse.json(products);
}