import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { YashieAdminStudioPayload } from "./yashie-admin-content-model";
import type { YashieAdminSiteSettingsInput } from "./yashie-admin-site-settings";

const originalWorkspaceId = process.env.TUTURUUU_YASHIE_WORKSPACE_ID;
const originalFetch = globalThis.fetch;
const revalidatePath = mock(() => undefined);
const revalidateTag = mock(() => undefined);

mock.module("next/cache", () => ({
  cacheLife: () => undefined,
  cacheTag: () => undefined,
  revalidatePath,
  revalidateTag,
}));

mock.module("tuturuuu/external-projects", () => ({
  ExternalProjectsClient: mock(function ExternalProjectsClient() {
    return client;
  }),
}));

let studio: YashieAdminStudioPayload;
let calls: {
  batchEntries: unknown[][];
  createCollection: unknown[];
  createEntry: unknown[];
  deleteEntry: unknown[];
  publishEntry: unknown[];
  updateEntry: unknown[];
};

const input: YashieAdminSiteSettingsInput = {
  navigation: [
    {
      key: "gallery",
      label: "Artwork",
      visible: false,
    },
  ],
  profile: {
    alias: "@inkedbyyashie",
    brand: "InkedByYashie",
    email: "hello@example.com",
    location: "Everywhere",
    name: "Yashoda U. Itwaru",
    shortName: "Yashie",
    status: "published",
    summary: "Profile summary.",
    title: "Writer",
  },
  socials: [
    {
      handle: "@inkedbyyashie",
      href: "https://www.instagram.com/inkedbyyashie",
      label: "Instagram",
      platform: "instagram",
      sortOrder: 0,
      status: "published",
    },
  ],
};

const client = {
  async createCollection(
    _workspaceId: string,
    payload: Record<string, unknown>,
  ) {
    calls.createCollection.push(payload);
    studio.collections.push({
      ...payload,
      id: `collection-${String(payload.slug)}`,
    });
    return {};
  },
  async createEntry(_workspaceId: string, payload: Record<string, unknown>) {
    calls.createEntry.push(payload);
    studio.entries.push({
      ...payload,
      id: `entry-${String(payload.slug)}`,
    });
    return {};
  },
  async deleteEntry(_workspaceId: string, entryId: string) {
    calls.deleteEntry.push(entryId);
    studio.entries = studio.entries.filter(
      (entry) => String(entry.id) !== entryId,
    );
    return {};
  },
  async getStudio() {
    return studio;
  },
  async publishEntry(...args: unknown[]) {
    calls.publishEntry.push(args);
    throw new Error("Failed to publish workspace external project entry");
  },
  async updateEntry(
    _workspaceId: string,
    entryId: string,
    payload: Record<string, unknown>,
  ) {
    calls.updateEntry.push({ entryId, payload });
    studio.entries = studio.entries.map((entry) =>
      String(entry.id) === entryId
        ? { ...entry, ...payload, id: entryId }
        : entry,
    );
    return {};
  },
};

const batchFetch = mock(
  async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      operations?: Array<
        | {
            action: "create";
            clientOperationId: string;
            payload: Record<string, unknown>;
          }
        | {
            action: "update";
            clientOperationId: string;
            entryId: string;
            payload: Record<string, unknown>;
          }
        | {
            action: "delete";
            clientOperationId: string;
            entryId: string;
          }
      >;
    };
    const operations = body.operations ?? [];
    calls.batchEntries.push(operations);
    const results = operations.map((operation) => {
      if (operation.action === "delete") {
        studio.entries = studio.entries.filter(
          (entry) => String(entry.id) !== operation.entryId,
        );
        return {
          action: operation.action,
          clientOperationId: operation.clientOperationId,
          entryId: operation.entryId,
          ok: true,
        };
      }

      if (operation.action === "update") {
        const entry = {
          ...(studio.entries.find(
            (item) => String(item.id) === operation.entryId,
          ) ?? {}),
          ...operation.payload,
          id: operation.entryId,
        };
        studio.entries = studio.entries.map((item) =>
          String(item.id) === operation.entryId ? entry : item,
        );
        return {
          action: operation.action,
          clientOperationId: operation.clientOperationId,
          entry,
          ok: true,
        };
      }

      const entry = {
        ...operation.payload,
        id: `entry-${String(operation.payload.slug)}`,
      };
      studio.entries.push(entry);
      return {
        action: operation.action,
        clientOperationId: operation.clientOperationId,
        entry,
        ok: true,
      };
    });

    return new Response(JSON.stringify({ results }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  },
) as typeof fetch;

const { updateYashieAdminSiteSettings } =
  await import("./yashie-admin-site-settings");

