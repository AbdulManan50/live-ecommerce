import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {

  await connectDB();

  const orders = await Order.find()
    .populate("products.product");

  return NextResponse.json(orders);
}