import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .sort({ title: 1 })
      .select("title slug");

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded: any = verifyToken(rawToken);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await User.findById(decoded.id);
    // Sellers should NOT create categories manually.
    // Keep this endpoint restricted to admins only.
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, slug } = await req.json();
    const safeTitle = String(title || "").trim();
    const safeSlug = slugify(String(slug || safeTitle));

    if (!safeTitle) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!safeSlug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const exists = await Category.findOne({ slug: safeSlug });
    if (exists) {
      return NextResponse.json(
        { error: "Category slug already exists" },
        { status: 409 }
      );
    }

    const created = await Category.create({ title: safeTitle, slug: safeSlug });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

