import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";

export async function POST(req:Request){

await connectDB()

const {userId} = await req.json()

const cart = await Cart.findOne({user:userId})
.populate("items.product")

return NextResponse.json(cart)

}