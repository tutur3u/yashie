import { buildYashieCentralizedLoginUrl, resolveYashieAdminTargetKey } from "@/lib/yashie-config";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const targetKey = resolveYashieAdminTargetKey(request.nextUrl.searchParams.get("next"));
  const nextUrl = targetKey === "dashboard" ? "/admin" : `/admin?target=${targetKey}`;

  return NextResponse.redirect(
    buildYashieCentralizedLoginUrl({
      appBaseUrl: request.nextUrl.origin,
      nextUrl,
    }),
  );
}
