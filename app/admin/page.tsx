import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { YashieAdminDashboard } from "@/components/admin/YashieAdminDashboard";
import {
  readYashieAdminContent,
  type YashieAdminStudioPayload,
} from "@/lib/yashie-admin-content-model";
import {
  getYashieAdminLoginPath,
  resolveYashieAdminTargetKey,
} from "@/lib/yashie-config";
import { getYashieAdminStudio } from "@/lib/yashie-admin-api";
import { getYashieSessionFromCookies } from "@/lib/yashie-session";
import { getYashieStorageAnalytics } from "@/lib/yashie-storage-analytics";

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
  const activeTarget = resolveYashieAdminTargetKey(resolvedSearchParams?.target);

  if (!session) {
    redirect(getYashieAdminLoginPath(activeTarget));
  }

  const [studio, storageAnalytics] = await Promise.all([
    getYashieAdminStudio(session.accessToken).catch(() => emptyStudio()),
    getYashieStorageAnalytics(session.accessToken),
  ]);

  return (
    <YashieAdminDashboard
      initialContent={{
        blog: readYashieAdminContent(studio, "blog"),
        gallery: readYashieAdminContent(studio, "gallery"),
        shop: readYashieAdminContent(studio, "shop"),
      }}
      storageAnalytics={storageAnalytics}
      userEmail={session.user.email}
    />
  );
}
