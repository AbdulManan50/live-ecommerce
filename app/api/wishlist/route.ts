import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";

export async function POST(req: Request) {
  await connectDB();

  const { userId } = await req.json();
  const wishlist = await Wishlist.findOne({ user: userId }).populate(
    "items.product"
  );

  return NextResponse.json(wishlist);
}

