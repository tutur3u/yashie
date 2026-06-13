import { beforeEach, describe, expect, mock, test } from "bun:test";
import type {
  YashieAdminCollectionKey,
  YashieAdminStudioPayload,
  YashieContentMutationInput,
} from "./yashie-admin-content-model";

const revalidatePath = mock(() => undefined);

mock.module("next/cache", () => ({
  revalidatePath,
}));

const {
  createYashieContentItem,
  deleteYashieContentItem,
  updateYashieContentItem,
} = await import("./yashie-admin-content");
const { YASHIE_ADMIN_COLLECTIONS } = await import("./yashie-admin-content-model");

type CrudClient = Parameters<typeof createYashieContentItem>[0];

const collectionKeys: YashieAdminCollectionKey[] = [
  "worlds",
  "categories",
  "blog",
  "gallery",
  "shop",
];

function createInput(
  collectionKey: YashieAdminCollectionKey,
  overrides: Partial<YashieContentMutationInput> = {},
): YashieContentMutationInput {
  return {
    body:
      collectionKey === "blog" || collectionKey === "worlds"
        ? `${collectionKey} body`
        : "",
    category:
      collectionKey === "worlds"
        ? "Poetry"
        : collectionKey === "categories"
          ? "blog"
          : "Essay",
    collectionKey,
    date: "June 13, 2026",
    imageAlt: "",
    imageFile: null,
    imagePosition: "center",
    price: "$28",
    readTime: "5 min",
    removeImage: false,
    slug: `${collectionKey}-item`,
    status: "published",
    summary: `${collectionKey} summary`,
    title: `${collectionKey} item`,
    type: "Concept art",
    ...overrides,
  };
}

function createStudio(): YashieAdminStudioPayload {
  return {
    assets: [],
    blocks: [],
    collections: collectionKeys.map((key) => ({
      collection_type: YASHIE_ADMIN_COLLECTIONS[key].collectionSlug,
      id: `collection-${key}`,
      slug: YASHIE_ADMIN_COLLECTIONS[key].collectionSlug,
      title: YASHIE_ADMIN_COLLECTIONS[key].singularLabel,
    })),
    entries: [],
  };
}

function readRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

class FakeCrudClient implements CrudClient {
  calls = {
    createBlock: [] as unknown[],
    createEntry: [] as unknown[],
    deleteEntry: [] as unknown[],
    getStudio: [] as unknown[],
    publishEntry: [] as unknown[],
    updateBlock: [] as unknown[],
    updateEntry: [] as unknown[],
  };

  private nextAssetId = 0;
  private nextBlockId = 0;
  private nextCollectionId = 0;
  private nextEntryId = 0;
  studio = createStudio();

  async createAsset(_workspaceId: string, payload: Record<string, unknown>) {
    const asset = { ...payload, id: `asset-${++this.nextAssetId}` };
    this.studio.assets.push(asset);
    return asset;
  }

  async createBlock(_workspaceId: string, payload: Record<string, unknown>) {
    this.calls.createBlock.push(payload);
    const block = { ...payload, id: `block-${++this.nextBlockId}` };
    this.studio.blocks.push(block);
    return block;
  }

  async createCollection(_workspaceId: string, payload: Record<string, unknown>) {
    const collection = {
      ...payload,
      id: `collection-created-${++this.nextCollectionId}`,
    };
    this.studio.collections.push(collection);
    return collection;
  }

  async createEntry(_workspaceId: string, payload: Record<string, unknown>) {
    this.calls.createEntry.push(payload);
    const entry = { ...payload, id: `entry-${++this.nextEntryId}` };
    this.studio.entries.push(entry);
    return { id: entry.id };
  }

  async deleteAsset(_workspaceId: string, assetId: string) {
    this.studio.assets = this.studio.assets.filter(
      (asset) => String(asset.id) !== assetId,
    );
    return {};
  }

  async deleteEntry(_workspaceId: string, entryId: string) {
    this.calls.deleteEntry.push(entryId);
    this.studio.entries = this.studio.entries.filter(
      (entry) => String(entry.id) !== entryId,
    );
    this.studio.blocks = this.studio.blocks.filter(
      (block) => String(block.entry_id) !== entryId,
    );
    return {};
  }

  async getStudio() {
    this.calls.getStudio.push("getStudio");
    return this.studio;
  }

  async publishEntry(_workspaceId: string, entryId: string, action: string) {
    this.calls.publishEntry.push({ action, entryId });
    return {};
  }

  async updateAsset(
    _workspaceId: string,
    assetId: string,
    payload: Record<string, unknown>,
  ) {
    this.studio.assets = this.studio.assets.map((asset) =>
      String(asset.id) === assetId ? { ...asset, ...payload, id: assetId } : asset,
    );
    return {};
  }

