export type YashieAdminStudioPayload = {
  assets: Array<Record<string, unknown>>;
  binding?: Record<string, unknown>;
  blocks: Array<Record<string, unknown>>;
  collections: Array<Record<string, unknown>>;
  entries: Array<Record<string, unknown>>;
  importJobs?: unknown[];
  loadingData?: unknown;
  publishEvents?: unknown[];
};

export type YashieContentStatus = "archived" | "draft" | "published" | "scheduled";
export type YashieAdminCollectionKey =
  | "blog"
  | "categories"
  | "gallery"
  | "shop"
  | "worlds";

export type YashieAdminCollectionConfig = {
  collectionSlug: string;
  key: YashieAdminCollectionKey;
  singularLabel: string;
};

export type YashieAdminContentItem = {
  blockId: string | null;
  body: string;
  category: string;
  collectionKey: YashieAdminCollectionKey;
  date: string;
  id: string;
  imageAlt: string;
  imageAssetId: string | null;
  imagePosition: string;
  imageStoragePath: string | null;
  imageUrl: string | null;
  price: string;
  readTime: string;
  slug: string;
  status: YashieContentStatus;
  summary: string;
  title: string;
  type: string;
};

type YashiePublicContentCollections = Pick<
  Record<YashieAdminCollectionKey, readonly unknown[]>,
  "blog" | "gallery" | "shop" | "worlds"
>;

export function needsYashieStarterContent(
  content: YashiePublicContentCollections,
) {
  return Object.values(content).some((items) => items.length === 0);
}

export type YashieContentMutationInput = {
  body: string;
  category: string;
  collectionKey: YashieAdminCollectionKey;
  date: string;
  imageAlt: string;
  imageFile?: File | null;
  imagePosition: string;
  price: string;
  readTime: string;
  removeImage: boolean;
  slug: string;
  status: YashieContentStatus;
  summary: string;
  title: string;
  type: string;
};

const MAX_IMAGE_FILE_BYTES = 12 * 1024 * 1024;

const VALID_STATUSES = new Set<YashieContentStatus>([
  "archived",
  "draft",
  "published",
  "scheduled",
]);

export const YASHIE_ADMIN_COLLECTIONS: Record<
  YashieAdminCollectionKey,
  YashieAdminCollectionConfig
> = {
  blog: {
    collectionSlug: "blog-posts",
    key: "blog",
    singularLabel: "post",
  },
  categories: {
    collectionSlug: "categories",
    key: "categories",
    singularLabel: "category",
  },
  gallery: {
    collectionSlug: "gallery",
    key: "gallery",
    singularLabel: "gallery piece",
  },
  shop: {
    collectionSlug: "shop-products",
    key: "shop",
    singularLabel: "shop item",
  },
  worlds: {
    collectionSlug: "writing-worlds",
    key: "worlds",
    singularLabel: "writing world",
  },
};

function readRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getSortOrder(record: Record<string, unknown>) {
  return readNumber(record, "sort_order") ?? readNumber(record, "sortOrder") ?? 0;
}

function getEntryCollectionSlug(
  entry: Record<string, unknown>,
  collectionById: Map<string, Record<string, unknown>>,
) {
  const directSlug = readString(entry, "collectionSlug") ?? readString(entry, "collection_slug");
  if (directSlug) return directSlug;

  const collectionId = readString(entry, "collection_id") ?? readString(entry, "collectionId");
  const collection = collectionId ? collectionById.get(collectionId) : null;

  return collection
    ? readString(collection, "slug") ?? readString(collection, "collection_type")
    : null;
}

function getAssetEntryId(asset: Record<string, unknown>) {
  return readString(asset, "entry_id") ?? readString(asset, "entryId");
}

function getBlockEntryId(block: Record<string, unknown>) {
  return readString(block, "entry_id") ?? readString(block, "entryId");
}

function getAssetType(asset: Record<string, unknown>) {
  return readString(asset, "asset_type") ?? readString(asset, "assetType");
}

function getBlockType(block: Record<string, unknown>) {
  return readString(block, "block_type") ?? readString(block, "blockType");
}

function getAssetUrl(asset: Record<string, unknown> | undefined) {
  if (!asset) return null;

  return (
    readString(asset, "asset_url") ??
    readString(asset, "assetUrl") ??
    readString(asset, "source_url") ??
    readString(asset, "sourceUrl")
  );
}

function getAssetStoragePath(asset: Record<string, unknown> | undefined) {
  if (!asset) return null;
  return readString(asset, "storage_path") ?? readString(asset, "storagePath");
}

function getBlockMarkdown(block: Record<string, unknown> | undefined) {
  const content = readRecord(block?.content);
  return readString(content, "markdown") ?? "";
}

export function normalizeYashieContentStatus(value: string | null): YashieContentStatus {
  return value && VALID_STATUSES.has(value as YashieContentStatus)
    ? (value as YashieContentStatus)
    : "draft";
}

