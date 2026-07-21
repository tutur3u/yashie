import { clearYashieSessionCookie } from "@/lib/yashie-session";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);

  clearYashieSessionCookie(response);
  return response;
}
