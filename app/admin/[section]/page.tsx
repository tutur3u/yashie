import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { YashieAdminDashboard } from "@/components/admin/YashieAdminDashboard";
import { YashieAdminLoginPanel } from "@/components/admin/YashieAdminLoginPanel";
import { YashieAdminSessionRestorer } from "@/components/admin/YashieAdminSessionRestorer";
import { getYashieCentralizedLoginHref } from "../login-link";
import {
  readYashieAdminContent,
  type YashieAdminStudioPayload,
} from "@/lib/yashie-admin-content-model";
import { readYashieAdminSiteSettings } from "@/lib/yashie-admin-site-settings";
import {
  buildYashieDriveUrl,
  buildYashieWorkspaceUrl,
} from "@/lib/yashie-config";
import {
  getYashieAdminPageSessionReadState,
  getYashieAdminStorageSnapshot,
  getYashieAdminStudioSnapshot,
} from "@/lib/yashie-admin-api";
import { getYashieContent } from "@/lib/yashie-delivery";
import { isYashieNavTabVisible } from "@/lib/yashie-navigation-access";
import {
  isYashieAdminSection,
  isYashieAdminStudioSection,
  type YashieAdminSection,
} from "@/lib/yashie-admin-sections";
import type { YashieStorageAnalyticsState } from "@/lib/yashie-storage-analytics";
import type { YashieStorageFilesState } from "@/lib/yashie-storage-files";

export const metadata: Metadata = {
  title: "Yashie Dashboard",
  description: "Friendly website dashboard for InkedByYashie.",
};

type AuthenticatedSession = Extract<
  Awaited<ReturnType<typeof getYashieAdminPageSessionReadState>>,
  { status: "authenticated" }
>["session"];

function emptyStudio(): YashieAdminStudioPayload {
  return { assets: [], blocks: [], collections: [], entries: [] };
}

const unavailableStorageAnalytics: YashieStorageAnalyticsState = {
  message: "Storage details load only in the Storage section.",
  status: "unavailable",
};

const unavailableStorageFiles: YashieStorageFilesState = {
  message: "Files load only in the Storage section.",
  status: "unavailable",
};

export default function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <YashieAdminSectionContent params={params} />;
}

async function YashieAdminSectionContent({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  await connection();

  const { section } = await params;
  if (!isYashieAdminSection(section)) notFound();

  const sessionState = await getYashieAdminPageSessionReadState();
  const nextUrl = `/admin/${section}`;

  if (sessionState.status === "unauthenticated") {
    const [content, loginHref] = await Promise.all([
      getYashieContent(),
      getYashieCentralizedLoginHref("dashboard", { nextUrl }),
    ]);

    if (!isYashieNavTabVisible(content, "login")) notFound();
    return <YashieAdminLoginPanel loginHref={loginHref} />;
  }

  if (sessionState.status === "refreshable") {
    return (
      <YashieAdminSessionRestorer
        loginHref={await getYashieCentralizedLoginHref("dashboard", {
          nextUrl,
        })}
      />
    );
  }

  return (
    <AuthenticatedAdminDashboard
      section={section}
      session={sessionState.session}
    />
  );
}

async function AuthenticatedAdminDashboard({
  section,
  session,
}: {
  section: YashieAdminSection;
  session: AuthenticatedSession;
}) {
  const studio = isYashieAdminStudioSection(section)
    ? await getYashieAdminStudioSnapshot(session.accessToken)
    : emptyStudio();
  const storage =
    section === "storage"
      ? await getYashieAdminStorageSnapshot(session.accessToken)
      : {
          storageAnalytics: unavailableStorageAnalytics,
          storageFiles: unavailableStorageFiles,
        };
  const initialContent = {
    worlds: readYashieAdminContent(studio, "worlds"),
    categories: readYashieAdminContent(studio, "categories"),
    blog: readYashieAdminContent(studio, "blog"),
    gallery: readYashieAdminContent(studio, "gallery"),
    shop: readYashieAdminContent(studio, "shop"),
  };

  return (
    <YashieAdminDashboard
      activeSection={section}
      driveHref={buildYashieDriveUrl()}
      initialContent={initialContent}
      initialSiteSettings={readYashieAdminSiteSettings(studio)}
      key={section}
      membersHref={buildYashieWorkspaceUrl({ targetKey: "members" })}
      sessionExpiresAt={session.expiresAt}
      sessionRefreshEarlySeconds={session.refreshEarlySeconds}
      storageAnalytics={storage.storageAnalytics}
      storageFiles={storage.storageFiles}
      userEmail={session.user.email}
    />
  );
}
