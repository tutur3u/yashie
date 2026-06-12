import { NextResponse } from "next/server";
import {
  getYashieAdminSession,
  getYashieAdminStudio,
  setupYashieAdminStudio,
} from "@/lib/yashie-admin-api";
import {
  parseYashieSiteSettingsPayload,
  readYashieAdminSiteSettings,
  updateYashieAdminSiteSettings,
} from "@/lib/yashie-admin-site-settings";

export const dynamic = "force-dynamic";

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export async function GET() {
  const session = await getYashieAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const studio = await getYashieAdminStudio(session.accessToken);
    return NextResponse.json({
      settings: readYashieAdminSiteSettings(studio),
    });
  } catch (error) {
    return NextResponse.json({ error: readErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getYashieAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { errors, input } = parseYashieSiteSettingsPayload(
    await request.json().catch(() => null),
  );

  if (!input) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    await setupYashieAdminStudio(session.accessToken);
    return NextResponse.json({
      settings: await updateYashieAdminSiteSettings(session.accessToken, input),
    });
  } catch (error) {
    return NextResponse.json({ error: readErrorMessage(error) }, { status: 500 });
  }
}
