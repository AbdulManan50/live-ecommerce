import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  const product = await Product.findById(id)
    .populate("seller")
    .populate("category");

  if (!product) {
    return NextResponse.json({ error: "Product not found" });
  }

  return NextResponse.json(product);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

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
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await Product.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const isOwner = existing.seller?.toString() === user._id.toString();
  const canEdit = user.role === "admin" || (user.role === "seller" && isOwner);
  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const product = await Product.findByIdAndUpdate(
    id,
    body,
    { new: true }
  );

  return NextResponse.json(product);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

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
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await Product.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const isOwner = existing.seller?.toString() === user._id.toString();
  const canDelete =
    user.role === "admin" || (user.role === "seller" && isOwner);
  if (!canDelete) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Product.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}