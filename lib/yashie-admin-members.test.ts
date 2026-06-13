import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  getYashieAdminMembers,
  normalizeYashieAdminMembersPayload,
  YashieAdminMembersError,
} from "./yashie-admin-members";

const originalFetch = globalThis.fetch;

describe("Yashie admin members", () => {
  beforeEach(() => {
    process.env.TUTURUUU_API_BASE_URL = "https://platform.example.com/api/v1";
    process.env.TUTURUUU_YASHIE_WORKSPACE_ID = "ws-linked";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.TUTURUUU_API_BASE_URL;
    delete process.env.TUTURUUU_YASHIE_WORKSPACE_ID;
  });

  test("normalizes Tuturuuu member context and people for the dashboard", () => {
    const payload = normalizeYashieAdminMembersPayload({
      context: {
        boundProjectName: "Yashie",
        canManageMembers: true,
        canManageRoles: false,
        currentUserEmail: "owner@example.com",
        workspaceId: "ws-linked",
      },
      members: [
        {
          display_name: "Yashie Editor",
          email: "editor@example.com",
          id: "user-1",
          pending: false,
          roles: [{ name: "Publisher" }],
          workspace_member_type: "MEMBER",
        },
      ],
    });

    expect(payload.context).toEqual(
      expect.objectContaining({
        boundProjectName: "Yashie",
        canManageMembers: true,
        workspaceId: "ws-linked",
      }),
    );
    expect(payload.members[0]).toEqual({
      email: "editor@example.com",
      id: "user-1",
      initials: "YE",
      name: "Yashie Editor",
      role: "Publisher",
      status: "Active",
    });
  });

  test("fetches external-project team endpoints with the admin token", async () => {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];

    globalThis.fetch = (async (input, init) => {
      calls.push({ input, init });

      if (input.toString().endsWith("/external-projects/members")) {
        return Response.json({
          boundProjectName: "Yashie",
          canManageMembers: true,
          canManageRoles: true,
          currentUserEmail: "owner@example.com",
          workspaceId: "ws-linked",
        });
      }

      if (
        input
          .toString()
          .endsWith("/external-projects/members/enhanced?status=joined")
      ) {
        return Response.json([
          {
            display_name: "Owner",
            email: "owner@example.com",
            id: "owner-1",
            pending: false,
            roles: [],
            workspace_member_type: "MEMBER",
          },
        ]);
      }

      return Response.json({ error: "Unexpected request" }, { status: 500 });
    }) as typeof fetch;

    const result = await getYashieAdminMembers("admin-token");

    expect(result.members[0]?.email).toBe("owner@example.com");
    expect(calls.map((call) => call.input.toString())).toEqual([
      "https://platform.example.com/api/v1/workspaces/ws-linked/external-projects/members",
      "https://platform.example.com/api/v1/workspaces/ws-linked/external-projects/members/enhanced?status=joined",
    ]);
    expect(calls[0]?.init?.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer admin-token",
      }),
    );
  });

  test("preserves upstream auth status for retryable dashboard fetches", async () => {
    globalThis.fetch = (async (input) => {
      if (input.toString().endsWith("/external-projects/members")) {
        return Response.json({ error: "Expired token" }, { status: 401 });
      }

      return Response.json([], { status: 200 });
    }) as typeof fetch;

    try {
      await getYashieAdminMembers("expired-token");
      throw new Error("Expected members request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(YashieAdminMembersError);
      expect((error as YashieAdminMembersError).status).toBe(401);
    }
  });
});
