import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  decrypt,
  refresh,
  cookieMaxAge,
  SESSION_COOKIE,
  SESSION_REFRESH_MS,
} from "@/lib/crm/session";

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
    "/projekty/velka-dobra": "/static/projekty/velka-dobra.html",
    "/projekty/vila-bechovice": "/static/projekty/vila-bechovice.html",
    "/projekty/vila-horomerice": "/static/projekty/vila-horomerice.html",
    "/projekty/byt-praha-3": "/static/projekty/byt-praha-3.html",
    "/projekty/byt-praha-5": "/static/projekty/byt-praha-5.html",
    "/projekty/byt-praha-10": "/static/projekty/byt-praha-10.html",
    "/projekty/byt-praha-4": "/static/projekty/byt-praha-4.html",
  };
  if (staticPages[pathname]) {
    return NextResponse.rewrite(new URL(staticPages[pathname], request.url));
  }

  // Protect CRM routes — platná session, max 12 h, odhlášení po 30 min nečinnosti
  if (isCrmRoute(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await decrypt(token) : null;
    if (!session) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      if (token) response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    // Aktivita → posunout poslední aktivitu (nejvýš jednou za minutu)
    if (Date.now() - session.lastSeen > SESSION_REFRESH_MS) {
      const response = NextResponse.next();
      response.cookies.set(SESSION_COOKIE, await refresh(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: cookieMaxAge(session),
      });
      return response;
    }
  }
}

export const config = {
  matcher: ["/", "/sluzby/:path*", "/projekty/:path*", "/dashboard/:path*", "/clients/:path*", "/cms/:path*",
    "/emails/:path*", "/calendar/:path*", "/contracts/:path*",
    "/documents/:path*", "/users/:path*", "/settings/:path*",
    "/templates/:path*", "/tickets/:path*", "/audit/:path*",
    "/calling/:path*", "/database/:path*"],
};
