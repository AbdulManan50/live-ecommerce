import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";

export async function POST(req: Request) {
  await connectDB();

  const { userId, productId, quantity } = await req.json();

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity }],
    });
  } else {
    cart.items.push({
      product: productId,
      quantity,
    });

    await cart.save();
  }

  return NextResponse.json(cart);
}
