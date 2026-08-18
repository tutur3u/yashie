import { describe, expect, test } from "bun:test";
import { yashieExternalProjectManifest } from "./yashie-external-project-manifest";

describe("Yashie external project manifest", () => {
  test("defines the editable schema without seeding content", () => {
    const entries = yashieExternalProjectManifest.content.entries;
    expect(entries).toEqual([]);
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
