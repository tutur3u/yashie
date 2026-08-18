import { socialPlatformOptions } from "@/app/data/portfolio";

export type YashieSyncField = {
  description?: string | null;
  key: string;
  label: string;
  options?: string[];
  required?: boolean;
  type:
    | "boolean"
    | "date"
    | "datetime"
    | "json"
    | "markdown"
    | "number"
    | "string"
    | "string-array";
};

export type YashieExternalProjectManifest = {
  adapter: "yashie";
  content: {
    entries: Array<{
      assets?: Array<{
        altText?: string | null;
        assetType: string;
        metadata?: Record<string, unknown>;
        sortOrder?: number;
        sourceUrl?: string | null;
        stableSourceId: string;
        storagePath?: string | null;
      }>;
      blocks?: Array<{
        blockType: string;
        content: Record<string, unknown>;
        sortOrder?: number;
        stableSourceId: string;
        title?: string | null;
      }>;
      collectionSlug: string;
      metadata?: Record<string, unknown>;
      profileData?: Record<string, unknown>;
      slug: string;
      stableSourceId: string;
      status?: "draft" | "scheduled" | "published" | "archived";
      subtitle?: string | null;
      summary?: string | null;
      title: string;
    }>;
  };
  schema: {
    collections: Array<{
      assetTypes?: string[];
      blockTypes?: string[];
      collection_type: string;
      description?: string | null;
      metadataFields?: YashieSyncField[];
      profileFields?: YashieSyncField[];
      slug: string;
      title: string;
    }>;
    metadataFields?: YashieSyncField[];
    profileFields?: YashieSyncField[];
  };
  version: 1;
};

const profileFields = [
  { key: "alias", label: "Public alias", type: "string" },
  { key: "brand", label: "Brand", type: "string" },
  { key: "email", label: "Email", type: "string" },
  { key: "location", label: "Location", type: "string" },
  { key: "shortName", label: "Short name", type: "string" },
  { key: "title", label: "Title", type: "string" },
] satisfies YashieSyncField[];

const imagePositionField = {
  key: "imagePosition",
  label: "Image position",
  type: "string",
} satisfies YashieSyncField;

const worldFields = [
  { key: "detail", label: "Detail", type: "markdown" },
  imagePositionField,
  { key: "kicker", label: "Kicker", type: "string" },
] satisfies YashieSyncField[];

const galleryFields = [
  imagePositionField,
  { key: "type", label: "Type", type: "string" },
] satisfies YashieSyncField[];

const blogFields = [
  { key: "category", label: "Category", type: "string" },
  { key: "date", label: "Date", type: "string" },
  imagePositionField,
  { key: "readTime", label: "Read time", type: "string" },
] satisfies YashieSyncField[];

const productFields = [
  imagePositionField,
  { key: "price", label: "Price", type: "string" },
] satisfies YashieSyncField[];

const categoryFields = [
  {
    key: "group",
    label: "Section",
    options: ["worlds", "blog", "gallery", "shop"],
    required: true,
    type: "string",
  },
] satisfies YashieSyncField[];

const socialFields = [
  { key: "handle", label: "Handle", type: "string" },
  { key: "href", label: "URL", type: "string" },
  {
    key: "platform",
    label: "Platform",
    options: socialPlatformOptions.map((option) => option.value),
    type: "string",
  },
  { key: "sortOrder", label: "Order", type: "number" },
] satisfies YashieSyncField[];

const navigationFields = [
  { key: "href", label: "Link", type: "string" },
  { key: "key", label: "Tab key", required: true, type: "string" },
  { key: "sortOrder", label: "Order", type: "number" },
  { key: "visible", label: "Visible", type: "boolean" },
] satisfies YashieSyncField[];

export const yashieExternalProjectManifest = {
  adapter: "yashie",
  content: {
    entries: [],
  },
  schema: {
    collections: [
      {
        assetTypes: ["image"],
        blockTypes: ["markdown", "quote", "list"],
        collection_type: "profile",
        description: "Top-level InkedByYashie identity, intro copy, values, and facts.",
        profileFields,
        slug: "profile",
        title: "Profile",
      },
      {
        collection_type: "categories",
        description: "Reusable labels applied across posts, worlds, and gallery pieces.",
        profileFields: categoryFields,
        slug: "categories",
        title: "Categories",
      },
      {
        assetTypes: ["image"],
        blockTypes: ["markdown"],
        collection_type: "writing-worlds",
        description: "Writing modes, book-world rooms, and category doorway copy.",
        profileFields: worldFields,
        slug: "writing-worlds",
        title: "Writing Worlds",
      },
      {
        assetTypes: ["image"],
        collection_type: "gallery",
        description: "Book-world fragments and visual concept pieces.",
        profileFields: galleryFields,
        slug: "gallery",
        title: "Gallery",
      },
      {
        assetTypes: ["image"],
        blockTypes: ["markdown"],
        collection_type: "blog-posts",
        description: "Essay, poetry, reflection, and blog cards shown on the site.",
        profileFields: blogFields,
        slug: "blog-posts",
        title: "Blog Posts",
      },
      {
        assetTypes: ["image"],
        collection_type: "shop-products",
        description: "Shop items and author merchandise.",
        profileFields: productFields,
        slug: "shop-products",
        title: "Shop Products",
      },
      {
        collection_type: "social-links",
        description: "Outbound social and community links.",
        profileFields: socialFields,
        slug: "social-links",
        title: "Social Links",
      },
      {
        collection_type: "navigation-tabs",
        description: "Public website tabs and visitor visibility.",
        profileFields: navigationFields,
        slug: "navigation-tabs",
        title: "Navigation Tabs",
      },
    ],
    profileFields: [
      { key: "brand", label: "Brand", type: "string" },
      { key: "deliveryPreset", label: "Delivery preset", type: "string" },
    ],
  },
  version: 1,
} satisfies YashieExternalProjectManifest;

export function getYashieManifestCollectionSchema(collectionSlug: string | null | undefined) {
  return (
    yashieExternalProjectManifest.schema.collections.find(
      (collection) => collection.slug === collectionSlug,
    ) ?? null
  );
}
