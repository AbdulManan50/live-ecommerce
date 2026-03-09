import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Stream from "@/models/Stream";

export async function GET(){

await connectDB()

const streams = await Stream.find()
.populate("seller")

return NextResponse.json(streams)

}