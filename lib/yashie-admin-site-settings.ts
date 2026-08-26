import type { ExternalProjectsClient } from "tuturuuu/external-projects";
import {
  author,
  navigationTabs,
  profileFacts,
  socials,
  socialPlatformOptions,
  type NavTabKey,
  type NavigationTab,
  type SocialLink,
  type SocialPlatform,
} from "@/app/data/portfolio";
import {
  createYashieExternalProjectsClient,
  revalidateYashieContent,
} from "./yashie-admin-api";
import type {
  YashieAdminStudioPayload,
  YashieContentStatus,
} from "./yashie-admin-content-model";
import { getYashieApiBaseUrl, getYashieWorkspaceId } from "./yashie-config";
import { getYashieManifestCollectionSchema } from "./yashie-external-project-manifest";
import {
  DEFAULT_YASHIE_PAGE_CONTENT,
  readYashiePageContent,
  YASHIE_PAGE_KEYS,
  type YashiePageContent,
} from "./yashie-page-content";

const PROFILE_COLLECTION_SLUG = "profile";
const PROFILE_ENTRY_SLUG = "profile";
const NAVIGATION_COLLECTION_SLUG = "navigation-tabs";
const SOCIAL_LINKS_COLLECTION_SLUG = "social-links";
const VALID_SOCIAL_PLATFORMS = new Set<SocialPlatform>(
  socialPlatformOptions.map((option) => option.value),
);
const VALID_STATUSES = new Set<YashieContentStatus>([
  "archived",
  "draft",
  "published",
  "scheduled",
]);

type SettingsClient = Pick<
  ExternalProjectsClient,
  | "createCollection"
  | "createEntry"
  | "deleteEntry"
  | "getStudio"
  | "updateEntry"
>;

type StudioRecord = Record<string, unknown>;

type SiteSettingsEntryPayload = {
  collection_id: string;
  metadata: Record<string, unknown>;
  profile_data: Record<string, unknown>;
  slug: string;
  status: YashieContentStatus;
  subtitle: string | null;
  summary: string | null;
  title: string;
};

type EntryBatchOperation =
  | {
      action: "create";
      clientOperationId: string;
      payload: SiteSettingsEntryPayload;
    }
  | {
      action: "update";
      clientOperationId: string;
      entryId: string;
      payload: SiteSettingsEntryPayload;
    }
  | {
      action: "delete";
      clientOperationId: string;
      entryId: string;
    };

type EntryBatchOperationResult =
  | {
      action: "create" | "update";
      clientOperationId: string;
      entry: StudioRecord;
      ok: true;
    }
  | {
      action: "delete";
      clientOperationId: string;
      entryId: string;
      ok: true;
    }
  | {
      action: EntryBatchOperation["action"];
      clientOperationId: string;
      error: string;
      ok: false;
    };

type EntryBatchResult = {
  results: EntryBatchOperationResult[];
};

export type YashieAdminProfileSettings = {
  alias: string;
  brand: string;
  email: string;
  entryId: string | null;
  location: string;
  name: string;
  profileFacts: string;
  quote: string;
  shortName: string;
  status: YashieContentStatus;
  summary: string;
  title: string;
};

export type YashieAdminSocialSettings = SocialLink & {
  id: string | null;
  status: YashieContentStatus;
};

export type YashieAdminNavigationSettings = NavigationTab & {
  entryId: string | null;
};

export type YashieAdminSiteSettings = {
  navigation: YashieAdminNavigationSettings[];
  pages: YashiePageContent;
  profile: YashieAdminProfileSettings;
  socials: YashieAdminSocialSettings[];
};

export type YashieAdminSiteSettingsInput = {
  navigation: Array<Pick<NavigationTab, "key" | "label" | "visible">>;
  pages: YashiePageContent;
  profile: Omit<
    YashieAdminProfileSettings,
    "entryId" | "profileFacts" | "quote"
  > &
    Partial<Pick<YashieAdminProfileSettings, "profileFacts" | "quote">>;
  socials: Array<
    Omit<YashieAdminSocialSettings, "id"> & { id?: string | null }
  >;
};

export type YashieAdminSiteSettingsParseResult = {
  errors: Record<string, string>;
  input: YashieAdminSiteSettingsInput | null;
};

function readRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as StudioRecord)
    : {};
}

