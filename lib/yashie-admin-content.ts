import type { ExternalProjectsClient } from "tuturuuu/external-projects";
import {
  YASHIE_ADMIN_COLLECTIONS,
  readYashieAdminContent,
  type YashieAdminCollectionKey,
  type YashieAdminContentItem,
  type YashieAdminStudioPayload,
  type YashieContentMutationInput,
} from "./yashie-admin-content-model";
import {
  createYashieExternalProjectsClient,
  revalidateYashieContent,
} from "./yashie-admin-api";
import { getYashieWorkspaceId } from "./yashie-config";
import { getYashieManifestCollectionSchema } from "./yashie-external-project-manifest";

type YashieCrudClient = Pick<
  ExternalProjectsClient,
  | "createAsset"
  | "createBlock"
  | "createCollection"
  | "createEntry"
  | "deleteAsset"
  | "deleteEntry"
  | "getStudio"
  | "updateAsset"
  | "updateBlock"
  | "updateEntry"
  | "uploadAssetFile"
>;

type MutationResult = {
  item: YashieAdminContentItem | null;
  items: YashieAdminContentItem[];
};

export type YashieContentMutationProgress = {
  label: string;
  percent: number;
  step: string;
};

type MutationOptions = {
  onProgress?: (progress: YashieContentMutationProgress) => Promise<void> | void;
};

async function reportProgress(
  options: MutationOptions | undefined,
  progress: YashieContentMutationProgress,
) {
  await options?.onProgress?.(progress);
}

function readRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getCollection(studio: YashieAdminStudioPayload, collectionKey: YashieAdminCollectionKey) {
  const config = YASHIE_ADMIN_COLLECTIONS[collectionKey];

  return (
    studio.collections.find((collection) => {
      return (
        readString(collection, "slug") === config.collectionSlug ||
        readString(collection, "collection_type") === config.collectionSlug
      );
    }) ?? null
  );
}

function readCreatedEntryId(response: unknown) {
  const record = readRecord(response);
  return readString(record, "id") ?? readString(readRecord(record.entry), "id");
}

function findItemById(
  studio: YashieAdminStudioPayload,
  collectionKey: YashieAdminCollectionKey,
  entryId: string,
) {
  return readYashieAdminContent(studio, collectionKey).find((item) => item.id === entryId) ?? null;
}

function findItemBySlug(
  studio: YashieAdminStudioPayload,
  collectionKey: YashieAdminCollectionKey,
  slug: string,
) {
  return readYashieAdminContent(studio, collectionKey).find((item) => item.slug === slug) ?? null;
}

async function ensureContentCollection(
  client: YashieCrudClient,
  workspaceId: string,
  collectionKey: YashieAdminCollectionKey,
) {
  let studio = (await client.getStudio(workspaceId)) as YashieAdminStudioPayload;
  let collection = getCollection(studio, collectionKey);

  if (!collection) {
    const config = YASHIE_ADMIN_COLLECTIONS[collectionKey];
    const schema = getYashieManifestCollectionSchema(config.collectionSlug);

    await client.createCollection(workspaceId, {
      collection_type: schema?.collection_type ?? config.collectionSlug,
      config: {},
      description: schema?.description ?? null,
      slug: config.collectionSlug,
      title: schema?.title ?? config.singularLabel,
    });

    studio = (await client.getStudio(workspaceId)) as YashieAdminStudioPayload;
    collection = getCollection(studio, collectionKey);
  }

  if (!collection) {
    throw new Error("This section is not ready yet.");
  }

  return { collection, studio };
}

function buildProfileData(input: YashieContentMutationInput) {
  if (input.collectionKey === "blog") {
    return {
      category: input.category,
      date: input.date,
      readTime: input.readTime,
    };
  }

  if (input.collectionKey === "categories") {
    return {
      group: input.category,
    };
  }

  if (input.collectionKey === "gallery") {
    return {
      type: input.type,
    };
  }

  if (input.collectionKey === "worlds") {
    return {
      detail: input.body,
      kicker: input.category,
    };
  }

  return {
    price: input.price,
  };
}

function getSubtitle(input: YashieContentMutationInput) {
  if (input.collectionKey === "blog") return input.category || null;
  if (input.collectionKey === "categories") return input.category || null;
  if (input.collectionKey === "gallery") return input.type || null;
  if (input.collectionKey === "worlds") return input.category || null;
  return input.price || null;
}

