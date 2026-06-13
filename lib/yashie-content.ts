import {
  author,
  blogPosts,
  galleryItems,
  navItems,
  products,
  profileFacts,
  socials,
  worlds,
  type BlogPost,
  type GalleryItem,
  type Product,
  type SocialLink,
  type SocialPlatform,
  type WritingWorld,
} from "@/app/data/portfolio";

type JsonObject = Record<string, unknown>;

type DeliveryBlock = {
  block_type: string;
  content: JsonObject | null;
  entry_id?: string | null;
  id: string;
  sort_order: number;
  title: string | null;
};

type DeliveryAsset = {
  alt_text: string | null;
  assetUrl: string | null;
  asset_type: string;
  block_id: string | null;
  entry_id: string | null;
  id: string;
  metadata: JsonObject;
  sort_order: number;
  source_url: string | null;
  storage_path: string | null;
};

type DeliveryEntry = {
  assets: DeliveryAsset[];
  blocks: DeliveryBlock[];
  id: string;
  metadata: JsonObject;
  profile_data: JsonObject;
  published_at: string | null;
  slug: string;
  status: string;
  subtitle: string | null;
  summary: string | null;
  title: string;
};

type DeliveryCollection = {
  collection_type: string;
  config: JsonObject | null;
  description: string | null;
  entries: DeliveryEntry[];
  id: string;
  slug: string;
  title: string;
};

export type YashieDeliveryPayload = {
  adapter: string;
  canonicalProjectId: string;
  collections: DeliveryCollection[];
  generatedAt: string;
  loadingData: unknown;
  profileData: JsonObject;
  workspaceId: string;
};

export type YashieContent = {
  author: typeof author;
  blogPosts: BlogPost[];
  galleryItems: GalleryItem[];
  navItems: typeof navItems;
  products: Product[];
  profileFacts: typeof profileFacts;
  socials: typeof socials;
  worlds: typeof worlds;
};

export const DEFAULT_YASHIE_CONTENT: YashieContent = {
  author,
  blogPosts,
  galleryItems,
  navItems,
  products,
  profileFacts,
  socials,
  worlds,
};

