import type { Metadata } from "next";
import { Suspense } from "react";
import { YashieAdminDashboard } from "@/components/admin/YashieAdminDashboard";
import { YashieAdminLoadingPanel } from "@/components/admin/YashieAdminLoadingPanel";
import { YashieAdminLoginPanel } from "@/components/admin/YashieAdminLoginPanel";
import { YashieAdminSessionRestorer } from "@/components/admin/YashieAdminSessionRestorer";
import { getYashieCentralizedLoginHref } from "./login-link";
import {
  readYashieAdminContent,
  type YashieAdminStudioPayload,
} from "@/lib/yashie-admin-content-model";
import { readYashieAdminSiteSettings } from "@/lib/yashie-admin-site-settings";
import {
  buildYashieDriveUrl,
  buildYashieWorkspaceUrl,
  resolveYashieAdminTargetKey,
} from "@/lib/yashie-config";
import {
  getYashieAdminSessionReadState,
  getYashieAdminStudio,
} from "@/lib/yashie-admin-api";
import { getYashieStorageAnalytics } from "@/lib/yashie-storage-analytics";
import { getYashieStorageFiles } from "@/lib/yashie-storage-files";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yashie Dashboard",
  description: "Friendly website dashboard for InkedByYashie.",
};

type AuthenticatedYashieAdminSession = Extract<
  Awaited<ReturnType<typeof getYashieAdminSessionReadState>>,
  { status: "authenticated" }
>["session"];

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
  const resolvedSearchParams = await searchParams;
  const activeTarget = resolveYashieAdminTargetKey(
    resolvedSearchParams?.target,
  );
  const loginHref = await getYashieCentralizedLoginHref(activeTarget);
  const sessionState = await getYashieAdminSessionReadState();

  if (sessionState.status === "unauthenticated") {
    return <YashieAdminLoginPanel loginHref={loginHref} />;
  }

  if (sessionState.status === "refreshable") {
    return <YashieAdminSessionRestorer loginHref={loginHref} />;
  }

  const { session } = sessionState;

  return (
    <Suspense fallback={<YashieAdminLoadingPanel />}>
      <AuthenticatedAdminDashboard session={session} />
    </Suspense>
  );
}

async function AuthenticatedAdminDashboard({
  session,
}: {
  session: AuthenticatedYashieAdminSession;
}) {
  const [studio, storageAnalytics, storageFiles] = await Promise.all([
    getYashieAdminStudio(session.accessToken).catch(() => emptyStudio()),
    getYashieStorageAnalytics(session.accessToken),
    getYashieStorageFiles(session.accessToken),
  ]);

  return (
    <YashieAdminDashboard
      initialContent={{
        worlds: readYashieAdminContent(studio, "worlds"),
        categories: readYashieAdminContent(studio, "categories"),
        blog: readYashieAdminContent(studio, "blog"),
        gallery: readYashieAdminContent(studio, "gallery"),
        shop: readYashieAdminContent(studio, "shop"),
      }}
      initialSiteSettings={readYashieAdminSiteSettings(studio)}
      driveHref={buildYashieDriveUrl()}
      membersHref={buildYashieWorkspaceUrl({ targetKey: "members" })}
      sessionExpiresAt={session.expiresAt}
      sessionRefreshEarlySeconds={session.refreshEarlySeconds}
      storageAnalytics={storageAnalytics}
      storageFiles={storageFiles}
      userEmail={session.user.email}
    />
  );
}
