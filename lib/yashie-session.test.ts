import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { NextResponse } from "next/server";
import type { YashieAdminSession } from "./yashie-session";

let sessionCookieValue: string | null = null;

mock.module("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      sessionCookieValue ? { name, value: sessionCookieValue } : undefined,
  }),
}));

const originalFetch = globalThis.fetch;

function createSession(
  overrides: Partial<YashieAdminSession> = {},
): YashieAdminSession {
  return {
    accessToken: "app-token",
    app: { name: "yashie" },
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    tokenType: "Bearer",
    user: { email: "admin@example.com", id: "user-1" },
    workspaceId: "ws-linked",
    ...overrides,
  };
}

function readSessionCookieValue(response: NextResponse) {
  const setCookie = response.headers.get("set-cookie");
  expect(setCookie).toContain("yashie_admin_session=");
  return setCookie?.split(";")[0]?.slice("yashie_admin_session=".length) ?? "";
}

describe("yashie session validation", () => {
  beforeEach(() => {
    process.env.TUTURUUU_API_BASE_URL = "https://platform.example.com/api/v1";
    process.env.YASHIE_APP_SECRET = "app-secret";
    process.env.TUTURUUU_YASHIE_WORKSPACE_ID = "ws-linked";
    process.env.YASHIE_SESSION_SECRET = "session-secret";
    sessionCookieValue = null;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.TUTURUUU_API_BASE_URL;
    delete process.env.YASHIE_APP_SECRET;
    delete process.env.TUTURUUU_YASHIE_WORKSPACE_ID;
    delete process.env.YASHIE_SESSION_SECRET;
    sessionCookieValue = null;
  });

  for (const status of [401, 403, 404] as const) {
    test(`rejects stored sessions when platform revalidation returns ${status}`, async () => {
      const { getYashieSessionFromCookies, setYashieSessionCookie } = await import(
        "./yashie-session"
      );
      const response = NextResponse.json({});
      setYashieSessionCookie(response, createSession());
      sessionCookieValue = readSessionCookieValue(response);

      const calls: Array<{ init?: RequestInit; input: RequestInfo | URL }> = [];
      globalThis.fetch = (async (input, init) => {
        calls.push({ init, input });
        return Response.json({ error: "Invalid session" }, { status });
      }) as typeof fetch;

      await expect(getYashieSessionFromCookies()).resolves.toBeNull();
      expect(calls).toHaveLength(1);
      expect(String(calls[0]?.input)).toBe(
        "https://platform.example.com/api/v1/workspaces/ws-linked/external-projects/summary",
      );
      expect(calls[0]?.init?.headers).toMatchObject({
        Accept: "application/json",
        Authorization: "Bearer app-token",
      });
    });
  }

  for (const status of [429, 500, 502, 503, 504] as const) {
    test(`keeps a current stored session when platform revalidation returns ${status}`, async () => {
      const { getYashieSessionReadStateFromCookies, setYashieSessionCookie } =
        await import("./yashie-session");
      const response = NextResponse.json({});
      setYashieSessionCookie(response, createSession());
      sessionCookieValue = readSessionCookieValue(response);

      globalThis.fetch = (async () =>
        Response.json({ error: "Temporary upstream failure" }, { status })) as typeof fetch;

      await expect(getYashieSessionReadStateFromCookies()).resolves.toMatchObject({
        session: {
          accessToken: "app-token",
          user: { id: "user-1" },
        },
        status: "authenticated",
      });
    });
  }

  test("keeps a current stored session when platform revalidation is unavailable", async () => {
    const { getYashieSessionReadStateFromCookies, setYashieSessionCookie } =
      await import("./yashie-session");
    const response = NextResponse.json({});
    setYashieSessionCookie(response, createSession());
    sessionCookieValue = readSessionCookieValue(response);

    globalThis.fetch = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;

    await expect(getYashieSessionReadStateFromCookies()).resolves.toMatchObject({
      session: {
        accessToken: "app-token",
        user: { id: "user-1" },
      },
      status: "authenticated",
    });
  });

  test("reports expired access with a valid refresh token as refreshable", async () => {
    const { getYashieSessionReadStateFromCookies, setYashieSessionCookie } =
      await import("./yashie-session");
    const response = NextResponse.json({});
    setYashieSessionCookie(
      response,
      createSession({
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
        refreshEarlySeconds: 900,
        refreshExpiresAt: new Date(Date.now() + 86_400_000).toISOString(),
        refreshToken: "refresh-token",
      }),
    );
    sessionCookieValue = readSessionCookieValue(response);

    const calls: Array<{ init?: RequestInit; input: RequestInfo | URL }> = [];
    globalThis.fetch = (async (input, init) => {
      calls.push({ init, input });
      return Response.json({ ok: true });
    }) as typeof fetch;

    const state = await getYashieSessionReadStateFromCookies();

    expect(state.status).toBe("refreshable");
    expect(state.session?.refreshToken).toBe("refresh-token");
    expect(calls).toHaveLength(0);
  });

  test("keeps a rotated session when the token exchange succeeds", async () => {
    const { refreshYashieSessionFromCookies, setYashieSessionCookie } =
      await import("./yashie-session");
    const response = NextResponse.json({});
    setYashieSessionCookie(
      response,
      createSession({
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
        refreshEarlySeconds: 900,
        refreshExpiresAt: new Date(Date.now() + 86_400_000).toISOString(),
        refreshToken: "refresh-token",
      }),
    );
    sessionCookieValue = readSessionCookieValue(response);

    const calls: Array<{ init?: RequestInit; input: RequestInfo | URL }> = [];
    globalThis.fetch = (async (input, init) => {
      calls.push({ init, input });

      if (String(input).endsWith("/auth/app-token/exchange")) {
        return Response.json({
          accessToken: "new-app-token",
          app: { name: "yashie" },
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          refreshEarlySeconds: 900,
          refreshExpiresAt: new Date(Date.now() + 86_400_000).toISOString(),
          refreshToken: "new-refresh-token",
          tokenType: "Bearer",
          user: { email: "admin@example.com", id: "user-1" },
          workspaceId: "ws-linked",
        });
      }

      return Response.json(
        { error: "Temporary upstream failure" },
        { status: 503 },
      );
    }) as typeof fetch;

    const session = await refreshYashieSessionFromCookies();

    expect(session?.accessToken).toBe("new-app-token");
    expect(session?.refreshToken).toBe("new-refresh-token");
    expect(calls).toHaveLength(1);
    expect(String(calls[0]?.input)).toBe(
      "https://platform.example.com/api/v1/auth/app-token/exchange",
    );
    expect(JSON.parse(calls[0]?.init?.body as string)).toMatchObject({
      appId: "yashie",
      appSecret: "app-secret",
      refreshToken: "refresh-token",
      requestedScopes: ["external-projects:*"],
      workspaceId: "ws-linked",
    });
  });

  test("refresh route rotates and persists the refreshed admin session cookie", async () => {
    const { setYashieSessionCookie } = await import("./yashie-session");
    const { POST } = await import("../app/api/auth/session/refresh/route");
    const response = NextResponse.json({});
    setYashieSessionCookie(
      response,
      createSession({
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
        refreshEarlySeconds: 900,
        refreshExpiresAt: new Date(Date.now() + 86_400_000).toISOString(),
        refreshToken: "refresh-token",
      }),
    );
    sessionCookieValue = readSessionCookieValue(response);

    const calls: Array<{ init?: RequestInit; input: RequestInfo | URL }> = [];
    globalThis.fetch = (async (input, init) => {
      calls.push({ init, input });

      if (String(input).endsWith("/auth/app-token/exchange")) {
        return Response.json({
          accessToken: "new-app-token",
          app: { name: "yashie" },
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          refreshEarlySeconds: 900,
          refreshExpiresAt: new Date(Date.now() + 86_400_000).toISOString(),
          refreshToken: "new-refresh-token",
          tokenType: "Bearer",
          user: { email: "admin@example.com", id: "user-1" },
          workspaceId: "ws-linked",
        });
      }

      return Response.json({ ok: true });
    }) as typeof fetch;

    const refreshResponse = await POST();
    const payload = await refreshResponse.json();

    expect(refreshResponse.status).toBe(200);
    expect(payload).toMatchObject({
      refreshEarlySeconds: 900,
      userId: "user-1",
      valid: true,
    });
    expect(refreshResponse.headers.get("set-cookie")).toContain(
      "yashie_admin_session=",
    );
    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0]?.init?.body as string)).toMatchObject({
      refreshToken: "refresh-token",
      workspaceId: "ws-linked",
    });
  });
});
