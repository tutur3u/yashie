import type { ExternalProjectsClient } from "tuturuuu/external-projects";
import {
  author,
  socials,
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
import { getYashieWorkspaceId } from "./yashie-config";
import { getYashieManifestCollectionSchema } from "./yashie-external-project-manifest";

const PROFILE_COLLECTION_SLUG = "profile";
const PROFILE_ENTRY_SLUG = "profile";
const SOCIAL_LINKS_COLLECTION_SLUG = "social-links";
const VALID_SOCIAL_PLATFORMS = new Set<SocialPlatform>([
  "instagram",
  "threads",
  "bluesky",
  "goodreads",
]);
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
  | "getStudio"
  | "publishEntry"
  | "updateEntry"
>;

type StudioRecord = Record<string, unknown>;

export type YashieAdminProfileSettings = {
  alias: string;
  brand: string;
  email: string;
  entryId: string | null;
  location: string;
  name: string;
  shortName: string;
  status: YashieContentStatus;
  summary: string;
  title: string;
};

export type YashieAdminSocialSettings = SocialLink & {
  id: string | null;
  status: YashieContentStatus;
};

export type YashieAdminSiteSettings = {
  profile: YashieAdminProfileSettings;
  socials: YashieAdminSocialSettings[];
};

export type YashieAdminSiteSettingsInput = {
  profile: Omit<YashieAdminProfileSettings, "entryId">;
  socials: Array<Omit<YashieAdminSocialSettings, "id">>;
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

function normalizeStatus(value: unknown): YashieContentStatus {
  return typeof value === "string" && VALID_STATUSES.has(value as YashieContentStatus)
    ? (value as YashieContentStatus)
    : "published";
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
    ? readString(collection, "slug") ?? readString(collection, "collection_type")
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

function socialSort(left: YashieAdminSocialSettings, right: YashieAdminSocialSettings) {
  const leftIndex = socials.findIndex((item) => item.platform === left.platform);
  const rightIndex = socials.findIndex((item) => item.platform === right.platform);
  return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
}

export function readYashieAdminSiteSettings(
  studio: YashieAdminStudioPayload,
): YashieAdminSiteSettings {
  const profileEntry = findEntryBySlug(
    studio,
    PROFILE_COLLECTION_SLUG,
    PROFILE_ENTRY_SLUG,
  );
  const profileData = readRecord(profileEntry?.profile_data ?? profileEntry?.profileData);

  const deliveredSocials = findEntriesByCollection(studio, SOCIAL_LINKS_COLLECTION_SLUG)
    .map<YashieAdminSocialSettings | null>((entry, index) => {
      const entryProfileData = readRecord(entry.profile_data ?? entry.profileData);
      const platform = readString(entryProfileData, "platform");

      if (!platform || !VALID_SOCIAL_PLATFORMS.has(platform as SocialPlatform)) {
        return null;
      }

      const fallback = socialFallback(platform, index);

      return {
        handle: readString(entryProfileData, "handle") ?? fallback.handle,
        href: readString(entryProfileData, "href") ?? fallback.href,
        id: String(entry.id),
        label: readString(entry, "title") ?? fallback.label,
        platform: platform as SocialPlatform,
        status: normalizeStatus(entry.status),
      };
    })
    .filter((item): item is YashieAdminSocialSettings => Boolean(item))
    .sort(socialSort);

  return {
    profile: {
      alias: readString(profileData, "alias") ?? author.alias,
      brand: readString(profileData, "brand") ?? author.brand,
      email: readString(profileData, "email") ?? author.email,
      entryId: profileEntry ? String(profileEntry.id) : null,
      location: readString(profileData, "location") ?? author.location,
      name: readString(profileEntry ?? {}, "title") ?? author.name,
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
  const socialValues = Array.isArray(record.socials) ? record.socials : [];

  const parsedProfile: YashieAdminSiteSettingsInput["profile"] = {
    alias: readRequiredString(profile.alias, errors, "profile.alias", "Add a public handle."),
    brand: readRequiredString(profile.brand, errors, "profile.brand", "Add the brand name."),
    email: readRequiredString(profile.email, errors, "profile.email", "Add an email address."),
    location: readOptionalString(profile.location) || author.location,
    name: readRequiredString(profile.name, errors, "profile.name", "Add the author name."),
    shortName:
      readRequiredString(profile.shortName, errors, "profile.shortName", "Add a short name."),
    status: normalizeStatus(profile.status),
    summary:
      readOptionalString(profile.summary) || author.tagline,
    title: readRequiredString(profile.title, errors, "profile.title", "Add the public title."),
  };

  if (parsedProfile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsedProfile.email)) {
    appendError(errors, "profile.email", "Use a valid email address.");
  }

  const parsedSocials = socialValues.map<YashieAdminSiteSettingsInput["socials"][number]>(
    (item, index) => {
      const social = readRecord(item);
      const fallback = socials[index % socials.length] ?? socials[0]!;
      const platformValue = readRequiredString(
        social.platform,
        errors,
        `socials.${index}.platform`,
        "Choose a social platform.",
      );
      const platform = VALID_SOCIAL_PLATFORMS.has(platformValue as SocialPlatform)
        ? (platformValue as SocialPlatform)
        : fallback.platform;

      if (platformValue && !VALID_SOCIAL_PLATFORMS.has(platformValue as SocialPlatform)) {
        appendError(errors, `socials.${index}.platform`, "Choose a valid platform.");
      }

      const href = readRequiredString(
        social.href,
        errors,
        `socials.${index}.href`,
        "Add a link.",
      );

      if (href && !isHttpUrl(href)) {
        appendError(errors, `socials.${index}.href`, "Use a full http or https link.");
      }

      return {
        handle: readRequiredString(
          social.handle,
          errors,
          `socials.${index}.handle`,
          "Add a handle.",
        ),
        href,
        label:
          readOptionalString(social.label) ||
          socials.find((entry) => entry.platform === platform)?.label ||
          fallback.label,
        platform,
        status: normalizeStatus(social.status),
      };
    },
  );

  if (parsedSocials.length === 0) {
    appendError(errors, "socials", "Add at least one social link.");
  }

  return Object.keys(errors).length > 0
    ? { errors, input: null }
    : {
        errors,
        input: {
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

  const nextStudio = (await client.getStudio(workspaceId)) as YashieAdminStudioPayload;
  const created = findCollection(nextStudio, collectionSlug);

  if (!created) {
    throw new Error("This website area is not ready yet.");
  }

  return created;
}

function readCreatedEntryId(response: unknown) {
  const record = readRecord(response);
  return readString(record, "id") ?? readString(readRecord(record.entry), "id");
}

async function savePublishedEntryStatus(
  client: SettingsClient,
  workspaceId: string,
  entryId: string,
  status: YashieContentStatus,
) {
  if (status === "published") {
    await client.publishEntry(workspaceId, entryId, "publish");
  }
}

async function saveProfileSettings({
  client,
  input,
  studio,
  workspaceId,
}: {
  client: SettingsClient;
  input: YashieAdminSiteSettingsInput["profile"];
  studio: YashieAdminStudioPayload;
  workspaceId: string;
}) {
  const collection = await ensureCollection(
    client,
    workspaceId,
    studio,
    PROFILE_COLLECTION_SLUG,
  );
  const current = findEntryBySlug(studio, PROFILE_COLLECTION_SLUG, PROFILE_ENTRY_SLUG);
  const payload = {
    collection_id: String(collection.id),
    metadata: {},
    profile_data: {
      alias: input.alias,
      brand: input.brand,
      email: input.email,
      location: input.location,
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
    await savePublishedEntryStatus(client, workspaceId, String(current.id), input.status);
    return;
  }

  const created = await client.createEntry(workspaceId, payload);
  const entryId = readCreatedEntryId(created);
  if (entryId) {
    await savePublishedEntryStatus(client, workspaceId, entryId, input.status);
  }
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
  const existingEntries = findEntriesByCollection(studio, SOCIAL_LINKS_COLLECTION_SLUG);

  for (const social of input) {
    const current =
      existingEntries.find((entry) => {
        const profileData = readRecord(entry.profile_data ?? entry.profileData);
        return readString(profileData, "platform") === social.platform;
      }) ?? null;
    const payload = {
      collection_id: String(collection.id),
      metadata: {},
      profile_data: {
        handle: social.handle,
        href: social.href,
        platform: social.platform,
      },
      slug: social.platform,
      status: social.status,
      subtitle: social.platform,
      summary: social.handle,
      title: social.label,
    };

    if (current) {
      await client.updateEntry(workspaceId, String(current.id), payload);
      await savePublishedEntryStatus(client, workspaceId, String(current.id), social.status);
      continue;
    }

    const created = await client.createEntry(workspaceId, payload);
    const entryId = readCreatedEntryId(created);
    if (entryId) {
      await savePublishedEntryStatus(client, workspaceId, entryId, social.status);
    }
  }
}

export async function updateYashieAdminSiteSettings(
  accessToken: string,
  input: YashieAdminSiteSettingsInput,
) {
  const workspaceId = getYashieWorkspaceId();
  const client = createYashieExternalProjectsClient(accessToken);
  const studio = (await client.getStudio(workspaceId)) as YashieAdminStudioPayload;

  await saveProfileSettings({ client, input: input.profile, studio, workspaceId });
  const nextStudio = (await client.getStudio(workspaceId)) as YashieAdminStudioPayload;
  await saveSocialSettings({
    client,
    input: input.socials,
    studio: nextStudio,
    workspaceId,
  });

  const finalStudio = (await client.getStudio(workspaceId)) as YashieAdminStudioPayload;
  revalidateYashieContent();
  return readYashieAdminSiteSettings(finalStudio);
}
