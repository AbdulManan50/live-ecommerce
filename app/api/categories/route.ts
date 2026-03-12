import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

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

