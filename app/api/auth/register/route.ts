import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/utils/generateToken";

export async function POST(req: Request) {
  await connectDB();

  const { name, email, password } = await req.json();

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
  });

  const token = generateToken(user._id.toString());

  return NextResponse.json({ user, token });
}