function createStudio({
  includeNavigation = true,
}: {
  includeNavigation?: boolean;
} = {}): YashieAdminStudioPayload {
  return {
    assets: [],
    blocks: [],
    collections: [
      ...(includeNavigation
        ? [
            {
              collection_type: "navigation-tabs",
              id: "collection-navigation",
              slug: "navigation-tabs",
              title: "Navigation",
            },
          ]
        : []),
      {
        collection_type: "profile",
        id: "collection-profile",
        slug: "profile",
        title: "Profile",
      },
      {
        collection_type: "social-links",
        id: "collection-socials",
        slug: "social-links",
        title: "Social Links",
      },
    ],
    entries: [
      {
        collection_id: "collection-profile",
        id: "profile-1",
        profile_data: {},
        slug: "profile",
        status: "published",
        title: "Old profile",
      },
      ...(includeNavigation
        ? [
            {
              collection_id: "collection-navigation",
              id: "navigation-gallery",
              profile_data: {
                key: "gallery",
              },
              slug: "gallery",
              status: "published",
              title: "Gallery",
            },
          ]
        : []),
      {
        collection_id: "collection-socials",
        id: "social-instagram",
        profile_data: {
          platform: "instagram",
        },
        slug: "instagram",
        status: "published",
        title: "Instagram",
      },
    ],
  };
}

describe("Yashie admin site settings mutations", () => {
  beforeEach(() => {
    process.env.TUTURUUU_YASHIE_WORKSPACE_ID = "workspace-1";
    globalThis.fetch = batchFetch;
    studio = createStudio();
    calls = {
      batchEntries: [],
      createCollection: [],
      createEntry: [],
      deleteEntry: [],
      publishEntry: [],
      updateEntry: [],
    };
    batchFetch.mockClear();
    revalidatePath.mockClear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;

    if (originalWorkspaceId === undefined) {
      delete process.env.TUTURUUU_YASHIE_WORKSPACE_ID;
    } else {
      process.env.TUTURUUU_YASHIE_WORKSPACE_ID = originalWorkspaceId;
    }
  });

  test("saves published profile and social status without downstream publish", async () => {
    const settings = await updateYashieAdminSiteSettings("admin-token", input);

    expect(settings.profile.name).toBe("Yashoda U. Itwaru");
    expect(settings.navigation).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "gallery",
          label: "Artwork",
          visible: false,
        }),
      ]),
    );
    expect(calls.batchEntries[0] ?? []).toHaveLength(3);
    expect(calls.batchEntries[0] ?? []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "update",
          clientOperationId: "profile",
        }),
      ]),
    );
    expect(calls.updateEntry).toHaveLength(0);
    expect(calls.publishEntry).toEqual([]);
  });

  test("creates the navigation collection from the manifest before saving tabs", async () => {
    studio = createStudio({ includeNavigation: false });

    const settings = await updateYashieAdminSiteSettings("admin-token", input);

    expect(calls.createCollection).toEqual([
      expect.objectContaining({
        collection_type: "navigation-tabs",
        slug: "navigation-tabs",
        title: "Navigation Tabs",
      }),
    ]);
    expect(calls.batchEntries[0] ?? []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "create",
          clientOperationId: "navigation:gallery",
          payload: expect.objectContaining({
            profile_data: expect.objectContaining({
              key: "gallery",
              visible: false,
            }),
            slug: "gallery",
            title: "Artwork",
          }),
        }),
      ]),
    );
    expect(settings.navigation).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "gallery",
          label: "Artwork",
          visible: false,
        }),
      ]),
    );
  });

  test("creates added links and deletes removed links", async () => {
    const settings = await updateYashieAdminSiteSettings("admin-token", {
      ...input,
      socials: [
        input.socials[0]!,
        {
          handle: "",
          href: "https://example.com",
          label: "Website",
          platform: "website",
          sortOrder: 1,
          status: "published",
        },
      ],
    });

    expect(calls.batchEntries[0] ?? []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "create",
          clientOperationId: "social:1:website",
          payload: expect.objectContaining({
            profile_data: expect.objectContaining({
              href: "https://example.com",
              platform: "website",
              sortOrder: 1,
            }),
            slug: "website",
            title: "Website",
          }),
        }),
      ]),
    );
    expect(calls.deleteEntry).toEqual([]);
    expect(settings.socials).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "https://example.com",
          platform: "website",
        }),
      ]),
    );

    calls.deleteEntry = [];
    await updateYashieAdminSiteSettings("admin-token", {
      ...input,
      socials: [],
    });

    expect(calls.batchEntries[1] ?? []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "delete",
          entryId: "social-instagram",
        }),
        expect.objectContaining({
          action: "delete",
          entryId: "entry-website",
        }),
      ]),
    );
  });
});
