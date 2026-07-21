import {
  refreshYashieSessionFromCookies,
  setYashieSessionCookie,
} from "@/lib/yashie-session";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await refreshYashieSessionFromCookies();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({
    expiresAt: session.expiresAt,
    refreshEarlySeconds: session.refreshEarlySeconds,
    userId: session.user.id,
    valid: true,
  });

  setYashieSessionCookie(response, session);
  return response;
}