function readString(record: StudioRecord, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readBoolean(record: StudioRecord, key: string) {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

function readNumber(record: StudioRecord, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSocialPlatform(value: string | null): SocialPlatform {
  return value && VALID_SOCIAL_PLATFORMS.has(value as SocialPlatform)
    ? (value as SocialPlatform)
    : "other";
}

function readOptionalId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function slugifySocialLink(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || fallback;
}

function normalizeStatus(value: unknown): YashieContentStatus {
  return typeof value === "string" &&
    VALID_STATUSES.has(value as YashieContentStatus)
    ? (value as YashieContentStatus)
    : "published";
}

function parseStatus(
  value: unknown,
  errors: Record<string, string>,
  key: string,
) {
  if (
    typeof value === "string" &&
    value.trim() &&
    !VALID_STATUSES.has(value as YashieContentStatus)
  ) {
    appendError(errors, key, "Choose a valid visibility option.");
  }

  return normalizeStatus(value);
}

function findCollection(studio: YashieAdminStudioPayload, slug: string) {
  return (
    studio.collections.find(
      (collection) =>
        readString(collection, "slug") === slug ||
        readString(collection, "collection_type") === slug ||
        readString(collection, "collectionType") === slug,
    ) ?? null
  );
}

function collectionIdForEntry(
  studio: YashieAdminStudioPayload,
  entry: StudioRecord,
) {
  const directSlug =
    readString(entry, "collectionSlug") ?? readString(entry, "collection_slug");
  if (directSlug) return directSlug;

  const collectionId =
    readString(entry, "collection_id") ?? readString(entry, "collectionId");
  const collection = collectionId
    ? studio.collections.find((item) => String(item.id) === collectionId)
    : null;

  return collection
    ? (readString(collection, "slug") ??
        readString(collection, "collection_type"))
    : null;
}

function findEntryBySlug(
  studio: YashieAdminStudioPayload,
  collectionSlug: string,
  slug: string,
) {
  return (
    studio.entries.find(
      (entry) =>
        collectionIdForEntry(studio, entry) === collectionSlug &&
        readString(entry, "slug") === slug,
    ) ?? null
  );
}

function findEntriesByCollection(
  studio: YashieAdminStudioPayload,
  collectionSlug: string,
) {
  return studio.entries.filter(
    (entry) => collectionIdForEntry(studio, entry) === collectionSlug,
  );
}

function socialFallback(platform: string | null, index: number) {
  return (
    socials.find((item) => item.platform === platform) ??
    socials[index % socials.length] ??
    socials[0]!
  );
}

function socialSort(
  left: YashieAdminSocialSettings,
  right: YashieAdminSocialSettings,
) {
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  return left.label.localeCompare(right.label);
}

function isNavigationTabKey(value: string | null): value is NavTabKey {
  return Boolean(value && navigationTabs.some((tab) => tab.key === value));
}

function readNavigationSettings(
  studio: YashieAdminStudioPayload,
): YashieAdminNavigationSettings[] {
  const deliveredByKey = new Map(
    findEntriesByCollection(studio, NAVIGATION_COLLECTION_SLUG)
      .map((entry) => {
        const profileData = readRecord(entry.profile_data ?? entry.profileData);
        const key = readString(profileData, "key") ?? readString(entry, "slug");
        return isNavigationTabKey(key) ? ([key, entry] as const) : null;
      })
      .filter((item): item is readonly [NavTabKey, StudioRecord] =>
        Boolean(item),
      ),
  );

  return navigationTabs
    .map<YashieAdminNavigationSettings>((tab) => {
      const entry = deliveredByKey.get(tab.key);
      const profileData = readRecord(entry?.profile_data ?? entry?.profileData);

      return {
        ...tab,
        entryId: entry ? String(entry.id) : null,
        label: readString(entry ?? {}, "title") ?? tab.label,
        sortOrder: readNumber(profileData, "sortOrder") ?? tab.sortOrder,
        visible: readBoolean(profileData, "visible") ?? tab.visible,
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function readYashieAdminSiteSettings(
  studio: YashieAdminStudioPayload,
): YashieAdminSiteSettings {
  const profileEntry = findEntryBySlug(
    studio,
    PROFILE_COLLECTION_SLUG,
    PROFILE_ENTRY_SLUG,
  );
  const profileData = readRecord(
    profileEntry?.profile_data ?? profileEntry?.profileData,
  );

  const deliveredSocials = findEntriesByCollection(
    studio,
    SOCIAL_LINKS_COLLECTION_SLUG,
  )
    .map<YashieAdminSocialSettings | null>((entry, index) => {
      const entryProfileData = readRecord(
        entry.profile_data ?? entry.profileData,
      );
      const platform = normalizeSocialPlatform(
        readString(entryProfileData, "platform"),
      );

      const fallback = socialFallback(platform, index);

      return {
        handle: readString(entryProfileData, "handle") ?? "",
        href: readString(entryProfileData, "href") ?? fallback.href,
        id: String(entry.id),
        label: readString(entry, "title") ?? fallback.label,
        platform,
        sortOrder: readNumber(entryProfileData, "sortOrder") ?? index,
        status: normalizeStatus(entry.status),
      };
    })
    .filter((item): item is YashieAdminSocialSettings => Boolean(item))
    .sort(socialSort);

  return {
    navigation: readNavigationSettings(studio),
    pages: readYashiePageContent(profileData.pageContent),
    profile: {
      alias: readString(profileData, "alias") ?? author.alias,
      brand: readString(profileData, "brand") ?? author.brand,
      email: readString(profileData, "email") ?? author.email,
      entryId: profileEntry ? String(profileEntry.id) : null,
      location: readString(profileData, "location") ?? author.location,
      name: readString(profileEntry ?? {}, "title") ?? author.name,
      profileFacts: Array.isArray(profileData.profileFacts)
        ? profileData.profileFacts
            .filter((item): item is string => typeof item === "string")
            .join(", ")
        : profileFacts.join(", "),
      quote: readString(profileData, "quote") ?? author.quote,
      shortName: readString(profileData, "shortName") ?? author.shortName,
      status: normalizeStatus(profileEntry?.status),
      summary: readString(profileEntry ?? {}, "summary") ?? author.tagline,
      title: readString(profileData, "title") ?? author.title,
    },
    socials:
      deliveredSocials.length > 0
        ? deliveredSocials
        : socials.map((social) => ({
            ...social,
            id: null,
            status: "published",
          })),
  };
}

function appendError(
  errors: Record<string, string>,
  key: string,
  message: string,
) {
  if (!errors[key]) {
    errors[key] = message;
  }
}

function readRequiredString(
  value: unknown,
  errors: Record<string, string>,
  key: string,
  message: string,
) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  appendError(errors, key, message);
  return "";
}

function readOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseYashieSiteSettingsPayload(
  payload: unknown,
): YashieAdminSiteSettingsParseResult {
  const errors: Record<string, string> = {};
  const record = readRecord(payload);
  const profile = readRecord(record.profile);
  const navigationValues = Array.isArray(record.navigation)
    ? record.navigation
    : [];
  const socialValues = Array.isArray(record.socials) ? record.socials : [];
  const submittedPages = readRecord(record.pages);

  const parsedProfile: YashieAdminSiteSettingsInput["profile"] = {
    alias: readRequiredString(
      profile.alias,
      errors,
      "profile.alias",
      "Add a public handle.",
    ),
    brand: readRequiredString(
      profile.brand,
      errors,
      "profile.brand",
      "Add the brand name.",
    ),
    email: readRequiredString(
      profile.email,
      errors,
      "profile.email",
      "Add an email address.",
    ),
    location: readOptionalString(profile.location) || author.location,
    name: readRequiredString(
      profile.name,
      errors,
      "profile.name",
      "Add the author name.",
    ),
    profileFacts:
      readOptionalString(profile.profileFacts) || profileFacts.join(", "),
    quote: readOptionalString(profile.quote) || author.quote,
    shortName: readRequiredString(
      profile.shortName,
      errors,
      "profile.shortName",
      "Add a short name.",
    ),
    status: parseStatus(profile.status, errors, "profile.status"),
    summary: readOptionalString(profile.summary) || author.tagline,
    title: readRequiredString(
      profile.title,
      errors,
      "profile.title",
      "Add the public title.",
    ),
  };

  if (
    parsedProfile.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsedProfile.email)
  ) {
    appendError(errors, "profile.email", "Use a valid email address.");
  }

  const parsedSocials = socialValues.map<
    YashieAdminSiteSettingsInput["socials"][number]
  >((item, index) => {
    const social = readRecord(item);
    const fallback = socials[index % socials.length] ?? socials[0]!;
    const platformValue = readString(social, "platform") ?? fallback.platform;
    const platform = normalizeSocialPlatform(platformValue);

    if (
      platformValue &&
      !VALID_SOCIAL_PLATFORMS.has(platformValue as SocialPlatform)
    ) {
      appendError(
        errors,
        `socials.${index}.platform`,
        "Choose a valid platform.",
      );
    }

    const href = readRequiredString(
      social.href,
      errors,
      `socials.${index}.href`,
      "Add a link.",
    );

    if (href && !isHttpUrl(href)) {
      appendError(
        errors,
        `socials.${index}.href`,
        "Use a full http or https link.",
      );
    }

    return {
      handle: readOptionalString(social.handle),
      href,
      id: readOptionalId(social.id),
      label:
        readRequiredString(
          social.label,
          errors,
          `socials.${index}.label`,
          "Add a link name.",
        ) ||
        socialPlatformOptions.find((entry) => entry.value === platform)
          ?.label ||
        fallback.label,
      platform,
      sortOrder: readNumber(social, "sortOrder") ?? index,
      status: parseStatus(social.status, errors, `socials.${index}.status`),
    };
  });

  const submittedNavigation = new Map(
    navigationValues
      .map((item) => {
        const navigationItem = readRecord(item);
        const key = readString(navigationItem, "key");
        return isNavigationTabKey(key)
          ? ([key, navigationItem] as const)
          : null;
      })
      .filter((item): item is readonly [NavTabKey, StudioRecord] =>
        Boolean(item),
      ),
  );
  const parsedNavigation = navigationTabs.map<
    YashieAdminSiteSettingsInput["navigation"][number]
  >((tab, index) => {
    const submitted = submittedNavigation.get(tab.key) ?? {};

    return {
      key: tab.key,
      label: readRequiredString(
        submitted.label ?? tab.label,
        errors,
        `navigation.${index}.label`,
        "Add a tab name.",
      ),
      visible: readBoolean(submitted, "visible") ?? tab.visible,
    };
  });

  const parsedPages = Object.fromEntries(
    YASHIE_PAGE_KEYS.map((key) => {
      const page = readRecord(submittedPages[key]);
      const intro = readRecord(page.intro);
      const listing = readRecord(page.listing);
      const feature = readRecord(page.feature);
      const fallback = DEFAULT_YASHIE_PAGE_CONTENT[key];
      const readPageString = (
        value: unknown,
        field: string,
        fallbackValue: string,
      ) =>
        readRequiredString(
          value ?? fallbackValue,
          errors,
          `pages.${key}.${field}`,
          "Add text for this section.",
        );

      return [
        key,
        {
          feature: {
            description: readPageString(
              feature.description,
              "feature.description",
              fallback.feature.description,
            ),
            label: readPageString(
              feature.label,
              "feature.label",
              fallback.feature.label,
            ),
            title: readPageString(
              feature.title,
              "feature.title",
              fallback.feature.title,
            ),
          },
          highlightLabel:
            readOptionalString(page.highlightLabel) || fallback.highlightLabel,
          highlights: Array.isArray(page.highlights)
            ? page.highlights
                .filter((item): item is string => typeof item === "string")
                .map((item) => item.trim())
                .filter(Boolean)
            : fallback.highlights,
          intro: {
            description: readPageString(
              intro.description,
              "intro.description",
              fallback.intro.description,
            ),
            title: readPageString(
              intro.title,
              "intro.title",
              fallback.intro.title,
            ),
          },
          listing: {
            description: readPageString(
              listing.description,
              "listing.description",
              fallback.listing.description,
            ),
            label: readPageString(
              listing.label,
              "listing.label",
              fallback.listing.label,
            ),
            title: readPageString(
              listing.title,
              "listing.title",
              fallback.listing.title,
            ),
          },
        },
      ];
    }),
  ) as YashiePageContent;

  return Object.keys(errors).length > 0
    ? { errors, input: null }
    : {
        errors,
        input: {
          navigation: parsedNavigation,
          pages: parsedPages,
          profile: parsedProfile,
          socials: parsedSocials,
        },
      };
}

async function ensureCollection(
  client: SettingsClient,
  workspaceId: string,
  studio: YashieAdminStudioPayload,
  collectionSlug: string,
) {
  const existing = findCollection(studio, collectionSlug);
  if (existing) return existing;

  const schema = getYashieManifestCollectionSchema(collectionSlug);
  await client.createCollection(workspaceId, {
    collection_type: schema?.collection_type ?? collectionSlug,
    config: {},
    description: schema?.description ?? null,
    slug: collectionSlug,
    title: schema?.title ?? collectionSlug,
  });

  const nextStudio = (await client.getStudio(
    workspaceId,
  )) as YashieAdminStudioPayload;
  const created = findCollection(nextStudio, collectionSlug);

  if (!created) {
    throw new Error("This website area is not ready yet.");
  }

  return created;
}

async function ensureSiteSettingsCollections({
  client,
  studio,
  workspaceId,
}: {
  client: SettingsClient;
  studio: YashieAdminStudioPayload;
  workspaceId: string;
}) {
  let nextStudio = studio;
  const requiredSlugs = [
    PROFILE_COLLECTION_SLUG,
    SOCIAL_LINKS_COLLECTION_SLUG,
    NAVIGATION_COLLECTION_SLUG,
  ];
  const missingSlugs = requiredSlugs.filter(
    (slug) => !findCollection(studio, slug),
  );

  for (const collectionSlug of missingSlugs) {
    const schema = getYashieManifestCollectionSchema(collectionSlug);
    await client.createCollection(workspaceId, {
      collection_type: schema?.collection_type ?? collectionSlug,
      config: {},
      description: schema?.description ?? null,
      slug: collectionSlug,
      title: schema?.title ?? collectionSlug,
    });
  }

  if (missingSlugs.length > 0) {
    nextStudio = (await client.getStudio(
      workspaceId,
    )) as YashieAdminStudioPayload;
  }

  const profile = findCollection(nextStudio, PROFILE_COLLECTION_SLUG);
  const socialsCollection = findCollection(
    nextStudio,
    SOCIAL_LINKS_COLLECTION_SLUG,
  );
  const navigation = findCollection(nextStudio, NAVIGATION_COLLECTION_SLUG);

  if (!profile || !socialsCollection || !navigation) {
    throw new Error("This website area is not ready yet.");
  }

  return {
    collections: {
      navigation,
      profile,
      socials: socialsCollection,
    },
    studio: nextStudio,
  };
}

function readCollectionId(collection: StudioRecord) {
  const id = readString(collection, "id");

  if (!id) {
    throw new Error("This website area is not ready yet.");
  }

  return id;
}

function buildProfileEntryPayload(
  input: YashieAdminSiteSettingsInput["profile"],
  pages: YashieAdminSiteSettingsInput["pages"],
  collectionId: string,
): SiteSettingsEntryPayload {
  return {
    collection_id: collectionId,
    metadata: {},
    profile_data: {
      alias: input.alias,
      brand: input.brand,
      email: input.email,
      location: input.location,
      pageContent: pages,
      profileFacts: (input.profileFacts ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      quote: input.quote ?? author.quote,
      shortName: input.shortName,
      title: input.title,
    },
    slug: PROFILE_ENTRY_SLUG,
    status: input.status,
    subtitle: input.title,
    summary: input.summary,
    title: input.name,
  };
}

function buildSocialEntryPayload(
  social: YashieAdminSiteSettingsInput["socials"][number],
  index: number,
  collectionId: string,
): SiteSettingsEntryPayload {
  const slug = slugifySocialLink(social.label, `${social.platform}-${index}`);
  const sortOrder = social.sortOrder ?? index;

  return {
    collection_id: collectionId,
    metadata: {},
    profile_data: {
      handle: social.handle,
      href: social.href,
      platform: social.platform,
      sortOrder,
    },
    slug,
    status: social.status,
    subtitle: social.platform,
    summary: social.handle || social.href,
    title: social.label,
  };
}

function buildNavigationEntryPayload(
  navigationItem: YashieAdminSiteSettingsInput["navigation"][number],
  collectionId: string,
): SiteSettingsEntryPayload | null {
  const tab = navigationTabs.find((item) => item.key === navigationItem.key);
  if (!tab) return null;

  return {
    collection_id: collectionId,
    metadata: {},
    profile_data: {
      href: tab.href,
      key: navigationItem.key,
      sortOrder: tab.sortOrder,
      visible: navigationItem.visible,
    },
    slug: navigationItem.key,
    status: "published",
    subtitle: tab.href,
    summary: navigationItem.visible
      ? "Visible on the site"
      : "Hidden from the site",
    title: navigationItem.label,
  };
}

async function saveProfileSettings({
  client,
  input,
  pages,
  studio,
  workspaceId,
}: {
  client: SettingsClient;
  input: YashieAdminSiteSettingsInput["profile"];
  pages: YashieAdminSiteSettingsInput["pages"];
  studio: YashieAdminStudioPayload;
  workspaceId: string;
}) {
  const collection = await ensureCollection(
    client,
    workspaceId,
    studio,
    PROFILE_COLLECTION_SLUG,
  );
  const current = findEntryBySlug(
    studio,
    PROFILE_COLLECTION_SLUG,
    PROFILE_ENTRY_SLUG,
  );
  const payload = {
    collection_id: String(collection.id),
    metadata: {},
    profile_data: {
      alias: input.alias,
      brand: input.brand,
      email: input.email,
      location: input.location,
      pageContent: pages,
      profileFacts: (input.profileFacts ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      quote: input.quote ?? author.quote,
      shortName: input.shortName,
      title: input.title,
    },
    slug: PROFILE_ENTRY_SLUG,
    status: input.status,
    subtitle: input.title,
    summary: input.summary,
    title: input.name,
  };

  if (current) {
    await client.updateEntry(workspaceId, String(current.id), payload);
    return;
  }

  await client.createEntry(workspaceId, payload);
}

async function saveSocialSettings({
  client,
  input,
  studio,
  workspaceId,
}: {
  client: SettingsClient;
  input: YashieAdminSiteSettingsInput["socials"];
  studio: YashieAdminStudioPayload;
  workspaceId: string;
}) {
  const collection = await ensureCollection(
    client,
    workspaceId,
    studio,
    SOCIAL_LINKS_COLLECTION_SLUG,
  );
  const existingEntries = findEntriesByCollection(
    studio,
    SOCIAL_LINKS_COLLECTION_SLUG,
  );
  const retainedEntryIds = new Set<string>();

  for (const [index, social] of input.entries()) {
    const slug = slugifySocialLink(social.label, `${social.platform}-${index}`);
    const current =
      (social.id
        ? existingEntries.find((entry) => String(entry.id) === social.id)
        : null) ??
      existingEntries.find((entry) => readString(entry, "slug") === slug) ??
      null;
    const sortOrder = social.sortOrder ?? index;
    const payload = {
      collection_id: String(collection.id),
      metadata: {},
      profile_data: {
        handle: social.handle,
        href: social.href,
        platform: social.platform,
        sortOrder,
      },
      slug,
      status: social.status,
      subtitle: social.platform,
      summary: social.handle || social.href,
      title: social.label,
    };

    if (current) {
      const entryId = String(current.id);
      retainedEntryIds.add(entryId);
      await client.updateEntry(workspaceId, entryId, payload);
      continue;
    }

    const created = await client.createEntry(workspaceId, payload);
    const createdRecord = readRecord(created);
    const createdId =
      readString(createdRecord, "id") ??
      readString(readRecord(createdRecord.entry), "id");

    if (createdId) {
      retainedEntryIds.add(createdId);
    }
  }

  for (const entry of existingEntries) {
    const entryId = String(entry.id);

    if (!retainedEntryIds.has(entryId)) {
      await client.deleteEntry(workspaceId, entryId);
    }
  }
}

async function saveNavigationSettings({
  client,
  input,
  studio,
  workspaceId,
}: {
  client: SettingsClient;
  input: YashieAdminSiteSettingsInput["navigation"];
  studio: YashieAdminStudioPayload;
  workspaceId: string;
}) {
  const collection = await ensureCollection(
    client,
    workspaceId,
    studio,
    NAVIGATION_COLLECTION_SLUG,
  );
  const existingEntries = findEntriesByCollection(
    studio,
    NAVIGATION_COLLECTION_SLUG,
  );

  for (const navigationItem of input) {
    const tab = navigationTabs.find((item) => item.key === navigationItem.key);
    if (!tab) continue;

    const current =
      existingEntries.find((entry) => {
        const profileData = readRecord(entry.profile_data ?? entry.profileData);
        return (
          readString(profileData, "key") === navigationItem.key ||
          readString(entry, "slug") === navigationItem.key
        );
      }) ?? null;
    const payload = {
      collection_id: String(collection.id),
      metadata: {},
      profile_data: {
        href: tab.href,
        key: navigationItem.key,
        sortOrder: tab.sortOrder,
        visible: navigationItem.visible,
      },
      slug: navigationItem.key,
      status: "published" as const,
      subtitle: tab.href,
      summary: navigationItem.visible
        ? "Visible on the site"
        : "Hidden from the site",
      title: navigationItem.label,
    };

    if (current) {
      await client.updateEntry(workspaceId, String(current.id), payload);
      continue;
    }

    await client.createEntry(workspaceId, payload);
  }
}

function buildSiteSettingsBatchOperations({
  collections,
  input,
  studio,
}: {
  collections: {
    navigation: StudioRecord;
    profile: StudioRecord;
    socials: StudioRecord;
  };
  input: YashieAdminSiteSettingsInput;
  studio: YashieAdminStudioPayload;
}) {
  const operations: EntryBatchOperation[] = [];
  const profileCollectionId = readCollectionId(collections.profile);
  const socialsCollectionId = readCollectionId(collections.socials);
  const navigationCollectionId = readCollectionId(collections.navigation);
  const currentProfile = findEntryBySlug(
    studio,
    PROFILE_COLLECTION_SLUG,
    PROFILE_ENTRY_SLUG,
  );
  const profilePayload = buildProfileEntryPayload(
    input.profile,
    input.pages,
    profileCollectionId,
  );

  operations.push(
    currentProfile
      ? {
          action: "update",
          clientOperationId: "profile",
          entryId: String(currentProfile.id),
          payload: profilePayload,
        }
      : {
          action: "create",
          clientOperationId: "profile",
          payload: profilePayload,
        },
  );

  const existingSocialEntries = findEntriesByCollection(
    studio,
    SOCIAL_LINKS_COLLECTION_SLUG,
  );
  const retainedSocialEntryIds = new Set<string>();

  for (const [index, social] of input.socials.entries()) {
    const payload = buildSocialEntryPayload(social, index, socialsCollectionId);
    const current =
      (social.id
        ? existingSocialEntries.find((entry) => String(entry.id) === social.id)
        : null) ??
      existingSocialEntries.find(
        (entry) => readString(entry, "slug") === payload.slug,
      ) ??
      null;
    const clientOperationId = `social:${index}:${payload.slug}`;

    if (current) {
      const entryId = String(current.id);
      retainedSocialEntryIds.add(entryId);
      operations.push({
        action: "update",
        clientOperationId,
        entryId,
        payload,
      });
      continue;
    }

    operations.push({
      action: "create",
      clientOperationId,
      payload,
    });
  }

  for (const entry of existingSocialEntries) {
    const entryId = String(entry.id);

    if (!retainedSocialEntryIds.has(entryId)) {
      operations.push({
        action: "delete",
        clientOperationId: `social:delete:${entryId}`,
        entryId,
      });
    }
  }

  const existingNavigationEntries = findEntriesByCollection(
    studio,
    NAVIGATION_COLLECTION_SLUG,
  );

  for (const navigationItem of input.navigation) {
    const payload = buildNavigationEntryPayload(
      navigationItem,
      navigationCollectionId,
    );
    if (!payload) continue;

    const current =
      existingNavigationEntries.find((entry) => {
        const profileData = readRecord(entry.profile_data ?? entry.profileData);
        return (
          readString(profileData, "key") === navigationItem.key ||
          readString(entry, "slug") === navigationItem.key
        );
      }) ?? null;

    operations.push(
      current
        ? {
            action: "update",
            clientOperationId: `navigation:${navigationItem.key}`,
            entryId: String(current.id),
            payload,
          }
        : {
            action: "create",
            clientOperationId: `navigation:${navigationItem.key}`,
            payload,
          },
    );
  }

  return operations;
}

function readBatchError(response: Response) {
  return response
    .json()
    .then((data: { error?: unknown } | null) =>
      typeof data?.error === "string" && data.error.trim()
        ? data.error
        : `Yashie settings save failed with status ${response.status}`,
    )
    .catch(() => `Yashie settings save failed with status ${response.status}`);
}

async function postEntryBatch({
  accessToken,
  operations,
  workspaceId,
}: {
  accessToken: string;
  operations: EntryBatchOperation[];
  workspaceId: string;
}) {
  const apiBaseUrl = getYashieApiBaseUrl().replace(/\/+$/, "");
  const response = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/entries/batch`,
    {
      body: JSON.stringify({ operations }),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (response.status === 404 || response.status === 405) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await readBatchError(response));
  }

  const payload = (await response
    .json()
    .catch(() => null)) as EntryBatchResult | null;

  if (!payload || !Array.isArray(payload.results)) {
    throw new Error("Yashie settings save returned an invalid response.");
  }

  return payload;
}

function mergeBatchResultsIntoStudio(
  studio: YashieAdminStudioPayload,
  results: EntryBatchOperationResult[],
): YashieAdminStudioPayload {
  let entries = [...studio.entries];

  for (const result of results) {
    if (!result.ok) {
      throw new Error(result.error || "Yashie settings save failed.");
    }

    if (result.action === "delete") {
      entries = entries.filter((entry) => String(entry.id) !== result.entryId);
      continue;
    }

    const entry = readRecord(result.entry);
    const entryId = readString(entry, "id");

    if (!entryId) {
      throw new Error("Yashie settings save returned an invalid entry.");
    }

    const existingIndex = entries.findIndex(
      (item) => String(item.id) === entryId,
    );

    if (existingIndex >= 0) {
      entries = entries.map((item, index) =>
        index === existingIndex ? entry : item,
      );
      continue;
    }

    entries = [...entries, entry];
  }

  return {
    ...studio,
    entries,
  };
}

async function trySaveSiteSettingsBatch({
  accessToken,
  client,
  input,
  studio,
  workspaceId,
}: {
  accessToken: string;
  client: SettingsClient;
  input: YashieAdminSiteSettingsInput;
  studio: YashieAdminStudioPayload;
  workspaceId: string;
}) {
  const ensured = await ensureSiteSettingsCollections({
    client,
    studio,
    workspaceId,
  });
  const operations = buildSiteSettingsBatchOperations({
    collections: ensured.collections,
    input,
    studio: ensured.studio,
  });
  const batch = await postEntryBatch({
    accessToken,
    operations,
    workspaceId,
  });

  if (!batch) {
    return {
      fallbackStudio: ensured.studio,
      settings: null,
    };
  }

  return {
    fallbackStudio: null,
    settings: readYashieAdminSiteSettings(
      mergeBatchResultsIntoStudio(ensured.studio, batch.results),
    ),
  };
}

async function saveSiteSettingsSerially({
  client,
  input,
  studio,
  workspaceId,
}: {
  client: SettingsClient;
  input: YashieAdminSiteSettingsInput;
  studio: YashieAdminStudioPayload;
  workspaceId: string;
}) {
  await saveProfileSettings({
    client,
    input: input.profile,
    pages: input.pages,
    studio,
    workspaceId,
  });
  const nextStudio = (await client.getStudio(
    workspaceId,
  )) as YashieAdminStudioPayload;
  await saveSocialSettings({
    client,
    input: input.socials,
    studio: nextStudio,
    workspaceId,
  });

  const navigationStudio = (await client.getStudio(
    workspaceId,
  )) as YashieAdminStudioPayload;
  await saveNavigationSettings({
    client,
    input: input.navigation,
    studio: navigationStudio,
    workspaceId,
  });

  return client.getStudio(workspaceId) as Promise<YashieAdminStudioPayload>;
}

export async function updateYashieAdminSiteSettings(
  accessToken: string,
  input: YashieAdminSiteSettingsInput,
) {
  const workspaceId = getYashieWorkspaceId();
  const client = createYashieExternalProjectsClient(accessToken);
  const studio = (await client.getStudio(
    workspaceId,
  )) as YashieAdminStudioPayload;
  const batchResult = await trySaveSiteSettingsBatch({
    accessToken,
    client,
    input,
    studio,
    workspaceId,
  });

  if (batchResult.settings) {
    revalidateYashieContent();
    return batchResult.settings;
  }

  const finalStudio = await saveSiteSettingsSerially({
    client,
    input,
    studio: batchResult.fallbackStudio ?? studio,
    workspaceId,
  });
  revalidateYashieContent();
  return readYashieAdminSiteSettings(finalStudio);
}