export function slugifyYashieContent(value: string, fallback = "new-item") {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || fallback;
}

export function resolveYashieAdminCollectionKey(
  value: string | null | undefined,
): YashieAdminCollectionKey | null {
  if (!value) return null;

  if (value in YASHIE_ADMIN_COLLECTIONS) {
    return value as YashieAdminCollectionKey;
  }

  return (
    Object.values(YASHIE_ADMIN_COLLECTIONS).find(
      (collection) => collection.collectionSlug === value,
    )?.key ?? null
  );
}

export function readYashieAdminContent(
  studio: YashieAdminStudioPayload,
  collectionKey: YashieAdminCollectionKey,
) {
  const config = YASHIE_ADMIN_COLLECTIONS[collectionKey];
  const collectionById = new Map(
    studio.collections.map((collection) => [String(collection.id), collection]),
  );
  const imageAssets = studio.assets
    .filter((asset) => getAssetType(asset) === "image")
    .sort((left, right) => getSortOrder(left) - getSortOrder(right));
  const markdownBlocks = studio.blocks
    .filter((block) => getBlockType(block) === "markdown")
    .sort((left, right) => getSortOrder(left) - getSortOrder(right));

  return studio.entries
    .filter((entry) => getEntryCollectionSlug(entry, collectionById) === config.collectionSlug)
    .map<YashieAdminContentItem>((entry) => {
      const profileData = readRecord(entry.profile_data ?? entry.profileData);
      const entryId = String(entry.id);
      const imageAsset = imageAssets.find((asset) => getAssetEntryId(asset) === entryId);
      const markdownBlock = markdownBlocks.find((block) => getBlockEntryId(block) === entryId);

      return {
        blockId: markdownBlock ? String(markdownBlock.id) : null,
        body: getBlockMarkdown(markdownBlock),
        category:
          readString(profileData, "category") ??
          readString(profileData, "kicker") ??
          readString(profileData, "group") ??
          readString(entry, "subtitle") ??
          "",
        collectionKey,
        date: readString(profileData, "date") ?? "",
        id: entryId,
        imageAlt: readString(imageAsset ?? {}, "alt_text") ?? readString(imageAsset ?? {}, "altText") ?? "",
        imageAssetId: imageAsset ? String(imageAsset.id) : null,
        imagePosition: readString(profileData, "imagePosition") ?? "",
        imageStoragePath: getAssetStoragePath(imageAsset),
        imageUrl: getAssetUrl(imageAsset),
        price: readString(profileData, "price") ?? readString(entry, "subtitle") ?? "",
        readTime: readString(profileData, "readTime") ?? "",
        slug: readString(entry, "slug") ?? slugifyYashieContent(readString(entry, "title") ?? entryId),
        status: normalizeYashieContentStatus(readString(entry, "status")),
        summary: readString(entry, "summary") ?? "",
        title: readString(entry, "title") ?? "Untitled",
        type: readString(profileData, "type") ?? readString(entry, "subtitle") ?? "",
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title));
}

function isImageFile(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name)
  );
}

export function parseYashieContentFormData(
  collectionKey: YashieAdminCollectionKey,
  formData: FormData,
): {
  errors: Record<string, string>;
  input: YashieContentMutationInput | null;
} {
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugifyYashieContent(String(formData.get("slug") ?? title));
  const rawStatus = String(formData.get("status") ?? "draft").trim();
  const status = normalizeYashieContentStatus(rawStatus);
  const uploadedImage = formData.get("imageFile");
  const imageFile = uploadedImage instanceof File && uploadedImage.size > 0 ? uploadedImage : null;
  const errors: Record<string, string> = {};

  if (!title) {
    errors.title = "Add a title.";
  }

  if (rawStatus && !VALID_STATUSES.has(rawStatus as YashieContentStatus)) {
    errors.status = "Choose a valid visibility option.";
  }

  if (imageFile) {
    if (!isImageFile(imageFile)) {
      errors.imageFile = "Choose an image file.";
    } else if (imageFile.size > MAX_IMAGE_FILE_BYTES) {
      errors.imageFile = "Choose an image under 12 MB.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, input: null };
  }

  return {
    errors: {},
    input: {
      body: String(formData.get("body") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim(),
      collectionKey,
      date: String(formData.get("date") ?? "").trim(),
      imageAlt: String(formData.get("imageAlt") ?? "").trim(),
      imageFile,
      imagePosition: String(formData.get("imagePosition") ?? "").trim(),
      price: String(formData.get("price") ?? "").trim(),
      readTime: String(formData.get("readTime") ?? "").trim(),
      removeImage: formData.get("removeImage") === "true" || formData.get("removeImage") === "on",
      slug,
      status,
      summary: String(formData.get("summary") ?? "").trim(),
      title,
      type: String(formData.get("type") ?? "").trim(),
    },
  };
}
