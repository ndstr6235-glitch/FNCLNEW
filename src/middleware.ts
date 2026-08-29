import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Serve the static investment website at root
  if (request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/static/index.html", request.url));
  }
}

export const config = {
  matcher: "/",
};
