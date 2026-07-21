import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { YashieAdminDashboard } from "@/components/admin/YashieAdminDashboard";
import { YashieAdminLoadingPanel } from "@/components/admin/YashieAdminLoadingPanel";
import { YashieAdminLoginPanel } from "@/components/admin/YashieAdminLoginPanel";
import { YashieAdminSessionRestorer } from "@/components/admin/YashieAdminSessionRestorer";
import { getYashieCentralizedLoginHref } from "./login-link";
import {
  needsYashieStarterContent,
  readYashieAdminContent,
  type YashieAdminStudioPayload,
} from "@/lib/yashie-admin-content-model";
import { readYashieAdminSiteSettings } from "@/lib/yashie-admin-site-settings";
import {
  buildYashieDriveUrl,
  buildYashieTasksUrl,
  buildYashieWorkspaceUrl,
  resolveYashieAdminTargetKey,
} from "@/lib/yashie-config";
import {
  getYashieAdminSessionReadState,
  getYashieAdminStudio,
} from "@/lib/yashie-admin-api";
import { getYashieContent } from "@/lib/yashie-delivery";
import { isYashieNavTabVisible } from "@/lib/yashie-navigation-access";
import { getYashieStorageAnalytics } from "@/lib/yashie-storage-analytics";
import { getYashieStorageFiles } from "@/lib/yashie-storage-files";

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

export default function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ target?: string }>;
}) {
  return (
    <Suspense fallback={<YashieAdminLoadingPanel />}>
      <YashieAdminContent searchParams={searchParams} />
    </Suspense>
  );
}

async function YashieAdminContent({
  searchParams,
}: {
  searchParams?: Promise<{ target?: string }>;
}) {
  await connection();

  const resolvedSearchParams = await searchParams;
  const activeTarget = resolveYashieAdminTargetKey(
    resolvedSearchParams?.target,
  );
  const [content, loginHref, sessionState] = await Promise.all([
    getYashieContent(),
    getYashieCentralizedLoginHref(activeTarget),
    getYashieAdminSessionReadState(),
  ]);

  if (
    !isYashieNavTabVisible(content, "login") &&
    sessionState.status === "unauthenticated"
  ) {
    notFound();
  }

  if (sessionState.status === "unauthenticated") {
    return <YashieAdminLoginPanel loginHref={loginHref} />;
  }

  if (sessionState.status === "refreshable") {
    return <YashieAdminSessionRestorer loginHref={loginHref} />;
  }

  const { session } = sessionState;

  return <AuthenticatedAdminDashboard session={session} />;
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
  const initialContent = {
    worlds: readYashieAdminContent(studio, "worlds"),
    categories: readYashieAdminContent(studio, "categories"),
    blog: readYashieAdminContent(studio, "blog"),
    gallery: readYashieAdminContent(studio, "gallery"),
    shop: readYashieAdminContent(studio, "shop"),
  };
  const hasPublicFallbackCollection = needsYashieStarterContent(initialContent);

  return (
    <YashieAdminDashboard
      initialContent={initialContent}
      initialNeedsImport={hasPublicFallbackCollection}
      initialSiteSettings={readYashieAdminSiteSettings(studio)}
      driveHref={buildYashieDriveUrl()}
      membersHref={buildYashieWorkspaceUrl({ targetKey: "members" })}
      sessionExpiresAt={session.expiresAt}
      sessionRefreshEarlySeconds={session.refreshEarlySeconds}
      storageAnalytics={storageAnalytics}
      storageFiles={storageFiles}
      tasksHref={buildYashieTasksUrl()}
      userEmail={session.user.email}
    />
  );
}
