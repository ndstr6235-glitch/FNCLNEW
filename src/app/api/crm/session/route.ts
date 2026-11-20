import { NextRequest, NextResponse } from "next/server";
import {
  decrypt,
  refresh,
  cookieMaxAge,
  SESSION_COOKIE,
} from "@/lib/crm/session";

/** Prodlouží přihlášení, když uživatel v prohlížeči pracuje (píše, kliká) bez požadavků na server. */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await decrypt(token) : null;
  if (!session) {
    const res = NextResponse.json({ ok: false }, { status: 401 });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await refresh(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: cookieMaxAge(session),
  });
  return res;
}