  async updateBlock(
    _workspaceId: string,
    blockId: string,
    payload: Record<string, unknown>,
  ) {
    this.calls.updateBlock.push(payload);
    this.studio.blocks = this.studio.blocks.map((block) =>
      String(block.id) === blockId ? { ...block, ...payload, id: blockId } : block,
    );
    return {};
  }

  async updateEntry(
    _workspaceId: string,
    entryId: string,
    payload: Record<string, unknown>,
  ) {
    this.calls.updateEntry.push(payload);
    this.studio.entries = this.studio.entries.map((entry) =>
      String(entry.id) === entryId ? { ...entry, ...payload, id: entryId } : entry,
    );
    return {};
  }

  async uploadAssetFile() {
    return { path: "external-projects/yashie/uploaded.png" };
  }
}

describe("Yashie admin content mutations", () => {
  beforeEach(() => {
    revalidatePath.mockClear();
  });

  test("creates, updates, saves visibility, and deletes every dashboard collection", async () => {
    for (const collectionKey of collectionKeys) {
      const client = new FakeCrudClient();
      const config = YASHIE_ADMIN_COLLECTIONS[collectionKey];

      const created = await createYashieContentItem(
        client,
        "workspace-1",
        collectionKey,
        createInput(collectionKey),
      );
      const entryId = created.item?.id;

      expect(entryId).toBeTruthy();
      expect(client.calls.createEntry[0]).toEqual(
        expect.objectContaining({
          collection_id: `collection-${collectionKey}`,
          slug: `${collectionKey}-item`,
          status: "published",
          title: `${collectionKey} item`,
        }),
      );
      expect(config.collectionSlug).toBe(
        readRecord(client.studio.collections.find(
          (collection) => collection.id === `collection-${collectionKey}`,
        )).slug,
      );
      if (collectionKey === "blog" || collectionKey === "worlds") {
        expect(client.calls.createBlock).toHaveLength(1);
      } else {
        expect(client.calls.createBlock).toHaveLength(0);
      }

      const updated = await updateYashieContentItem(
        client,
        "workspace-1",
        collectionKey,
        entryId!,
        createInput(collectionKey, {
          slug: `${collectionKey}-updated`,
          status: "draft",
          title: `${collectionKey} updated`,
        }),
      );

      expect(updated.item).toEqual(
        expect.objectContaining({
          slug: `${collectionKey}-updated`,
          status: "draft",
          title: `${collectionKey} updated`,
        }),
      );
      expect(client.calls.updateEntry.at(-1)).toEqual(
        expect.objectContaining({
          collection_id: `collection-${collectionKey}`,
          status: "draft",
          title: `${collectionKey} updated`,
        }),
      );
      expect(client.calls.publishEntry).toEqual([]);

      const deleted = await deleteYashieContentItem(
        client,
        "workspace-1",
        collectionKey,
        entryId!,
      );

      expect(deleted.items).toEqual([]);
      expect(client.calls.deleteEntry).toContain(entryId);
    }
  });

  test("reports digestible save progress and avoids an extra create refresh", async () => {
    const client = new FakeCrudClient();
    const createSteps: string[] = [];

    await createYashieContentItem(
      client,
      "workspace-1",
      "blog",
      createInput("blog"),
      {
        onProgress: (progress) => {
          createSteps.push(progress.step);
        },
      },
    );

    expect(createSteps).toEqual([
      "prepare-section",
      "save-details",
      "save-image",
      "save-copy",
      "save-visibility",
      "refresh-dashboard",
    ]);
    expect(client.calls.getStudio).toHaveLength(2);

    const entryId = client.studio.entries[0]?.id;
    const updateSteps: string[] = [];

    await updateYashieContentItem(
      client,
      "workspace-1",
      "blog",
      String(entryId),
      createInput("blog", { title: "Updated" }),
      {
        onProgress: (progress) => {
          updateSteps.push(progress.step);
        },
      },
    );

    expect(updateSteps).toEqual([
      "prepare-section",
      "save-details",
      "save-image",
      "save-copy",
      "save-visibility",
      "refresh-dashboard",
    ]);
  });

  test("saves published visibility without calling the downstream publish endpoint", async () => {
    const client = new FakeCrudClient();
    const created = await createYashieContentItem(
      client,
      "workspace-1",
      "blog",
      createInput("blog", { status: "draft" }),
    );
    const entryId = created.item?.id;
    client.publishEntry = async () => {
      throw new Error("Failed to publish workspace external project entry");
    };

    const updated = await updateYashieContentItem(
      client,
      "workspace-1",
      "blog",
      entryId!,
      createInput("blog", { status: "published" }),
    );

    expect(updated.item).toEqual(
      expect.objectContaining({
        id: entryId,
        status: "published",
      }),
    );
    expect(client.calls.updateEntry.at(-1)).toEqual(
      expect.objectContaining({ status: "published" }),
    );
    expect(client.calls.publishEntry).toEqual([]);
  });
});
