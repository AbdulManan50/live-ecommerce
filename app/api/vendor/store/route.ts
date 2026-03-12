import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Store from "@/models/Store";

const STORE_CATEGORIES = [
  "Clothing & Fashion",
  "Electronics",
  "Shoes & Footwear",
  "Beauty & Cosmetics",
  "Home & Kitchen",
  "Sports & Fitness",
  "Bags & Accessories",
  "Mobile & Gadgets",
  "Jewelry & Watches",
  "Kids & Toys",
] as const;

function isValidCategory(v: unknown): v is (typeof STORE_CATEGORIES)[number] {
  return typeof v === "string" && (STORE_CATEGORIES as readonly string[]).includes(v);
}

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
  if (!isValidCategory(body?.category)) {
    return NextResponse.json(
      { error: "Store category is required" },
      { status: 400 }
    );
  }
  if (!String(body?.name || "").trim()) {
    return NextResponse.json({ error: "Store name is required" }, { status: 400 });
  }

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

export async function PUT(req: Request) {
  await connectDB();
  const { error, user } = await requireSeller(req);
  if (error) return error;

  const store = await Store.findOne({ owner: user!._id });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await req.json();
  if (body?.category !== undefined && !isValidCategory(body.category)) {
    return NextResponse.json({ error: "Invalid store category" }, { status: 400 });
  }

  if (body?.name !== undefined) store.name = String(body.name || "").trim();
  if (body?.description !== undefined) store.description = body.description;
  if (body?.logoUrl !== undefined) store.logoUrl = body.logoUrl;
  if (body?.contactEmail !== undefined) store.contactEmail = body.contactEmail;
  if (body?.contactPhone !== undefined) store.contactPhone = body.contactPhone;
  if (body?.category !== undefined) store.category = body.category;

  if (!store.name) {
    return NextResponse.json({ error: "Store name is required" }, { status: 400 });
  }

  await store.save();
  return NextResponse.json(store);
}

