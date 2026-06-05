import { describe, expect, test } from "bun:test";
import {
  parseYashieContentFormData,
  readYashieAdminContent,
  type YashieAdminStudioPayload,
} from "./yashie-admin-content-model";

const studio = {
  assets: [
    {
      assetUrl: "https://cdn.example.com/blog.jpg",
      asset_type: "image",
      entry_id: "blog-1",
      id: "asset-blog-1",
      metadata: { filename: "blog.jpg" },
      sort_order: 0,
      storage_path: "external-projects/yashie/blog-posts/first-post/blog.jpg",
      alt_text: "A glowing journal page",
    },
    {
      asset_url: "https://cdn.example.com/gallery.jpg",
      asset_type: "image",
      entry_id: "gallery-1",
      id: "asset-gallery-1",
      sort_order: 0,
      alt_text: "A framed fantasy portrait",
    },
  ],
  blocks: [
    {
      block_type: "markdown",
      content: { markdown: "The full blog body." },
      entry_id: "blog-1",
      id: "block-blog-1",
      sort_order: 0,
      title: "Body",
    },
  ],
  collections: [
    {
      collection_type: "blog-posts",
      id: "collection-blog",
      slug: "blog-posts",
      title: "Blog Posts",
    },
    {
      collection_type: "gallery",
      id: "collection-gallery",
      slug: "gallery",
      title: "Gallery",
    },
    {
      collection_type: "shop-products",
      id: "collection-shop",
      slug: "shop-products",
      title: "Shop Products",
    },
  ],
  entries: [
    {
      collection_id: "collection-blog",
      id: "blog-1",
      profile_data: {
        category: "Reflection",
        date: "June 5, 2026",
        imagePosition: "center 20%",
        readTime: "4 min",
      },
      slug: "first-post",
      status: "published",
      subtitle: "Reflection",
      summary: "A short public intro.",
      title: "First Post",
    },
    {
      collection_id: "collection-gallery",
      id: "gallery-1",
      profile_data: { type: "Character Art" },
      slug: "violet-portrait",
      status: "draft",
      subtitle: "Character Art",
      summary: "A draft gallery note.",
      title: "Violet Portrait",
    },
    {
      collection_id: "collection-shop",
      id: "shop-1",
      profile_data: { price: "$28" },
      slug: "signed-book",
      status: "archived",
      subtitle: "$28",
      summary: "A signed keepsake.",
      title: "Signed Book",
    },
  ],
} satisfies YashieAdminStudioPayload;

describe("Yashie admin content model", () => {
  test("normalizes blog, gallery, and shop items for the editor", () => {
    expect(readYashieAdminContent(studio, "blog")).toEqual([
      expect.objectContaining({
        body: "The full blog body.",
        category: "Reflection",
        date: "June 5, 2026",
        id: "blog-1",
        imageAlt: "A glowing journal page",
        imageAssetId: "asset-blog-1",
        imagePosition: "center 20%",
        imageUrl: "https://cdn.example.com/blog.jpg",
        readTime: "4 min",
        slug: "first-post",
        status: "published",
        summary: "A short public intro.",
        title: "First Post",
      }),
    ]);

    expect(readYashieAdminContent(studio, "gallery")).toEqual([
      expect.objectContaining({
        id: "gallery-1",
        imageAlt: "A framed fantasy portrait",
        status: "draft",
        title: "Violet Portrait",
        type: "Character Art",
      }),
    ]);

    expect(readYashieAdminContent(studio, "shop")).toEqual([
      expect.objectContaining({
        id: "shop-1",
        price: "$28",
        status: "archived",
        title: "Signed Book",
      }),
    ]);
  });

  test("parses a valid blog form payload", () => {
    const formData = new FormData();
    formData.set("title", "A New Chapter");
    formData.set("slug", "A New Chapter");
    formData.set("status", "published");
    formData.set("summary", "A reader-facing intro.");
    formData.set("body", "Longer post body.");
    formData.set("category", "Essay");
    formData.set("date", "June 5, 2026");
    formData.set("readTime", "6 min");
    formData.set("imageAlt", "A desk with a journal");
    formData.set("imagePosition", "center 30%");
    formData.set("imageFile", new File(["image"], "cover.png", { type: "image/png" }));

    const result = parseYashieContentFormData("blog", formData);

    expect(result.errors).toEqual({});
    expect(result.input).toEqual(
      expect.objectContaining({
        body: "Longer post body.",
        category: "Essay",
        imageFile: expect.any(File),
        slug: "a-new-chapter",
        status: "published",
        title: "A New Chapter",
      }),
    );
  });

  test("returns friendly field errors for invalid form payloads", () => {
    const formData = new FormData();
    formData.set("status", "hidden");
    formData.set("imageFile", new File(["not image"], "notes.txt", { type: "text/plain" }));

    const result = parseYashieContentFormData("shop", formData);

    expect(result.input).toBeNull();
    expect(result.errors).toEqual({
      imageFile: "Choose an image file.",
      status: "Choose a valid visibility option.",
      title: "Add a title.",
    });
  });
});
