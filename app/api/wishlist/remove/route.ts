import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";

export async function POST(req: Request) {
  await connectDB();

  const { userId, productId } = await req.json();

  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
  }

  wishlist.items = wishlist.items.filter(
    (i: any) => i.product.toString() !== productId
  );
  await wishlist.save();

  return NextResponse.json(wishlist);
}

