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

  const studio = await getYashieAdminStudio(session.accessToken).catch(() => emptyStudio());

  return (
    <YashieAdminDashboard
      initialContent={{
        blog: readYashieAdminContent(studio, "blog"),
        gallery: readYashieAdminContent(studio, "gallery"),
        shop: readYashieAdminContent(studio, "shop"),
      }}
      userEmail={session.user.email}
    />
  );
}
