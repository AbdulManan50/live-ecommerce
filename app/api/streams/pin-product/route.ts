import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Stream from "@/models/Stream";

export async function POST(req:Request){

await connectDB()

const {streamId,productId} = await req.json()

const stream = await Stream.findByIdAndUpdate(
streamId,
{ pinnedProduct:productId },
{ new:true }
)

return NextResponse.json(stream)

}