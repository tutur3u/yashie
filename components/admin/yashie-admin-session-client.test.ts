import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  adminFetch,
  getYashieAdminSessionRefreshDelayMs,
  refreshYashieAdminSession,
} from "./yashie-admin-session-client";

const originalFetch = globalThis.fetch;

describe("Yashie admin session client", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("caps the refresh lead to half the remaining life for short-lived tokens", () => {
    const now = new Date("2026-06-12T00:00:00.000Z").getTime();
    const expiresAt = new Date(now + 60_000).toISOString();

    expect(
      getYashieAdminSessionRefreshDelayMs({
        expiresAt,
        now,
        refreshEarlySeconds: 900,
      }),
    ).toBe(30_000);
  });

  test("honors the server refresh margin for long-lived tokens", () => {
    const now = new Date("2026-06-12T00:00:00.000Z").getTime();
    const expiresAt = new Date(now + 8 * 60 * 60 * 1000).toISOString();

    expect(
      getYashieAdminSessionRefreshDelayMs({
        expiresAt,
        now,
        refreshEarlySeconds: 900,
      }),
    ).toBe(7 * 60 * 60 * 1000 + 45 * 60 * 1000);
  });

  test("uses a fallback delay for invalid expiry timestamps", () => {
    expect(
      getYashieAdminSessionRefreshDelayMs({
        expiresAt: "not-a-date",
        now: 0,
      }),
    ).toBe(5 * 60 * 1000);
  });

  test("de-dupes concurrent refresh requests", async () => {
    const calls: Array<{ init?: RequestInit; input: RequestInfo | URL }> = [];
    globalThis.fetch = mock(async (input, init) => {
      calls.push({ init, input });
      return Response.json({
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        refreshEarlySeconds: 900,
        valid: true,
      });
    }) as typeof fetch;

    const [first, second] = await Promise.all([
      refreshYashieAdminSession(),
      refreshYashieAdminSession(),
    ]);

    expect(first?.valid).toBe(true);
    expect(second?.valid).toBe(true);
    expect(calls).toHaveLength(1);
    expect(String(calls[0]?.input)).toBe("/api/auth/session/refresh");
  });

  test("retries admin requests once after a successful refresh", async () => {
    const calls: Array<{ init?: RequestInit; input: RequestInfo | URL }> = [];
    globalThis.fetch = mock(async (input, init) => {
      calls.push({ init, input });

      if (String(input) === "/api/auth/session/refresh") {
        return Response.json({
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          valid: true,
        });
      }

      if (calls.filter((call) => String(call.input) === "/api/admin/content/blog").length === 1) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      return Response.json({ items: [] });
    }) as typeof fetch;

    const response = await adminFetch("/api/admin/content/blog", {
      cache: "no-store",
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ items: [] });
    expect(calls.map((call) => String(call.input))).toEqual([
      "/api/admin/content/blog",
      "/api/auth/session/refresh",
      "/api/admin/content/blog",
    ]);
    expect(calls[0]?.init?.credentials).toBe("same-origin");
    expect(calls[2]?.init?.credentials).toBe("same-origin");
  });
});
