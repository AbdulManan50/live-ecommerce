import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  await connectDB();

  const token = req.headers.get("authorization");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" });
  }

  const decoded:any = jwt.verify(token, process.env.JWT_SECRET!);

  const user = await User.findById(decoded.id).select("-password");

  return NextResponse.json(user);
}