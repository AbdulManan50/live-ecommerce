import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  await connectDB();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  const decoded: any = verifyToken(rawToken);
  if (!decoded?.id) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await User.findById(decoded.id);
  if (!user || user.role !== "seller") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = await Product.find({ seller: user._id })
    .sort({ createdAt: -1 })
    .populate("category");

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await connectDB();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  const decoded: any = verifyToken(rawToken);
  if (!decoded?.id) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await User.findById(decoded.id);
  if (!user || user.role !== "seller") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const product = await Product.create({
    ...body,
    seller: user._id,
  });

  return NextResponse.json(product, { status: 201 });
}