import { NextResponse } from "next/server";

export async function POST(req:Request){

const {streamId,userId} = await req.json()

return NextResponse.json({
message:"User joined stream",
streamId,
userId
})

}