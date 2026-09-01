import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CRM_ROUTES = [
  "/dashboard", "/clients", "/cms", "/emails", "/calendar",
  "/contracts", "/documents", "/users", "/settings", "/templates",
  "/tickets", "/audit", "/calling", "/database",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Serve the static investment website at root
  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/static/index.html", request.url));
  }

  // Protect CRM routes — redirect to /login if no session cookie
  if (CRM_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    const session = request.cookies.get("session");
    if (!session?.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/clients/:path*", "/cms/:path*",
    "/emails/:path*", "/calendar/:path*", "/contracts/:path*",
    "/documents/:path*", "/users/:path*", "/settings/:path*",
    "/templates/:path*", "/tickets/:path*", "/audit/:path*",
    "/calling/:path*", "/database/:path*"],
};
