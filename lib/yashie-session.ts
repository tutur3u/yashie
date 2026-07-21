import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import {
  getYashieApiBaseUrl,
  getYashieAppId,
  getYashieAppSecret,
  getYashieWorkspaceId,
} from "@/lib/yashie-config";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const YASHIE_SESSION_COOKIE = "yashie_admin_session";
const SESSION_VERSION = "v1";
const YASHIE_ADMIN_SCOPES = ["external-projects:*"] as const;

export type YashieAdminSession = {
  accessToken: string;
  app: {
    name: string;
  };
  expiresAt: string;
  refreshEarlySeconds?: number;
  refreshExpiresAt?: string;
  refreshToken?: string;
  tokenType: "Bearer";
  workspaceId: string;
  user: {
    email: string | null;
    id: string;
  };
};

export type YashieSessionReadState =
  | {
      session: YashieAdminSession;
      status: "authenticated";
    }
  | {
      session: YashieAdminSession;
      status: "refreshable";
    }
  | {
      session: null;
      status: "unauthenticated";
    };

export type YashieAppTokenExchangeResponse = {
  accessToken?: string;
  app?: {
    name?: string;
  };
  error?: string;
  expiresAt?: string;
  refreshEarlySeconds?: number;
  refreshExpiresAt?: string;
  refreshToken?: string;
  tokenType?: string;
  workspaceId?: string | null;
  user?: {
    email?: string | null;
    id?: string;
  };
};

function getSessionSecret() {
  const secret = process.env.YASHIE_SESSION_SECRET ?? process.env.YASHIE_APP_SECRET;

  if (!secret?.trim()) {
    throw new Error("[yashie] Missing YASHIE_SESSION_SECRET or YASHIE_APP_SECRET.");
  }

  return createHash("sha256").update(secret.trim()).digest();
}

function encode(value: Buffer) {
  return value.toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url");
}

