import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Store from "@/models/Store";

async function requireSeller(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const rawToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  const decoded: any = verifyToken(rawToken);
  if (!decoded?.id) {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }

  const user = await User.findById(decoded.id);
  if (!user || user.role !== "seller") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

export async function GET(req: Request) {
  await connectDB();
  const { error, user } = await requireSeller(req);
  if (error) return error;

  const store = await Store.findOne({ owner: user!._id });
  return NextResponse.json(store);
}

export async function POST(req: Request) {
  await connectDB();
  const { error, user } = await requireSeller(req);
  if (error) return error;

  const existing = await Store.findOne({ owner: user!._id });
  if (existing) {
    return NextResponse.json(existing);
  }

  const body = await req.json();
  const store = await Store.create({
    owner: user!._id,
    name: body?.name,
    description: body?.description,
    logoUrl: body?.logoUrl,
    contactEmail: body?.contactEmail,
    contactPhone: body?.contactPhone,
    category: body?.category,
  });

  user!.store = store._id;
  await user!.save();

  return NextResponse.json(store, { status: 201 });
}

