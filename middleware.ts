import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Basic middleware: runs on every request and can be extended
export function middleware(_request: NextRequest) {
  // For now we just let the request pass through.
  // Add auth, logging, or routing logic here later if needed.
  return NextResponse.next();
}

// Optional: limit which paths use this middleware
// export const config = {
//   matcher: ["/streams/:path*", "/api/:path*"],
// };