function readTimestamp(value: string | null | undefined) {
  if (!value) return null;

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isAccessTokenCurrent(session: Pick<YashieAdminSession, "expiresAt">) {
  const expiresAt = readTimestamp(session.expiresAt);
  return expiresAt !== null && expiresAt > Date.now();
}

function isRefreshTokenCurrent(
  session: Pick<YashieAdminSession, "refreshExpiresAt" | "refreshToken">,
) {
  const expiresAt = readTimestamp(session.refreshExpiresAt);
  return Boolean(session.refreshToken) && expiresAt !== null && expiresAt > Date.now();
}

function getSessionCookieExpiresAt(session: YashieAdminSession) {
  const refreshExpiresAt = readTimestamp(session.refreshExpiresAt);
  const accessExpiresAt = readTimestamp(session.expiresAt);
  const expiresAt = Math.max(refreshExpiresAt ?? 0, accessExpiresAt ?? 0);

  return new Date(expiresAt || Date.now());
}

function getYashieSessionCookieOptions(session: YashieAdminSession) {
  return {
    expires: getSessionCookieExpiresAt(session),
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function sealSession(session: YashieAdminSession) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getSessionSecret(), iv);
  const plaintext = Buffer.from(JSON.stringify(session), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [SESSION_VERSION, encode(iv), encode(tag), encode(ciphertext)].join(".");
}

function unsealSession(value: string): YashieAdminSession | null {
  const [version, encodedIv, encodedTag, encodedCiphertext] = value.split(".");

  if (version !== SESSION_VERSION || !encodedIv || !encodedTag || !encodedCiphertext) {
    return null;
  }

  try {
    const decipher = createDecipheriv("aes-256-gcm", getSessionSecret(), decode(encodedIv));
    decipher.setAuthTag(decode(encodedTag));
    const plaintext = Buffer.concat([
      decipher.update(decode(encodedCiphertext)),
      decipher.final(),
    ]).toString("utf8");
    const session = JSON.parse(plaintext) as YashieAdminSession;

    if (!session.accessToken || !session.user?.id || !session.expiresAt || !session.workspaceId) {
      return null;
    }

    if (!isAccessTokenCurrent(session) && !isRefreshTokenCurrent(session)) {
      return null;
    }

    if (session.workspaceId !== getYashieWorkspaceId()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function createYashieSessionFromExchangePayload(
  payload: YashieAppTokenExchangeResponse,
  fallback?: YashieAdminSession,
): YashieAdminSession {
  const workspaceId = payload.workspaceId ?? fallback?.workspaceId;
  const userId = payload.user?.id ?? fallback?.user.id;

  if (!payload.accessToken || !payload.expiresAt || !userId || !workspaceId) {
    throw new Error("Invalid Tuturuuu app token exchange response.");
  }

  return {
    accessToken: payload.accessToken,
    app: {
      name: payload.app?.name ?? fallback?.app.name ?? getYashieAppId(),
    },
    expiresAt: payload.expiresAt,
    refreshEarlySeconds:
      typeof payload.refreshEarlySeconds === "number" &&
      Number.isFinite(payload.refreshEarlySeconds)
        ? payload.refreshEarlySeconds
        : fallback?.refreshEarlySeconds,
    refreshExpiresAt: payload.refreshExpiresAt ?? fallback?.refreshExpiresAt,
    refreshToken: payload.refreshToken ?? fallback?.refreshToken,
    tokenType: "Bearer",
    workspaceId,
    user: {
      email: payload.user?.email ?? fallback?.user.email ?? null,
      id: userId,
    },
  };
}

function getYashieSessionValidationUrl(workspaceId: string) {
  const apiBaseUrl = getYashieApiBaseUrl().replace(/\/+$/, "");
  return `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/external-projects/summary`;
}

function getYashieAppTokenExchangeUrl() {
  const apiBaseUrl = getYashieApiBaseUrl().replace(/\/+$/, "");
  return `${apiBaseUrl}/auth/app-token/exchange`;
}

async function validateYashieSession(session: YashieAdminSession) {
  try {
    const response = await fetch(getYashieSessionValidationUrl(session.workspaceId), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `${session.tokenType} ${session.accessToken}`,
      },
    });

    if (response.ok) {
      return "authenticated" as const;
    }

    if ([401, 403, 404].includes(response.status)) {
      return "invalid" as const;
    }

    console.warn(
      `[yashie] Session validation is temporarily unavailable (${response.status}).`,
    );
    return "unavailable" as const;
  } catch (error) {
    console.warn("[yashie] Session validation request failed.", error);
    return "unavailable" as const;
  }
}

async function refreshYashieSession(session: YashieAdminSession) {
  if (!isRefreshTokenCurrent(session)) {
    return null;
  }

  try {
    const response = await fetch(getYashieAppTokenExchangeUrl(), {
      body: JSON.stringify({
        appId: getYashieAppId(),
        appSecret: getYashieAppSecret(),
        refreshToken: session.refreshToken,
        requestedScopes: [...YASHIE_ADMIN_SCOPES],
        workspaceId: getYashieWorkspaceId(),
      }),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      console.warn(
        `[yashie] Session refresh was rejected by Tuturuuu (${response.status}).`,
      );
      return null;
    }

    const payload = (await response.json().catch(() => null)) as
      | YashieAppTokenExchangeResponse
      | null;

    if (!payload) {
      console.warn("[yashie] Session refresh returned an invalid response.");
      return null;
    }

    return createYashieSessionFromExchangePayload(payload, session);
  } catch (error) {
    console.warn("[yashie] Session refresh request failed.", error);
    return null;
  }
}

async function getStoredYashieSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(YASHIE_SESSION_COOKIE)?.value;
  return value ? unsealSession(value) : null;
}

export async function refreshYashieSessionFromCookies() {
  const session = await getStoredYashieSession();

  if (!session) {
    return null;
  }

  const refreshed = await refreshYashieSession(session);

  if (!refreshed) {
    return null;
  }

  // The exchange endpoint has already authenticated the app, refresh token,
  // workspace membership, and requested scopes. Persist the rotated token
  // immediately: an additional validation request here could fail after the
  // previous refresh token was consumed, permanently stranding the session.
  return refreshed;
}

export async function getYashieSessionReadStateFromCookies(): Promise<YashieSessionReadState> {
  const session = await getStoredYashieSession();

  if (!session) {
    return { session: null, status: "unauthenticated" };
  }

  if (!isAccessTokenCurrent(session)) {
    return isRefreshTokenCurrent(session)
      ? { session, status: "refreshable" }
      : { session: null, status: "unauthenticated" };
  }

  const validation = await validateYashieSession(session);

  if (validation !== "invalid") {
    return { session, status: "authenticated" };
  }

  return isRefreshTokenCurrent(session)
    ? { session, status: "refreshable" }
    : { session: null, status: "unauthenticated" };
}

export async function getYashiePageSessionReadStateFromCookies(): Promise<YashieSessionReadState> {
  const session = await getStoredYashieSession();

  if (!session) {
    return { session: null, status: "unauthenticated" };
  }

  if (isAccessTokenCurrent(session)) {
    return { session, status: "authenticated" };
  }

  return isRefreshTokenCurrent(session)
    ? { session, status: "refreshable" }
    : { session: null, status: "unauthenticated" };
}

export async function getYashieSessionFromCookies() {
  const state = await getYashieSessionReadStateFromCookies();
  return state.status === "authenticated" ? state.session : null;
}

export function setYashieSessionCookie(response: NextResponse, session: YashieAdminSession) {
  response.cookies.set(YASHIE_SESSION_COOKIE, sealSession(session), {
    ...getYashieSessionCookieOptions(session),
  });
}

export function clearYashieSessionCookie(response: NextResponse) {
  response.cookies.set(YASHIE_SESSION_COOKIE, "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
