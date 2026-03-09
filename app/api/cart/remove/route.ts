import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";

export async function POST(req:Request){

await connectDB()

const {userId,productId} = await req.json()

const cart = await Cart.findOne({user:userId})

cart.items = cart.items.filter(
(item:any)=>item.product.toString() !== productId
)

await cart.save()

return NextResponse.json(cart)

}   