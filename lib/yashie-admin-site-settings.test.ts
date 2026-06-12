import { describe, expect, test } from "bun:test";
import type { YashieAdminStudioPayload } from "./yashie-admin-content-model";
import {
  parseYashieSiteSettingsPayload,
  readYashieAdminSiteSettings,
} from "./yashie-admin-site-settings";

const studio = {
  assets: [],
  blocks: [],
  collections: [
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
      profile_data: {
        alias: "@published",
        brand: "Published Brand",
        email: "published@example.com",
        shortName: "Published",
        title: "Published Writer",
      },
      slug: "profile",
      status: "published",
      subtitle: "Published Writer",
      summary: "Published intro.",
      title: "Published Name",
    },
    {
      collection_id: "collection-socials",
      id: "social-instagram",
      profile_data: {
        handle: "@published",
        href: "https://example.com/instagram",
        platform: "instagram",
      },
      slug: "instagram",
      status: "published",
      subtitle: "instagram",
      summary: "@published",
      title: "Instagram",
    },
  ],
} satisfies YashieAdminStudioPayload;

describe("Yashie admin site settings", () => {
  test("reads profile and social links for the editor", () => {
    expect(readYashieAdminSiteSettings(studio)).toEqual(
      expect.objectContaining({
        profile: expect.objectContaining({
          alias: "@published",
          brand: "Published Brand",
          email: "published@example.com",
          entryId: "profile-1",
          name: "Published Name",
          shortName: "Published",
          summary: "Published intro.",
          title: "Published Writer",
        }),
        socials: [
          expect.objectContaining({
            handle: "@published",
            href: "https://example.com/instagram",
            id: "social-instagram",
            platform: "instagram",
          }),
        ],
      }),
    );
  });

  test("falls back to verified static values before first sync", () => {
    const settings = readYashieAdminSiteSettings({
      assets: [],
      blocks: [],
      collections: [],
      entries: [],
    });

    expect(settings.profile.alias).toBe("@inkedbyyashie");
    expect(settings.profile.email).toBe("yashodauitwaru.pa@gmail.com");
    expect(settings.socials[0]).toEqual(
      expect.objectContaining({
        handle: "@inkedbyyashie",
        href: "https://www.instagram.com/inkedbyyashie",
        platform: "instagram",
      }),
    );
  });

  test("validates saved handles and links", () => {
    const result = parseYashieSiteSettingsPayload({
      profile: {
        alias: "@published",
        brand: "Published Brand",
        email: "published@example.com",
        name: "Published Name",
        shortName: "Published",
        status: "published",
        title: "Published Writer",
      },
      socials: [
        {
          handle: "@published",
          href: "https://example.com/instagram",
          label: "Instagram",
          platform: "instagram",
          status: "published",
        },
      ],
    });

    expect(result.errors).toEqual({});
    expect(result.input).toEqual(
      expect.objectContaining({
        profile: expect.objectContaining({
          alias: "@published",
          email: "published@example.com",
        }),
      }),
    );
  });

  test("returns friendly errors for invalid settings", () => {
    const result = parseYashieSiteSettingsPayload({
      profile: {
        alias: "",
        brand: "Published Brand",
        email: "not-an-email",
        name: "Published Name",
        shortName: "Published",
        title: "Published Writer",
      },
      socials: [
        {
          handle: "@published",
          href: "example.com/instagram",
          label: "Instagram",
          platform: "instagram",
          status: "published",
        },
      ],
    });

    expect(result.input).toBeNull();
    expect(result.errors).toEqual({
      "profile.alias": "Add a public handle.",
      "profile.email": "Use a valid email address.",
      "socials.0.href": "Use a full http or https link.",
    });
  });
});
