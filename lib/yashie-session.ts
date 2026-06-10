import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getYashieApiBaseUrl, getYashieWorkspaceId } from "@/lib/yashie-config";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const YASHIE_SESSION_COOKIE = "yashie_admin_session";
const SESSION_VERSION = "v1";

export type YashieAdminSession = {
  accessToken: string;
  app: {
    name: string;
  };
  expiresAt: string;
  tokenType: "Bearer";
  workspaceId: string;
  user: {
    email: string | null;
    id: string;
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

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
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

function getYashieSessionValidationUrl(workspaceId: string) {
  const apiBaseUrl = getYashieApiBaseUrl().replace(/\/+$/, "");
  return `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/external-projects/summary`;
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

    return response.ok ? session : null;
  } catch {
    return null;
  }
}

export async function getYashieSessionFromCookies() {
  const cookieStore = await cookies();
  const value = cookieStore.get(YASHIE_SESSION_COOKIE)?.value;
  const session = value ? unsealSession(value) : null;

  return session ? validateYashieSession(session) : null;
}

export function setYashieSessionCookie(response: NextResponse, session: YashieAdminSession) {
  response.cookies.set(YASHIE_SESSION_COOKIE, sealSession(session), {
    expires: new Date(session.expiresAt),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
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