function buildEntryPayload(collectionId: string, input: YashieContentMutationInput) {
  return {
    collection_id: collectionId,
    metadata: {},
    profile_data: buildProfileData(input),
    slug: input.slug,
    status: input.status,
    subtitle: getSubtitle(input),
    summary: input.summary || null,
    title: input.title,
  };
}

function buildBlockPayload(entryId: string, input: YashieContentMutationInput) {
  return {
    block_type: "markdown",
    content: {
      markdown: input.body,
    },
    entry_id: entryId,
    sort_order: 0,
    title: input.collectionKey === "worlds" ? "Detail" : "Body",
  };
}

async function saveBodyBlock({
  client,
  entryId,
  input,
  item,
  workspaceId,
}: {
  client: YashieCrudClient;
  entryId: string;
  input: YashieContentMutationInput;
  item: YashieAdminContentItem | null;
  workspaceId: string;
}) {
  if (input.collectionKey !== "blog" && input.collectionKey !== "worlds") return;

  const payload = buildBlockPayload(entryId, input);

  if (item?.blockId) {
    await client.updateBlock(workspaceId, item.blockId, payload);
    return;
  }

  if (input.body) {
    await client.createBlock(workspaceId, payload);
  }
}

async function uploadImageFile(
  client: YashieCrudClient,
  workspaceId: string,
  input: YashieContentMutationInput,
) {
  if (!input.imageFile) return null;

  return client.uploadAssetFile(workspaceId, input.imageFile, {
    collectionType: YASHIE_ADMIN_COLLECTIONS[input.collectionKey].collectionSlug,
    entrySlug: input.slug,
    upsert: true,
  });
}

function buildImageAssetPayload({
  entryId,
  input,
  upload,
}: {
  entryId: string;
  input: YashieContentMutationInput;
  upload?: { path: string } | null;
}) {
  const metadata: Record<string, string | number | null> = {
    imagePosition: input.imagePosition || null,
  };

  if (input.imageFile) {
    metadata.contentType = input.imageFile.type || null;
    metadata.filename = input.imageFile.name;
    metadata.size = input.imageFile.size;
  }

  return {
    alt_text: input.imageAlt || `${input.title} image`,
    asset_type: "image",
    block_id: null,
    entry_id: entryId,
    metadata,
    sort_order: 0,
    source_url: null,
    storage_path: upload?.path ?? null,
  };
}

async function saveImageAsset({
  client,
  entryId,
  input,
  item,
  workspaceId,
}: {
  client: YashieCrudClient;
  entryId: string;
  input: YashieContentMutationInput;
  item: YashieAdminContentItem | null;
  workspaceId: string;
}) {
  if (input.removeImage && item?.imageAssetId) {
    await client.deleteAsset(workspaceId, item.imageAssetId);
    return;
  }

  if (!input.imageFile) {
    if (
      item?.imageAssetId &&
      (input.imageAlt !== item.imageAlt || input.imagePosition !== item.imagePosition)
    ) {
      await client.updateAsset(workspaceId, item.imageAssetId, {
        ...buildImageAssetPayload({ entryId, input, upload: null }),
        storage_path: item.imageStoragePath,
      });
    }

    return;
  }

  const upload = await uploadImageFile(client, workspaceId, input);
  const payload = buildImageAssetPayload({ entryId, input, upload });

  if (upload) {
    await client.createAsset(workspaceId, payload);

    if (item?.imageAssetId) {
      await client.deleteAsset(workspaceId, item.imageAssetId);
    }
  }
}

async function finalizeMutation(
  client: YashieCrudClient,
  workspaceId: string,
  collectionKey: YashieAdminCollectionKey,
  entryId: string | null,
): Promise<MutationResult> {
  const studio = (await client.getStudio(workspaceId)) as YashieAdminStudioPayload;
  const items = readYashieAdminContent(studio, collectionKey);
  revalidateYashieContent();

  return {
    item: entryId ? items.find((contentItem) => contentItem.id === entryId) ?? null : null,
    items,
  };
}

