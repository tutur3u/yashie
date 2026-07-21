import {
  author,
  blogPosts,
  galleryItems,
  products,
  profileFacts,
  socialPlatformOptions,
  slugify,
  socials,
  worlds,
  type BlogPost,
  type GalleryItem,
  type Product,
  type SocialLink,
  type WritingWorld,
} from "@/app/data/portfolio";

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

const PUBLISHED_STATUS = "published" as const;

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

function imageAsset({
  altText,
  collectionSlug,
  image,
  slug,
}: {
  altText: string;
  collectionSlug: string;
  image: string;
  slug: string;
}) {
  return {
    altText,
    assetType: "image",
    metadata: {
      publicPath: image,
    },
    sortOrder: 0,
    sourceUrl: image,
    stableSourceId: `yashie:${collectionSlug}:${slug}:image`,
  };
}

function uniqueLabels(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right),
  );
}

function categoryEntry({
  description,
  group,
  label,
}: {
  description?: string | null;
  group: "blog" | "gallery" | "shop" | "worlds";
  label: string;
}) {
  const slug = `${group}-${slugify(label)}`;

  return {
    blocks: [],
    collectionSlug: "categories",
    profileData: {
      group,
    },
    slug,
    stableSourceId: `yashie:categories:${slug}`,
    status: PUBLISHED_STATUS,
    subtitle: group,
    summary: description ?? `${label} category`,
    title: label,
  };
}

function worldEntry(world: WritingWorld) {
  const slug = slugify(world.title);

  return {
    assets: [
      imageAsset({
        altText: world.imageAlt,
        collectionSlug: "writing-worlds",
        image: world.image,
        slug,
      }),
    ],
    blocks: [
      {
        blockType: "markdown",
        content: {
          markdown: world.detail,
        },
        sortOrder: 0,
        stableSourceId: `yashie:writing-worlds:${slug}:detail`,
        title: "Detail",
      },
    ],
    collectionSlug: "writing-worlds",
    profileData: {
      detail: world.detail,
      imagePosition: world.imagePosition ?? null,
      kicker: world.kicker,
    },
    slug,
    stableSourceId: `yashie:writing-worlds:${slug}`,
    status: PUBLISHED_STATUS,
    subtitle: world.kicker,
    summary: world.description,
    title: world.title,
  };
}

function galleryEntry(item: GalleryItem) {
  const slug = slugify(item.title);

  return {
    assets: [
      imageAsset({
        altText: item.imageAlt,
        collectionSlug: "gallery",
        image: item.image,
        slug,
      }),
    ],
    blocks: [],
    collectionSlug: "gallery",
    profileData: {
      imagePosition: item.imagePosition ?? null,
      type: item.type,
    },
    slug,
    stableSourceId: `yashie:gallery:${slug}`,
    status: PUBLISHED_STATUS,
    subtitle: item.type,
    summary: item.description,
    title: item.title,
  };
}

function blogEntry(post: BlogPost) {
  const slug = slugify(post.title);

  return {
    assets: [
      imageAsset({
        altText: post.imageAlt,
        collectionSlug: "blog-posts",
        image: post.image,
        slug,
      }),
    ],
    blocks: [
      {
        blockType: "markdown",
        content: {
          markdown: post.excerpt,
        },
        sortOrder: 0,
        stableSourceId: `yashie:blog-posts:${slug}:excerpt`,
        title: "Excerpt",
      },
    ],
    collectionSlug: "blog-posts",
    profileData: {
      category: post.category,
      date: post.date,
      imagePosition: post.imagePosition ?? null,
      readTime: post.readTime,
    },
    slug,
    stableSourceId: `yashie:blog-posts:${slug}`,
    status: PUBLISHED_STATUS,
    subtitle: post.category,
    summary: post.excerpt,
    title: post.title,
  };
}

function productEntry(product: Product) {
  const slug = slugify(product.title);

  return {
    assets: [
      imageAsset({
        altText: product.imageAlt,
        collectionSlug: "shop-products",
        image: product.image,
        slug,
      }),
    ],
    blocks: [],
    collectionSlug: "shop-products",
    profileData: {
      imagePosition: product.imagePosition ?? null,
      price: product.price,
    },
    slug,
    stableSourceId: `yashie:shop-products:${slug}`,
    status: PUBLISHED_STATUS,
    subtitle: product.price,
    summary: product.description,
    title: product.title,
  };
}

function socialEntry(social: SocialLink) {
  const slug = slugify(social.label);

  return {
    blocks: [],
    collectionSlug: "social-links",
    profileData: {
      handle: social.handle,
      href: social.href,
      platform: social.platform,
      sortOrder: social.sortOrder,
    },
    slug,
    stableSourceId: `yashie:social-links:${slug}`,
    status: PUBLISHED_STATUS,
    summary: social.handle,
    title: social.label,
  };
}

const categoryEntries = [
  ...uniqueLabels(worlds.map((world) => world.kicker)).map((label) =>
    categoryEntry({ group: "worlds", label }),
  ),
  ...uniqueLabels(blogPosts.map((post) => post.category)).map((label) =>
    categoryEntry({ group: "blog", label }),
  ),
  ...uniqueLabels(galleryItems.map((item) => item.type)).map((label) =>
    categoryEntry({ group: "gallery", label }),
  ),
];

export const yashieExternalProjectManifest = {
  adapter: "yashie",
  content: {
    entries: [
      {
        assets: [
          imageAsset({
            altText: `${author.name} signature mark`,
            collectionSlug: "profile",
            image: "/images/artworks/yashie-author-signature.png",
            slug: "profile",
          }),
        ],
        blocks: [
          {
            blockType: "markdown",
            content: {
              markdown: author.tagline,
            },
            sortOrder: 0,
            stableSourceId: "yashie:profile:tagline",
            title: "Tagline",
          },
          {
            blockType: "quote",
            content: {
              quote: author.quote,
            },
            sortOrder: 1,
            stableSourceId: "yashie:profile:quote",
            title: "Quote",
          },
          {
            blockType: "list",
            content: {
              items: author.values,
            },
            sortOrder: 2,
            stableSourceId: "yashie:profile:values",
            title: "Values",
          },
          {
            blockType: "list",
            content: {
              items: profileFacts,
            },
            sortOrder: 3,
            stableSourceId: "yashie:profile:facts",
            title: "Profile facts",
          },
        ],
        collectionSlug: "profile",
        profileData: {
          alias: author.alias,
          brand: author.brand,
          email: author.email,
          location: author.location,
          shortName: author.shortName,
          title: author.title,
        },
        slug: "profile",
        stableSourceId: "yashie:profile",
        status: PUBLISHED_STATUS,
        summary: author.tagline,
        title: author.name,
      },
      ...categoryEntries,
      ...worlds.map(worldEntry),
      ...galleryItems.map(galleryEntry),
      ...blogPosts.map(blogEntry),
      ...products.map(productEntry),
      ...socials.map(socialEntry),
    ],
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
