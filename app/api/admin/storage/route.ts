import { NextResponse } from "next/server";
import {
  getYashieAdminSession,
  revalidateYashieContent,
} from "@/lib/yashie-admin-api";
import { getYashieApiBaseUrl, getYashieWorkspaceId } from "@/lib/yashie-config";

export const dynamic = "force-dynamic";

function getPlatformStorageUrl(request: Request) {
  const incomingUrl = new URL(request.url);
  const apiBaseUrl = getYashieApiBaseUrl().replace(/\/+$/, "");
  const workspaceId = getYashieWorkspaceId();
  const url = new URL(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/external-projects/storage`,
  );

  for (const [key, value] of incomingUrl.searchParams) {
    url.searchParams.append(key, value);
  }

  return url;
}

async function readPlatformPayload(response: Response) {
  return (await response.json().catch(async () => ({
    error: (await response.text().catch(() => "")) || "Storage request failed",
  }))) as unknown;
}

async function forwardStorageRequest(request: Request, method: string) {
  const session = await getYashieAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${session.accessToken}`,
  };
  let body: BodyInit | undefined;

  if (method !== "GET") {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      body = await request.text();
      headers["Content-Type"] = "application/json";
    }
  }

  const response = await fetch(getPlatformStorageUrl(request), {
    body,
    cache: "no-store",
    headers,
    method,
  });
  const payload = await readPlatformPayload(response);

  if (response.ok && method !== "GET") {
    revalidateYashieContent();
  }

  return NextResponse.json(payload, { status: response.status });
}

export async function GET(request: Request) {
  return forwardStorageRequest(request, "GET");
}

export async function POST(request: Request) {
  return forwardStorageRequest(request, "POST");
}

export async function PATCH(request: Request) {
  return forwardStorageRequest(request, "PATCH");
}

export async function DELETE(request: Request) {
  return forwardStorageRequest(request, "DELETE");
}
