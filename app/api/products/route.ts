import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const product = await Product.create(body);

  return NextResponse.json(product);
}

export async function GET() {
  await connectDB();

  const products = await Product.find().populate("seller");

  return NextResponse.json(products);
}