import { NextRequest, NextResponse } from "next/server";
import { deleteSession, getSession } from "@/lib/crm/auth";
import { logAudit } from "@/app/actions/crm/audit";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (session) {
    await logAudit(session.id, "LOGOUT", "user", session.id, `${session.firstName} ${session.lastName}`);
  }
  await deleteSession();
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
