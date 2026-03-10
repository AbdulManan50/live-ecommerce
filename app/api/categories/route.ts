import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";

export async function GET() {
  try {
    const categories = await sanityClient.fetch(
      `*[_type == "category"] | order(orderRank asc){
        _id,
        title,
        "slug": slug.current
      }`
    );

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}

