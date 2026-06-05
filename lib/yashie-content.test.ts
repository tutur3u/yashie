import { describe, expect, test } from "bun:test";
import { blogPosts, galleryItems, products } from "@/app/data/portfolio";
import { buildYashieContent, DEFAULT_YASHIE_CONTENT } from "./yashie-content";

describe("Yashie public content", () => {
  test("uses published delivery content for blog, gallery, and shop pages", () => {
    const content = buildYashieContent(
      {
        adapter: "yashie",
        canonicalProjectId: "yashie",
        generatedAt: new Date("2026-06-05").toISOString(),
        loadingData: null,
        profileData: {},
        workspaceId: "workspace-1",
        collections: [
          {
            collection_type: "blog-posts",
            config: null,
            description: null,
            id: "collection-blog",
            slug: "blog-posts",
            title: "Blog Posts",
            entries: [
              {
                assets: [
                  {
                    alt_text: "A journal beside a candle",
                    assetUrl: "/storage/blog.jpg",
                    asset_type: "image",
                    block_id: null,
                    entry_id: "blog-1",
                    id: "asset-blog-1",
                    metadata: {},
                    sort_order: 0,
                    source_url: null,
                    storage_path: null,
                  },
                ],
                blocks: [
                  {
                    block_type: "markdown",
                    content: { markdown: "Full published post." },
                    entry_id: "blog-1",
                    id: "block-blog-1",
                    sort_order: 0,
                    title: "Body",
                  },
                ],
                id: "blog-1",
                metadata: {},
                profile_data: {
                  category: "Essay",
                  date: "June 5, 2026",
                  readTime: "5 min",
                },
                published_at: null,
                slug: "published-blog",
                status: "published",
                subtitle: "Essay",
                summary: "Published summary.",
                title: "Published Blog",
              },
            ],
          },
          {
            collection_type: "gallery",
            config: null,
            description: null,
            id: "collection-gallery",
            slug: "gallery",
            title: "Gallery",
            entries: [
              {
                assets: [],
                blocks: [],
                id: "gallery-1",
                metadata: {},
                profile_data: { type: "Story Art" },
                published_at: null,
                slug: "published-gallery",
                status: "published",
                subtitle: "Story Art",
                summary: "Published gallery piece.",
                title: "Published Gallery",
              },
            ],
          },
          {
            collection_type: "shop-products",
            config: null,
            description: null,
            id: "collection-shop",
            slug: "shop-products",
            title: "Shop",
            entries: [
              {
                assets: [],
                blocks: [],
                id: "shop-1",
                metadata: {},
                profile_data: { price: "$40" },
                published_at: null,
                slug: "published-shop",
                status: "published",
                subtitle: "$40",
                summary: "Published shop item.",
                title: "Published Shop",
              },
            ],
          },
        ],
      },
      { apiBaseUrl: "https://platform.example.com/api/v1" },
    );

    expect(content.blogPosts[0]).toEqual(
      expect.objectContaining({
        body: "Full published post.",
        category: "Essay",
        image: "https://platform.example.com/storage/blog.jpg",
        imageAlt: "A journal beside a candle",
        slug: "published-blog",
        title: "Published Blog",
      }),
    );
    expect(content.galleryItems[0]).toEqual(
      expect.objectContaining({
        slug: "published-gallery",
        title: "Published Gallery",
        type: "Story Art",
      }),
    );
    expect(content.products[0]).toEqual(
      expect.objectContaining({
        price: "$40",
        slug: "published-shop",
        title: "Published Shop",
      }),
    );
  });

  test("falls back to static content when delivery is unavailable", () => {
    expect(buildYashieContent(null, { apiBaseUrl: "https://platform.example.com/api/v1" })).toBe(
      DEFAULT_YASHIE_CONTENT,
    );
    expect(DEFAULT_YASHIE_CONTENT.blogPosts).toBe(blogPosts);
    expect(DEFAULT_YASHIE_CONTENT.galleryItems).toBe(galleryItems);
    expect(DEFAULT_YASHIE_CONTENT.products).toBe(products);
  });
});