export async function createYashieContentItem(
  client: YashieCrudClient,
  workspaceId: string,
  collectionKey: YashieAdminCollectionKey,
  input: YashieContentMutationInput,
  options?: MutationOptions,
): Promise<MutationResult> {
  await reportProgress(options, {
    label: "Preparing section",
    percent: 8,
    step: "prepare-section",
  });
  const { collection } = await ensureContentCollection(client, workspaceId, collectionKey);
  await reportProgress(options, {
    label: "Saving details",
    percent: 24,
    step: "save-details",
  });
  const created = await client.createEntry(
    workspaceId,
    buildEntryPayload(String(collection.id), input),
  );
  let entryId = readCreatedEntryId(created);

  if (!entryId) {
    const studio = (await client.getStudio(workspaceId)) as YashieAdminStudioPayload;
    entryId = findItemBySlug(studio, collectionKey, input.slug)?.id ?? null;
  }

  if (!entryId) {
    throw new Error("The item was saved, but it could not be opened.");
  }

  await reportProgress(options, {
    label: input.imageFile ? "Uploading image" : "Checking image",
    percent: 52,
    step: "save-image",
  });
  const item = null;
  await saveImageAsset({ client, entryId, input, item, workspaceId });
  await reportProgress(options, {
    label:
      collectionKey === "blog" || collectionKey === "worlds"
        ? "Saving words"
        : "Saving page details",
    percent: 68,
    step: "save-copy",
  });
  await saveBodyBlock({ client, entryId, input, item, workspaceId });
  await reportProgress(options, {
    label: "Saving visibility",
    percent: 84,
    step: "save-visibility",
  });

  await reportProgress(options, {
    label: "Refreshing dashboard",
    percent: 94,
    step: "refresh-dashboard",
  });
  const studio = (await client.getStudio(workspaceId)) as YashieAdminStudioPayload;
  return {
    item: findItemById(studio, collectionKey, entryId),
    items: readYashieAdminContent(studio, collectionKey),
  };
}

export async function updateYashieContentItem(
  client: YashieCrudClient,
  workspaceId: string,
  collectionKey: YashieAdminCollectionKey,
  entryId: string,
  input: YashieContentMutationInput,
  options?: MutationOptions,
): Promise<MutationResult> {
  await reportProgress(options, {
    label: "Preparing section",
    percent: 8,
    step: "prepare-section",
  });
  const { collection, studio } = await ensureContentCollection(client, workspaceId, collectionKey);
  const current = findItemById(studio, collectionKey, entryId);

  if (!current) {
    throw new Error("Item not found.");
  }

  await reportProgress(options, {
    label: "Saving details",
    percent: 24,
    step: "save-details",
  });
  await client.updateEntry(workspaceId, entryId, buildEntryPayload(String(collection.id), input));
  await reportProgress(options, {
    label: input.imageFile ? "Uploading image" : "Checking image",
    percent: 52,
    step: "save-image",
  });
  await saveImageAsset({ client, entryId, input, item: current, workspaceId });
  await reportProgress(options, {
    label:
      collectionKey === "blog" || collectionKey === "worlds"
        ? "Saving words"
        : "Saving page details",
    percent: 68,
    step: "save-copy",
  });
  await saveBodyBlock({ client, entryId, input, item: current, workspaceId });
  await reportProgress(options, {
    label: "Saving visibility",
    percent: 84,
    step: "save-visibility",
  });

  await reportProgress(options, {
    label: "Refreshing dashboard",
    percent: 94,
    step: "refresh-dashboard",
  });
  return finalizeMutation(client, workspaceId, collectionKey, entryId);
}

export async function deleteYashieContentItem(
  client: YashieCrudClient,
  workspaceId: string,
  collectionKey: YashieAdminCollectionKey,
  entryId: string,
): Promise<MutationResult> {
  const studio = (await client.getStudio(workspaceId)) as YashieAdminStudioPayload;
  const current = findItemById(studio, collectionKey, entryId);

  if (!current) {
    throw new Error("Item not found.");
  }

  await client.deleteEntry(workspaceId, entryId);
  revalidateYashieContent();

  return {
    item: null,
    items: readYashieAdminContent(studio, collectionKey).filter(
      (contentItem) => contentItem.id !== entryId,
    ),
  };
}

export async function refreshYashieAdminContent(
  accessToken: string,
  collectionKey: YashieAdminCollectionKey,
) {
  const workspaceId = getYashieWorkspaceId();
  const client = createYashieExternalProjectsClient(accessToken);
  const studio = await client.getStudio(workspaceId);
  return readYashieAdminContent(studio as YashieAdminStudioPayload, collectionKey);
}
