import { NextResponse } from "next/server";
import { getYashieAdminSession } from "@/lib/yashie-admin-api";
import { getYashieStorageAnalytics } from "@/lib/yashie-storage-analytics";

export async function GET() {
  const session = await getYashieAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    await getYashieStorageAnalytics(session.accessToken),
  );
}
