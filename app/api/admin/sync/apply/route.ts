import {
  linkPublicFolderAssets,
  syncPublicFolderAssets,
} from "@/lib/tuturuuu-public-folder-sync";
import {
  getYashieApiBaseUrl,
  getYashieAppBaseUrl,
  getYashieWorkspaceId,
} from "@/lib/yashie-config";
import { yashieExternalProjectManifest } from "@/lib/yashie-external-project-manifest";
import { getYashieSessionFromCookies } from "@/lib/yashie-session";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYNC_PHASE_TIMEOUT_MS = 60_000;

async function readApiError(response: Response) {
  const fallback = `Tuturuuu sync apply failed with status ${response.status}`;
  const data = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof data?.error === "string" && data.error.trim() ? data.error : fallback;
}

function readFailureMessage(error: unknown, phase: string) {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return `${phase} took too long. Please try again.`;
  }

  return error instanceof Error ? error.message : `${phase} failed.`;
}

async function runSyncRequest(
  requestId: string,
  phase: string,
  url: string,
  init: RequestInit,
) {
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(SYNC_PHASE_TIMEOUT_MS),
    });

    console.info("[yashie-admin-sync] phase completed", {
      durationMs: Date.now() - startedAt,
      phase,
      requestId,
      status: response.status,
    });
    return response;
  } catch (error) {
    console.error("[yashie-admin-sync] phase failed", {
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown error",
      phase,
      requestId,
    });
    throw new Error(readFailureMessage(error, phase));
  }
}

export async function POST(request: Request) {
  const session = await getYashieSessionFromCookies();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    force?: unknown;
    uploadAssets?: unknown;
  } | null;
  const requestId = request.headers.get("x-vercel-id") ?? crypto.randomUUID();
  const workspaceId = getYashieWorkspaceId();
  const apiBaseUrl = getYashieApiBaseUrl();
  const appBaseUrl = getYashieAppBaseUrl(new URL(request.url).origin);
  const manifest = linkPublicFolderAssets(yashieExternalProjectManifest);
  const setupUrl = `${apiBaseUrl.replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
    workspaceId,
  )}/external-projects/setup`;

  try {
    const setupResponse = await runSyncRequest(requestId, "Starter setup", setupUrl, {
      body: JSON.stringify({ manifest }),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `${session.tokenType} ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!setupResponse.ok) {
      return NextResponse.json(
        { error: await readApiError(setupResponse) },
        { status: setupResponse.status },
      );
    }

    const uploadAssets = body?.uploadAssets === true;
    const publicAssetSync = uploadAssets
      ? await syncPublicFolderAssets({
          accessToken: session.accessToken,
          apiBaseUrl,
          appBaseUrl,
          manifest,
          requestTimeoutMs: SYNC_PHASE_TIMEOUT_MS,
          tokenType: session.tokenType,
          workspaceId,
        })
      : { manifest, skipped: [], uploaded: [] };

    if (publicAssetSync.skipped.length > 0) {
      return NextResponse.json(
        {
          error: "Some starter images could not be prepared. No content was restored.",
          publicAssetSync: {
            mode: uploadAssets ? "uploaded" : "linked",
            skipped: publicAssetSync.skipped,
            uploaded: publicAssetSync.uploaded,
          },
        },
        { status: 400 },
      );
    }

    const applyUrl = `${apiBaseUrl.replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/sync/apply`;
    const response = await runSyncRequest(requestId, "Starter restore", applyUrl, {
      body: JSON.stringify({
        force: body?.force === true,
        manifest: publicAssetSync.manifest,
      }),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `${session.tokenType} ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: await readApiError(response) },
        { status: response.status },
      );
    }

    revalidatePath("/", "layout");
    return NextResponse.json({
      ...(await response.json()),
      publicAssetSync: {
        mode: uploadAssets ? "uploaded" : "linked",
        skipped: publicAssetSync.skipped,
        uploaded: publicAssetSync.uploaded,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: readFailureMessage(error, "Starter restore") },
      { status: 503 },
    );
  }
}
