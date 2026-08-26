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
      collection_type: "navigation-tabs",
      id: "collection-navigation",
      slug: "navigation-tabs",
      title: "Navigation",
    },
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
        pageContent: {
          shop: {
            intro: {
              description: "Published shop introduction.",
              title: "Published shop",
            },
          },
        },
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
      collection_id: "collection-navigation",
      id: "navigation-gallery",
      profile_data: {
        key: "gallery",
        sortOrder: 1,
        visible: false,
      },
      slug: "gallery",
      status: "published",
      subtitle: "/gallery",
      summary: "Hidden from the site",
      title: "Artwork",
    },
    {
      collection_id: "collection-socials",
      id: "social-instagram",
      profile_data: {
        handle: "@published",
        href: "https://example.com/instagram",
        platform: "instagram",
        sortOrder: 4,
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
        navigation: expect.arrayContaining([
          expect.objectContaining({
            entryId: "navigation-gallery",
            key: "gallery",
            label: "Artwork",
            visible: false,
          }),
        ]),
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
        pages: expect.objectContaining({
          shop: expect.objectContaining({
            intro: {
              description: "Published shop introduction.",
              title: "Published shop",
            },
          }),
        }),
        socials: [
          expect.objectContaining({
            handle: "@published",
            href: "https://example.com/instagram",
            id: "social-instagram",
            platform: "instagram",
            sortOrder: 4,
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
    expect(settings.navigation[0]).toEqual(
      expect.objectContaining({
        href: "/",
        key: "home",
        label: "Home",
        visible: true,
      }),
    );
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
      navigation: [
        {
          key: "gallery",
          label: "Artwork",
          visible: false,
        },
      ],
      socials: [
        {
          handle: "@published",
          href: "https://example.com/instagram",
          label: "Instagram",
          platform: "instagram",
          sortOrder: 0,
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
        navigation: expect.arrayContaining([
          expect.objectContaining({
            key: "gallery",
            label: "Artwork",
            visible: false,
          }),
        ]),
      }),
    );
  });

  test("accepts arbitrary visitor links with optional handles", () => {
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
      navigation: [],
      socials: [
        {
          handle: "",
          href: "https://example.com",
          id: "social-website",
          label: "Website",
          platform: "website",
          sortOrder: 2,
          status: "archived",
        },
      ],
    });

    expect(result.errors).toEqual({});
    expect(result.input?.socials[0]).toEqual(
      expect.objectContaining({
        handle: "",
        href: "https://example.com",
        id: "social-website",
        label: "Website",
        platform: "website",
        sortOrder: 2,
        status: "archived",
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
      navigation: [
        {
          key: "gallery",
          label: "",
          visible: true,
        },
      ],
      socials: [
        {
          handle: "@published",
          href: "example.com/instagram",
          label: "Instagram",
          platform: "invalid",
          status: "hidden",
        },
      ],
    });

    expect(result.input).toBeNull();
    expect(result.errors).toEqual({
      "profile.alias": "Add a public handle.",
      "profile.email": "Use a valid email address.",
      "navigation.1.label": "Add a tab name.",
      "socials.0.href": "Use a full http or https link.",
      "socials.0.platform": "Choose a valid platform.",
      "socials.0.status": "Choose a valid visibility option.",
    });
  });
});
