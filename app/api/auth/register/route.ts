import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/utils/generateToken";

export async function POST(req: Request) {
  await connectDB();

  const { name, email, password, role } = await req.json();

  const normalizedRole =
    role === "seller" || role === "admin" || role === "user" ? role : "user";

  if (normalizedRole === "admin") {
    return NextResponse.json(
      { error: "Admin accounts cannot be created here" },
      { status: 403 }
    );
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: normalizedRole,
  });

  const token = generateToken(user._id.toString());

  return NextResponse.json({ user, token });
}