function asRecord(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function absolutizeUrl(baseUrl: string, value: string | null | undefined) {
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const parsedBaseUrl = new URL(baseUrl);

  if (value.startsWith("/")) {
    return new URL(value, parsedBaseUrl.origin).toString();
  }

  return new URL(value, `${baseUrl.replace(/\/$/, "")}/`).toString();
}

function getCollection(delivery: YashieDeliveryPayload, slug: string) {
  return delivery.collections.find((collection) => collection.slug === slug) ?? null;
}

function getPublishedEntries(delivery: YashieDeliveryPayload, slug: string) {
  return (getCollection(delivery, slug)?.entries ?? []).filter(
    (entry) => entry.status === "published",
  );
}

function getMarkdown(entry: DeliveryEntry | null | undefined) {
  const block = entry?.blocks
    .filter((item) => item.block_type === "markdown")
    .sort((left, right) => left.sort_order - right.sort_order)[0];
  const markdown = asRecord(block?.content).markdown;
  return asString(markdown);
}

function getListBlock(entry: DeliveryEntry | null | undefined, title: string) {
  const block = entry?.blocks
    .filter((item) => item.block_type === "list")
    .find((item) => item.title?.toLowerCase() === title.toLowerCase());
  const items = asRecord(block?.content).items;

  return Array.isArray(items)
    ? items.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : null;
}

function getQuoteBlock(entry: DeliveryEntry | null | undefined) {
  const block = entry?.blocks
    .filter((item) => item.block_type === "quote")
    .sort((left, right) => left.sort_order - right.sort_order)[0];
  return asString(asRecord(block?.content).quote);
}

function getLeadImage(entry: DeliveryEntry | null | undefined) {
  return (
    entry?.assets
      .filter((item) => item.asset_type === "image")
      .sort((left, right) => left.sort_order - right.sort_order)[0] ?? null
  );
}

function getImageUrl(entry: DeliveryEntry, apiBaseUrl: string) {
  const image = getLeadImage(entry);
  return absolutizeUrl(apiBaseUrl, image?.assetUrl ?? image?.source_url ?? null);
}

function buildAuthor(delivery: YashieDeliveryPayload) {
  const profileEntry =
    getPublishedEntries(delivery, "profile").find((entry) => entry.slug === "profile") ??
    getPublishedEntries(delivery, "profile")[0] ??
    null;

  if (!profileEntry) {
    return author;
  }

  const profileData = asRecord(profileEntry.profile_data);
  const tagline = getMarkdown(profileEntry) ?? profileEntry.summary ?? author.tagline;

  return {
    ...author,
    alias: asString(profileData.alias) ?? author.alias,
    brand: asString(profileData.brand) ?? author.brand,
    email: asString(profileData.email) ?? author.email,
    location: asString(profileData.location) ?? author.location,
    name: profileEntry.title || author.name,
    quote: getQuoteBlock(profileEntry) ?? author.quote,
    shortName: asString(profileData.shortName) ?? author.shortName,
    tagline,
    title: asString(profileData.title) ?? profileEntry.subtitle ?? author.title,
    values: getListBlock(profileEntry, "Values") ?? author.values,
  };
}

function buildProfileFacts(delivery: YashieDeliveryPayload) {
  const profileEntry =
    getPublishedEntries(delivery, "profile").find((entry) => entry.slug === "profile") ??
    getPublishedEntries(delivery, "profile")[0] ??
    null;

  return getListBlock(profileEntry, "Profile facts") ?? profileFacts;
}

function isSocialPlatform(value: string | null): value is SocialPlatform {
  return Boolean(
    value &&
      ["instagram", "threads", "bluesky", "goodreads"].includes(value),
  );
}

function buildSocials(delivery: YashieDeliveryPayload) {
  const mapped = getPublishedEntries(delivery, "social-links")
    .map<SocialLink | null>((entry, index) => {
      const profileData = asRecord(entry.profile_data);
      const platform = asString(profileData.platform);

      if (!isSocialPlatform(platform)) {
        return null;
      }

      const fallback =
        socials.find((social) => social.platform === platform) ??
        socials[index % socials.length] ??
        socials[0]!;

      return {
        handle: asString(profileData.handle) ?? entry.summary ?? fallback.handle,
        href: asString(profileData.href) ?? fallback.href,
        label: entry.title || fallback.label,
        platform,
      };
    })
    .filter((social): social is SocialLink => Boolean(social));

  if (mapped.length === 0) {
    return socials;
  }

  return mapped.sort((left, right) => {
    const leftIndex = socials.findIndex((social) => social.platform === left.platform);
    const rightIndex = socials.findIndex((social) => social.platform === right.platform);
    return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
  });
}

function buildBlogPosts(delivery: YashieDeliveryPayload, apiBaseUrl: string) {
  const mapped = getPublishedEntries(delivery, "blog-posts").map<BlogPost>((entry, index) => {
    const profileData = asRecord(entry.profile_data);
    const fallback = blogPosts[index % blogPosts.length] ?? blogPosts[0]!;
    const body = getMarkdown(entry);
    const image = getLeadImage(entry);

    return {
      body: body ?? entry.summary ?? "",
      category: asString(profileData.category) ?? entry.subtitle ?? "Post",
      date: asString(profileData.date) ?? "New",
      excerpt: entry.summary ?? body ?? "",
      image: getImageUrl(entry, apiBaseUrl) ?? fallback.image,
      imageAlt: image?.alt_text ?? fallback.imageAlt,
      imagePosition: asString(profileData.imagePosition) ?? fallback.imagePosition,
      readTime: asString(profileData.readTime) ?? "Short read",
      slug: entry.slug,
      title: entry.title,
    };
  });

  return mapped.length > 0 ? mapped : blogPosts;
}

function buildGalleryItems(delivery: YashieDeliveryPayload, apiBaseUrl: string) {
  const mapped = getPublishedEntries(delivery, "gallery").map<GalleryItem>((entry, index) => {
    const profileData = asRecord(entry.profile_data);
    const fallback = galleryItems[index % galleryItems.length] ?? galleryItems[0]!;
    const image = getLeadImage(entry);

    return {
      description: entry.summary ?? "",
      image: getImageUrl(entry, apiBaseUrl) ?? fallback.image,
      imageAlt: image?.alt_text ?? fallback.imageAlt,
      imagePosition: asString(profileData.imagePosition) ?? fallback.imagePosition,
      slug: entry.slug,
      title: entry.title,
      type: asString(profileData.type) ?? entry.subtitle ?? "Gallery piece",
    };
  });

  return mapped.length > 0 ? mapped : galleryItems;
}

function buildProducts(delivery: YashieDeliveryPayload, apiBaseUrl: string) {
  const mapped = getPublishedEntries(delivery, "shop-products").map<Product>((entry, index) => {
    const profileData = asRecord(entry.profile_data);
    const fallback = products[index % products.length] ?? products[0]!;
    const image = getLeadImage(entry);

    return {
      description: entry.summary ?? "",
      image: getImageUrl(entry, apiBaseUrl) ?? fallback.image,
      imageAlt: image?.alt_text ?? fallback.imageAlt,
      imagePosition: asString(profileData.imagePosition) ?? fallback.imagePosition,
      price: asString(profileData.price) ?? entry.subtitle ?? "",
      slug: entry.slug,
      title: entry.title,
    };
  });

  return mapped.length > 0 ? mapped : products;
}

function buildWorlds(delivery: YashieDeliveryPayload, apiBaseUrl: string) {
  const mapped = getPublishedEntries(delivery, "writing-worlds").map<WritingWorld>(
    (entry, index) => {
      const profileData = asRecord(entry.profile_data);
      const fallback = worlds[index % worlds.length] ?? worlds[0]!;
      const image = getLeadImage(entry);
      const detail = getMarkdown(entry);

      return {
        description: entry.summary ?? "",
        detail: detail ?? asString(profileData.detail) ?? entry.summary ?? "",
        image: getImageUrl(entry, apiBaseUrl) ?? fallback.image,
        imageAlt: image?.alt_text ?? fallback.imageAlt,
        imagePosition: asString(profileData.imagePosition) ?? fallback.imagePosition,
        kicker: asString(profileData.kicker) ?? entry.subtitle ?? fallback.kicker,
        slug: entry.slug,
        title: entry.title,
      };
    },
  );

  return mapped.length > 0 ? mapped : worlds;
}

export function buildYashieContent(
  delivery: YashieDeliveryPayload | null | undefined,
  {
    apiBaseUrl,
  }: {
    apiBaseUrl: string;
  },
): YashieContent {
  if (!delivery || delivery.adapter !== "yashie") {
    return DEFAULT_YASHIE_CONTENT;
  }

  return {
    ...DEFAULT_YASHIE_CONTENT,
    author: buildAuthor(delivery),
    blogPosts: buildBlogPosts(delivery, apiBaseUrl),
    galleryItems: buildGalleryItems(delivery, apiBaseUrl),
    products: buildProducts(delivery, apiBaseUrl),
    profileFacts: buildProfileFacts(delivery),
    socials: buildSocials(delivery),
    worlds: buildWorlds(delivery, apiBaseUrl),
  };
}
