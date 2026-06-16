import { revalidatePath } from "next/cache";
import { ExternalProjectsClient } from "tuturuuu/external-projects";
import {
  linkPublicFolderAssets,
  uploadExternalProjectAssetFile,
} from "./tuturuuu-public-folder-sync";
import { getYashieApiBaseUrl, getYashieWorkspaceId } from "./yashie-config";
import { yashieExternalProjectManifest } from "./yashie-external-project-manifest";
import {
  getYashieSessionFromCookies,
  getYashieSessionReadStateFromCookies,
} from "./yashie-session";
import type { YashieAdminStudioPayload } from "./yashie-admin-content-model";

export function createYashieExternalProjectsClient(accessToken: string) {
  const apiBaseUrl = getYashieApiBaseUrl();
  const client = new ExternalProjectsClient({
    apiKey: accessToken,
    baseUrl: apiBaseUrl,
  });

  client.uploadAssetFile = (workspaceId, file, options) =>
    uploadExternalProjectAssetFile({
      accessToken,
      apiBaseUrl,
      collectionType: options.collectionType,
      entrySlug: options.entrySlug,
      file,
      filename: file.name,
      upsert: options.upsert,
      workspaceId,
    });

  return client;
}

async function readApiError(response: Response) {
  const fallback = `Yashie setup failed with status ${response.status}`;
  const data = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof data?.error === "string" && data.error.trim() ? data.error : fallback;
}

export async function setupYashieAdminStudio(accessToken: string) {
  const workspaceId = getYashieWorkspaceId();
  const apiBaseUrl = getYashieApiBaseUrl();
  const manifest = linkPublicFolderAssets(yashieExternalProjectManifest);
  const response = await fetch(
    `${apiBaseUrl.replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/setup`,
    {
      body: JSON.stringify({ manifest }),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
}

export async function getYashieAdminSession() {
  return getYashieSessionFromCookies();
}

export async function getYashieAdminSessionReadState() {
  return getYashieSessionReadStateFromCookies();
}

export async function getYashieAdminStudio(accessToken: string) {
  await setupYashieAdminStudio(accessToken);
  const client = createYashieExternalProjectsClient(accessToken);
  return client.getStudio(getYashieWorkspaceId()) as Promise<YashieAdminStudioPayload>;
}

export function revalidateYashieContent() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/login");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/contact");
  revalidatePath("/gallery");
  revalidatePath("/gallery/[slug]", "page");
  revalidatePath("/login");
  revalidatePath("/shop");
  revalidatePath("/shop/[slug]", "page");
  revalidatePath("/worlds/[slug]", "page");
}
