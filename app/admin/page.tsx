import type { Metadata } from "next";
import { YashieAdminDashboard } from "@/components/admin/YashieAdminDashboard";
import { YashieAdminLoginPanel } from "@/components/admin/YashieAdminLoginPanel";
import { getYashieCentralizedLoginHref } from "./login-link";
import {
  readYashieAdminContent,
  type YashieAdminStudioPayload,
} from "@/lib/yashie-admin-content-model";
import { resolveYashieAdminTargetKey } from "@/lib/yashie-config";
import { getYashieAdminStudio } from "@/lib/yashie-admin-api";
import { getYashieSessionFromCookies } from "@/lib/yashie-session";
import { getYashieStorageAnalytics } from "@/lib/yashie-storage-analytics";
import { getYashieStorageFiles } from "@/lib/yashie-storage-files";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yashie Dashboard",
  description: "Friendly website dashboard for InkedByYashie.",
};

function emptyStudio(): YashieAdminStudioPayload {
  return {
    assets: [],
    blocks: [],
    collections: [],
    entries: [],
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ target?: string }>;
}) {
  const session = await getYashieSessionFromCookies();
  const resolvedSearchParams = await searchParams;
  const activeTarget = resolveYashieAdminTargetKey(
    resolvedSearchParams?.target,
  );

  if (!session) {
    return (
      <YashieAdminLoginPanel
        loginHref={await getYashieCentralizedLoginHref(activeTarget)}
      />
    );
  }

  const [studio, storageAnalytics, storageFiles] = await Promise.all([
    getYashieAdminStudio(session.accessToken).catch(() => emptyStudio()),
    getYashieStorageAnalytics(session.accessToken),
    getYashieStorageFiles(session.accessToken),
  ]);

  return (
    <YashieAdminDashboard
      initialContent={{
        blog: readYashieAdminContent(studio, "blog"),
        gallery: readYashieAdminContent(studio, "gallery"),
        shop: readYashieAdminContent(studio, "shop"),
      }}
      storageAnalytics={storageAnalytics}
      storageFiles={storageFiles}
      userEmail={session.user.email}
    />
  );
}
