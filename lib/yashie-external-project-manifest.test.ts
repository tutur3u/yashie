import { describe, expect, test } from "bun:test";
import { yashieExternalProjectManifest } from "./yashie-external-project-manifest";

describe("Yashie external project manifest", () => {
  test("seeds verified profile and social link data for sync", () => {
    const entries = yashieExternalProjectManifest.content.entries;
    const profile = entries.find(
      (entry) => entry.collectionSlug === "profile" && entry.slug === "profile",
    );
    const socialLinks = entries.filter(
      (entry) => entry.collectionSlug === "social-links",
    );
    const categories = entries.filter(
      (entry) => entry.collectionSlug === "categories",
    );

    expect(profile?.profileData).toEqual(
      expect.objectContaining({
        alias: "@inkedbyyashie",
        email: "yashodauitwaru.pa@gmail.com",
      }),
    );
    expect(socialLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          profileData: expect.objectContaining({
            handle: "@inkedbyyashie",
            href: "https://www.instagram.com/inkedbyyashie",
            platform: "instagram",
            sortOrder: 0,
          }),
        }),
        expect.objectContaining({
          profileData: expect.objectContaining({
            handle: "@inkedbyyashie.bsky.social",
            href: "https://bsky.app/profile/inkedbyyashie.bsky.social",
            platform: "bluesky",
          }),
        }),
      ]),
    );
    expect(categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          profileData: expect.objectContaining({ group: "blog" }),
          title: "Essay",
        }),
        expect.objectContaining({
          profileData: expect.objectContaining({ group: "worlds" }),
          title: "Poetry",
        }),
      ]),
    );
    expect(yashieExternalProjectManifest.schema.collections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection_type: "categories",
          slug: "categories",
        }),
        expect.objectContaining({
          collection_type: "navigation-tabs",
          profileFields: expect.arrayContaining([
            expect.objectContaining({
              key: "visible",
              type: "boolean",
            }),
          ]),
          slug: "navigation-tabs",
        }),
        expect.objectContaining({
          collection_type: "social-links",
          profileFields: expect.arrayContaining([
            expect.objectContaining({
              key: "platform",
              options: expect.arrayContaining(["website", "newsletter", "other"]),
            }),
            expect.objectContaining({
              key: "sortOrder",
              type: "number",
            }),
          ]),
          slug: "social-links",
        }),
      ]),
    );
  });

  test("keeps editor-managed image positions in the synchronized schema", () => {
    const imageCollections = [
      "blog-posts",
      "gallery",
      "shop-products",
      "writing-worlds",
    ];

    for (const collectionSlug of imageCollections) {
      const collection = yashieExternalProjectManifest.schema.collections.find(
        (candidate) => candidate.slug === collectionSlug,
      );

      expect(collection?.profileFields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: "imagePosition",
            type: "string",
          }),
        ]),
      );
    }
  });
});
