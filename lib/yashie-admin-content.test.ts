import { beforeEach, describe, expect, mock, test } from "bun:test";
import type {
  YashieAdminCollectionKey,
  YashieAdminStudioPayload,
  YashieContentMutationInput,
} from "./yashie-admin-content-model";

const revalidatePath = mock(() => undefined);
const revalidateTag = mock(() => undefined);

mock.module("next/cache", () => ({
  cacheLife: () => undefined,
  cacheTag: () => undefined,
  revalidatePath,
  revalidateTag,
}));

const {
  createYashieContentItem,
  deleteYashieContentItem,
  updateYashieContentItem,
} = await import("./yashie-admin-content");
const { buildYashieContent } = await import("./yashie-content");
import type { YashieDeliveryPayload } from "./yashie-content";

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
    createAsset: [] as unknown[],
    createBlock: [] as unknown[],
    createEntry: [] as unknown[],
    deleteAsset: [] as unknown[],
    deleteEntry: [] as unknown[],
    getStudio: [] as unknown[],
    publishEntry: [] as unknown[],
    updateAsset: [] as unknown[],
    updateBlock: [] as unknown[],
    updateEntry: [] as unknown[],
    uploadAssetFile: [] as unknown[],
  };

  private nextAssetId = 0;
  private nextBlockId = 0;
  private nextCollectionId = 0;
  private nextEntryId = 0;
  studio = createStudio();

  async createAsset(_workspaceId: string, payload: Record<string, unknown>) {
    this.calls.createAsset.push(payload);
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
    this.calls.deleteAsset.push(assetId);
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
    this.calls.updateAsset.push({ assetId, payload });
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
    this.calls.uploadAssetFile.push("uploadAssetFile");
    return { path: "external-projects/yashie/uploaded.png" };
  }
}

function delivered(client: FakeCrudClient) {
  return buildYashieContent({
    adapter: "yashie", canonicalProjectId: "yashie", workspaceId: "workspace-1",
    generatedAt: "now", loadingData: null, profileData: {},
    collections: client.studio.collections.map((collection) => ({
      ...collection,
      entries: client.studio.entries.filter((entry) => entry.collection_id === collection.id)
        .map((entry) => ({ ...entry,
          assets: client.studio.assets.filter((asset) => asset.entry_id === entry.id),
          blocks: client.studio.blocks.filter((block) => block.entry_id === entry.id),
        })),
    })),
  } as unknown as YashieDeliveryPayload, { apiBaseUrl: "https://example.com/api/v1" });
}

