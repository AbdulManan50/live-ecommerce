import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";

export async function POST(req: Request) {
  await connectDB();

  const { userId, productId } = await req.json();

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      items: [{ product: productId }],
    });
    return NextResponse.json(wishlist);
  }

  const exists = wishlist.items.some(
    (i: any) => i.product.toString() === productId
  );
  if (!exists) {
    wishlist.items.unshift({ product: productId });
    await wishlist.save();
  }

  return NextResponse.json(wishlist);
}

