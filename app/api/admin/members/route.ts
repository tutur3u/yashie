import { getYashieAdminSession } from "@/lib/yashie-admin-api";
import {
  getYashieAdminMembers,
  YashieAdminMembersError,
} from "@/lib/yashie-admin-members";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

function readErrorStatus(error: unknown) {
  return error instanceof YashieAdminMembersError ? error.status : 500;
}

export async function GET() {
  const session = await getYashieAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getYashieAdminMembers(session.accessToken));
  } catch (error) {
    return NextResponse.json(
      { error: readErrorMessage(error) },
      { status: readErrorStatus(error) },
    );
  }
}