describe("Yashie admin content mutations", () => {
  beforeEach(() => {
    revalidatePath.mockClear();
    revalidateTag.mockClear();
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

      const studioReadsBeforeDelete = client.calls.getStudio.length;
      const deleted = await deleteYashieContentItem(
        client,
        "workspace-1",
        collectionKey,
        entryId!,
      );

      expect(deleted.items).toEqual([]);
      expect(client.calls.deleteEntry).toContain(entryId);
      expect(client.calls.deleteAsset).toEqual([]);
      expect(client.calls.getStudio).toHaveLength(studioReadsBeforeDelete + 1);
    }
  });

  for (const key of ["blog", "worlds", "gallery", "shop"] as const) {
    test(`${key}: all editable text, crop, image removal and visibility reach public delivery`, async () => {
      const client = new FakeCrudClient();
      const created = await createYashieContentItem(client, "workspace-1", key, createInput(key, {
        imageAlt: "Original image", imagePosition: "20% 30%",
        imageFile: new File(["cover"], "cover.png", { type: "image/png" }),
      }));
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(revalidateTag).toHaveBeenCalledWith("yashie-delivery-v1", { expire: 0 });
      const id = created.item!.id;
      // Existing externally hosted assets must survive crop/alt-only edits.
      Object.assign(client.studio.assets[0], { source_url: "https://example.com/cover.png", storage_path: null,
        metadata: { filename: "cover.png", contentType: "image/png", imagePosition: "20% 30%" } });
      const changed = createInput(key, { title: "Edited title", slug: "edited-slug", summary: "Edited description",
        body: "Edited full body", category: "Edited category", type: "Edited type", price: "$99",
        date: "Edited date", readTime: "Edited read time", imageAlt: "Edited alt", imagePosition: "80% 70%" });
      const updated = await updateYashieContentItem(client, "workspace-1", key, id, changed);
      expect(updated.item).toMatchObject({ title: changed.title, slug: changed.slug, summary: changed.summary,
        imageAlt: changed.imageAlt, imagePosition: changed.imagePosition });
      expect(client.studio.assets[0]).toMatchObject({ source_url: "https://example.com/cover.png", storage_path: null,
        metadata: { filename: "cover.png", contentType: "image/png", imagePosition: changed.imagePosition } });
      const list = (content: ReturnType<typeof delivered>) => key === "blog" ? content.blogPosts : key === "worlds" ? content.worlds : key === "gallery" ? content.galleryItems : content.products;
      const item = list(delivered(client))[0];
      expect(item).toMatchObject({ title: changed.title, slug: changed.slug, image: "https://example.com/cover.png",
        imageAlt: changed.imageAlt, imagePosition: changed.imagePosition });
      if (key === "blog") expect(item).toMatchObject({ body: changed.body, category: changed.category, excerpt: changed.summary, date: changed.date, readTime: changed.readTime });
      if (key === "worlds") expect(item).toMatchObject({ detail: changed.body, kicker: changed.category, description: changed.summary });
      if (key === "gallery") expect(item).toMatchObject({ type: changed.type, description: changed.summary });
      if (key === "shop") expect(item).toMatchObject({ price: changed.price, description: changed.summary });
      await updateYashieContentItem(client, "workspace-1", key, id, { ...changed, removeImage: true, body: "", date: "", readTime: "", imagePosition: "" });
      const cleared = list(delivered(client))[0];
      expect(cleared.image).toBe("");
      expect(cleared.imagePosition).toBe("");
      if (key === "blog") expect(cleared).toMatchObject({ body: "", date: "", readTime: "" });
      if (key === "worlds") expect(cleared).toMatchObject({ detail: "" });
      for (const status of ["draft", "scheduled", "archived"] as const) {
        await updateYashieContentItem(client, "workspace-1", key, id, { ...changed, status });
        expect(list(delivered(client))).toEqual([]);
      }
      await updateYashieContentItem(client, "workspace-1", key, id, changed);
      expect(list(delivered(client))).toHaveLength(1);
      await deleteYashieContentItem(client, "workspace-1", key, id);
      expect(list(delivered(client))).toEqual([]);
    });
  }

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

  test("replaces cover images by deleting old media after creating the new asset", async () => {
    const client = new FakeCrudClient();
    const created = await createYashieContentItem(
      client,
      "workspace-1",
      "gallery",
      createInput("gallery", {
        imageAlt: "Old cover",
        imageFile: new File(["old"], "old-cover.png", { type: "image/png" }),
      }),
    );
    const entryId = created.item?.id;
    const oldAssetId = created.item?.imageAssetId;

    expect(entryId).toBeTruthy();
    expect(oldAssetId).toBe("asset-1");

    const updated = await updateYashieContentItem(
      client,
      "workspace-1",
      "gallery",
      entryId!,
      createInput("gallery", {
        imageAlt: "New cover",
        imageFile: new File(["new"], "new-cover.png", { type: "image/png" }),
        slug: "gallery-with-new-cover",
        title: "Gallery with new cover",
      }),
    );

    expect(client.calls.uploadAssetFile).toHaveLength(2);
    expect(client.calls.createAsset).toHaveLength(2);
    expect(client.calls.deleteAsset).toContain(oldAssetId);
    expect(client.calls.updateAsset).toEqual([]);
    expect(updated.item).toEqual(
      expect.objectContaining({
        imageAlt: "New cover",
        imageAssetId: "asset-2",
      }),
    );
    expect(
      client.studio.assets.map((asset) => String(readRecord(asset).id)),
    ).toEqual(["asset-2"]);
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
