import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: Request) {
  await connectDB();

  const { user, products, totalPrice } = await req.json();

  const order = await Order.create({
    user,
    products,
    totalPrice,
  });

  return NextResponse.json(order);
}

