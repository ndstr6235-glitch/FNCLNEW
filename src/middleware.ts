import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const CRM_ROUTES = [
  "/dashboard", "/clients", "/cms", "/emails", "/calendar",
  "/contracts", "/documents", "/users", "/settings", "/templates",
  "/tickets", "/audit", "/calling", "/database",
];

function isCrmRoute(pathname: string): boolean {
  return CRM_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Serve the static investment website at root
  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/static/index.html", request.url));
  }

  // Serve static subpages (services etc.)
  const staticPages: Record<string, string> = {
    "/sluzby/development": "/static/sluzby/development.html",
    "/sluzby/rekonstrukce": "/static/sluzby/rekonstrukce.html",
    "/sluzby/investice": "/static/sluzby/investice.html",
    "/sluzby/reality": "/static/sluzby/reality.html",
    "/sluzby/pronajem": "/static/sluzby/pronajem.html",
  };
  if (staticPages[pathname]) {
    return NextResponse.rewrite(new URL(staticPages[pathname], request.url));
  }

  // Protect CRM routes — verify session JWT
  if (isCrmRoute(pathname)) {
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
      await jwtVerify(token, secret);
    } catch {
      // Invalid or expired token — clear cookie and redirect
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }
}

export const config = {
  matcher: ["/", "/sluzby/:path*", "/dashboard/:path*", "/clients/:path*", "/cms/:path*",
    "/emails/:path*", "/calendar/:path*", "/contracts/:path*",
    "/documents/:path*", "/users/:path*", "/settings/:path*",
    "/templates/:path*", "/tickets/:path*", "/audit/:path*",
    "/calling/:path*", "/database/:path*"],
};
