import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";

export async function POST(req:Request){

await connectDB()

const {streamId} = await req.json()

const messages = await Message.find({
stream:streamId
}).populate("user","name avatarUrl")

return NextResponse.json(messages)

}