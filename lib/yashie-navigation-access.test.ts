import { afterEach, describe, expect, mock, test } from "bun:test";
import type { YashieSessionReadState } from "./yashie-session";

let sessionState: YashieSessionReadState = {
  session: null,
  status: "unauthenticated",
};

const getYashieAdminSessionReadState = mock(async () => sessionState);

mock.module("./yashie-admin-api", () => ({
  getYashieAdminSessionReadState,
}));

const {
  canAccessYashieNavTab,
  getVisibleYashieNavTabs,
  isYashieNavTabVisible,
} = await import("./yashie-navigation-access");

const content = {
  navigationTabs: [
    {
      href: "/blog",
      key: "blog",
      label: "Blog",
      sortOrder: 5,
      visible: false,
    },
    {
      href: "/gallery",
      key: "gallery",
      label: "Gallery",
      sortOrder: 1,
      visible: true,
    },
  ],
};

describe("Yashie navigation access", () => {
  afterEach(() => {
    sessionState = {
      session: null,
      status: "unauthenticated",
    };
    getYashieAdminSessionReadState.mockClear();
  });

  test("reads visible tabs for public rendering", () => {
    expect(isYashieNavTabVisible(content, "gallery")).toBe(true);
    expect(isYashieNavTabVisible(content, "blog")).toBe(false);
    expect(getVisibleYashieNavTabs(content)).toEqual(new Set(["gallery"]));
  });

  test("denies hidden tabs to visitors", async () => {
    await expect(canAccessYashieNavTab(content, "blog")).resolves.toBe(false);
  });

  test("allows hidden tabs to authenticated admins", async () => {
    sessionState = {
      session: {
        accessToken: "admin-token",
        app: {
          name: "Yashie",
        },
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        tokenType: "Bearer",
        workspaceId: "workspace-1",
        user: {
          email: "admin@example.com",
          id: "user-1",
        },
      },
      status: "authenticated",
    };

    await expect(canAccessYashieNavTab(content, "blog")).resolves.toBe(true);
  });
});
