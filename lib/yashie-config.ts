export const YASHIE_APP_NAME = "yashie";

export type YashieAdminTargetKey =
  | "dashboard"
  | "library"
  | "preview"
  | "members"
  | "settings";

type YashieAdminTarget = {
  actionLabel: string;
  description: string;
  key: YashieAdminTargetKey;
  label: string;
  pathSuffix: string;
};

export const YASHIE_ADMIN_TARGETS: YashieAdminTarget[] = [
  {
    actionLabel: "Open CMS Home",
    description: "Review workspace status and jump into the content studio.",
    key: "dashboard",
    label: "CMS Home",
    pathSuffix: "",
  },
  {
    actionLabel: "Manage Library",
    description: "Edit profile copy, writing worlds, gallery, blog, shop, and social links.",
    key: "library",
    label: "Library",
    pathSuffix: "/library",
  },
  {
    actionLabel: "Preview Delivery",
    description: "Inspect the delivered Yashie payload before publishing.",
    key: "preview",
    label: "Preview",
    pathSuffix: "/preview",
  },
  {
    actionLabel: "Manage Members",
    description: "Open CMS workspace membership and collaborator access.",
    key: "members",
    label: "Members",
    pathSuffix: "/members",
  },
  {
    actionLabel: "Open Settings",
    description: "Tune the external project binding and workspace settings.",
    key: "settings",
    label: "Settings",
    pathSuffix: "/settings",
  },
];

function isEnabled(value: string | undefined) {
  return value ? ["1", "true", "yes", "on"].includes(value.trim().toLowerCase()) : false;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getAdminDevMode() {
  return isEnabled(process.env.DEV_MODE ?? process.env.NEXT_PUBLIC_DEV_MODE);
}

function getConfiguredUrl({
  envName,
  localUrl,
  productionUrl,
}: {
  envName: string;
  localUrl: string;
  productionUrl: string;
}) {
  const configured = process.env[envName] ?? process.env[`NEXT_PUBLIC_${envName}`];

  if (configured?.trim()) {
    return trimTrailingSlash(configured.trim());
  }

  return getAdminDevMode() ? localUrl : productionUrl;
}

export function getYashieApiBaseUrl() {
  return (
    process.env.TUTURUUU_API_BASE_URL ??
    process.env.NEXT_PUBLIC_TUTURUUU_API_BASE_URL ??
    "https://tuturuuu.com/api/v1"
  );
}

export function getYashieWorkspaceId() {
  const workspaceId =
    process.env.TUTURUUU_YASHIE_WORKSPACE_ID ??
    process.env.NEXT_PUBLIC_TUTURUUU_YASHIE_WORKSPACE_ID;

  if (!workspaceId?.trim()) {
    throw new Error("[yashie] Missing TUTURUUU_YASHIE_WORKSPACE_ID.");
  }

  return workspaceId.trim();
}

export function getYashieAppId() {
  return (process.env.YASHIE_APP_ID ?? YASHIE_APP_NAME).trim().toLowerCase();
}

export function getYashieAppSecret() {
  const secret = process.env.YASHIE_APP_SECRET ?? process.env.TUTURUUU_YASHIE_APP_SECRET;

  if (!secret?.trim()) {
    throw new Error("[yashie] Missing YASHIE_APP_SECRET.");
  }

  return secret.trim();
}

export function getYashieCmsBaseUrl() {
  return getConfiguredUrl({
    envName: "TUTURUUU_CMS_APP_URL",
    localUrl: "http://localhost:7811",
    productionUrl: "https://cms.tuturuuu.com",
  });
}

export function getYashieWebAppUrl() {
  return getConfiguredUrl({
    envName: "TUTURUUU_WEB_APP_URL",
    localUrl: "http://localhost:7803",
    productionUrl: "https://tuturuuu.com",
  });
}

export function getYashieAppBaseUrl(requestOrigin?: string) {
  const configured =
    process.env.YASHIE_APP_URL ??
    process.env.NEXT_PUBLIC_YASHIE_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL;

  if (configured?.trim()) {
    return trimTrailingSlash(configured.trim());
  }

  if (requestOrigin?.trim()) {
    return trimTrailingSlash(requestOrigin.trim());
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${trimTrailingSlash(process.env.VERCEL_URL.trim())}`;
  }

  return "http://localhost:3000";
}

export function sanitizeYashieNextPath(
  rawValue: string | null | undefined,
  requestOrigin = "http://localhost",
  fallbackPath = "/admin",
) {
  if (!rawValue?.trim() || rawValue.startsWith("//")) {
    return fallbackPath;
  }

  try {
    const parsed = new URL(rawValue, requestOrigin);

    if (parsed.origin !== requestOrigin) {
      return fallbackPath;
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallbackPath;
  }
}

export function resolveYashieAdminTargetKey(
  value: string | null | undefined,
): YashieAdminTargetKey {
  return YASHIE_ADMIN_TARGETS.some((target) => target.key === value)
    ? (value as YashieAdminTargetKey)
    : "library";
}

export function getYashieAdminTarget(key: YashieAdminTargetKey) {
  return YASHIE_ADMIN_TARGETS.find((target) => target.key === key) ?? YASHIE_ADMIN_TARGETS[1];
}

export function getYashieCmsWorkspacePath(
  targetKey: YashieAdminTargetKey,
  workspaceId = getYashieWorkspaceId(),
) {
  const target = getYashieAdminTarget(targetKey);
  return `/${encodeURIComponent(workspaceId)}${target.pathSuffix}`;
}

export function buildYashieCmsUrl({
  cmsBaseUrl = getYashieCmsBaseUrl(),
  targetKey,
  workspaceId = getYashieWorkspaceId(),
}: {
  cmsBaseUrl?: string;
  targetKey: YashieAdminTargetKey;
  workspaceId?: string;
}) {
  return new URL(getYashieCmsWorkspacePath(targetKey, workspaceId), cmsBaseUrl).toString();
}

export function buildYashieCentralizedLoginUrl({
  appBaseUrl = getYashieAppBaseUrl(),
  nextUrl = "/admin",
  webAppUrl = getYashieWebAppUrl(),
}: {
  appBaseUrl?: string;
  nextUrl?: string;
  webAppUrl?: string;
}) {
  const appOrigin = new URL(appBaseUrl).origin;
  const verifyUrl = new URL("/verify-token", appOrigin);
  verifyUrl.searchParams.set("nextUrl", sanitizeYashieNextPath(nextUrl, appOrigin));

  const loginUrl = new URL("/login", webAppUrl);
  loginUrl.searchParams.set("returnUrl", verifyUrl.toString());
  return loginUrl.toString();
}

export function getYashieAdminLoginPath(targetKey: YashieAdminTargetKey) {
  return `/admin/login?next=${encodeURIComponent(targetKey)}`;
}

export function buildYashieAdminLinks(workspaceId = getYashieWorkspaceId()) {
  const cmsBaseUrl = getYashieCmsBaseUrl();

  return YASHIE_ADMIN_TARGETS.map((target) => ({
    ...target,
    cmsHref: buildYashieCmsUrl({
      cmsBaseUrl,
      targetKey: target.key,
      workspaceId,
    }),
    loginHref: getYashieAdminLoginPath(target.key),
  }));
}
