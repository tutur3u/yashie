import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { YashieAdminStudioPayload } from "./yashie-admin-content-model";
import type { YashieAdminSiteSettingsInput } from "./yashie-admin-site-settings";

const originalWorkspaceId = process.env.TUTURUUU_YASHIE_WORKSPACE_ID;
const revalidatePath = mock(() => undefined);

mock.module("next/cache", () => ({
  revalidatePath,
}));

mock.module("tuturuuu/external-projects", () => ({
  ExternalProjectsClient: mock(function ExternalProjectsClient() {
    return client;
  }),
}));

let studio: YashieAdminStudioPayload;
let calls: {
  createCollection: unknown[];
  createEntry: unknown[];
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
      status: "published",
    },
  ],
};

const client = {
  async createCollection(_workspaceId: string, payload: Record<string, unknown>) {
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
  async getStudio() {
    return studio;
  },
  async publishEntry(...args: unknown[]) {
    calls.publishEntry.push(args);
    throw new Error("Failed to publish workspace external project entry");
  },
  async updateEntry(_workspaceId: string, entryId: string, payload: Record<string, unknown>) {
    calls.updateEntry.push({ entryId, payload });
    studio.entries = studio.entries.map((entry) =>
      String(entry.id) === entryId ? { ...entry, ...payload, id: entryId } : entry,
    );
    return {};
  },
};

const { updateYashieAdminSiteSettings } = await import(
  "./yashie-admin-site-settings"
);

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
    studio = createStudio();
    calls = {
      createCollection: [],
      createEntry: [],
      publishEntry: [],
      updateEntry: [],
    };
    revalidatePath.mockClear();
  });

  afterEach(() => {
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
    expect(calls.updateEntry).toHaveLength(3);
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
    expect(calls.createEntry).toEqual([
      expect.objectContaining({
        profile_data: expect.objectContaining({
          key: "gallery",
          visible: false,
        }),
        slug: "gallery",
        title: "Artwork",
      }),
    ]);
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
});
