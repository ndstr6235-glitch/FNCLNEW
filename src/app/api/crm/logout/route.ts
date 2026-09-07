import { NextResponse } from "next/server";
import { deleteSession, getSession } from "@/lib/crm/auth";
import { logAudit } from "@/app/actions/crm/audit";

export async function POST() {
  const session = await getSession();
  if (session) {
    await logAudit(session.id, "LOGOUT", "user", session.id, `${session.firstName} ${session.lastName}`);
  }
  await deleteSession();
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"), 303);
}
