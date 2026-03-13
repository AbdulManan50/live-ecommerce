import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import "@/models/Category";
import "@/models/User";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const product = await Product.create(body);

  return NextResponse.json(product);
}

export async function GET(req: Request) {
  await connectDB();

  const url = new URL(req.url);
  const sellerId = url.searchParams.get("sellerId");

  const query: any = {};
  if (sellerId) query.seller = sellerId;

  const products = await Product.find(query)
    .populate("seller")
    .populate("category");

  return NextResponse.json(products);
}