import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { YASHIE_DELIVERY_CACHE_TAG } from "./yashie-cache";
import { DEFAULT_YASHIE_CONTENT, type YashieDeliveryPayload } from "./yashie-content";
import { DEFAULT_YASHIE_PAGE_CONTENT, YASHIE_PAGE_KEYS } from "./yashie-page-content";

const cacheLife = mock(() => undefined);
const cacheTag = mock(() => undefined);
mock.module("next/cache", () => ({ cacheLife, cacheTag }));

const { getUncachedYashieContent } = await import("./yashie-delivery");
const originalFetch = globalThis.fetch;
const originalWorkspace = process.env.TUTURUUU_YASHIE_WORKSPACE_ID;
const originalPublicWorkspace = process.env.NEXT_PUBLIC_TUTURUUU_YASHIE_WORKSPACE_ID;
const originalBase = process.env.TUTURUUU_API_BASE_URL;

function delivery(): YashieDeliveryPayload {
  return {
    adapter: "yashie", canonicalProjectId: "project", generatedAt: "now",
    loadingData: null, profileData: {}, workspaceId: "workspace",
    collections: [{
      collection_type: "profile", config: null, description: null,
      id: "collection", slug: "profile", title: "Profile",
      entries: [{
        assets: [], blocks: [], id: "profile", metadata: {},
        profile_data: { pageContent: structuredClone(DEFAULT_YASHIE_PAGE_CONTENT) },
        published_at: null, slug: "profile", status: "published",
        subtitle: null, summary: null, title: "Author",
      }],
    }],
  };
}

describe("Yashie delivery freshness", () => {
  beforeEach(() => {
    process.env.TUTURUUU_YASHIE_WORKSPACE_ID = "workspace";
    process.env.TUTURUUU_API_BASE_URL = "https://cms.example/api/v1/";
    cacheLife.mockClear(); cacheTag.mockClear();
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries({
      TUTURUUU_YASHIE_WORKSPACE_ID: originalWorkspace,
      NEXT_PUBLIC_TUTURUUU_YASHIE_WORKSPACE_ID: originalPublicWorkspace,
      TUTURUUU_API_BASE_URL: originalBase,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  for (const key of YASHIE_PAGE_KEYS) {
    test(`${key}: refresh does not refill the cache with stale CDN copy`, async () => {
      const saved = delivery();
      const pages = saved.collections[0].entries[0].profile_data.pageContent as typeof DEFAULT_YASHIE_PAGE_CONTENT;
      pages[key] = {
        intro: { title: `${key} title`, description: `${key} intro` },
        feature: { label: `${key} label`, title: `${key} heading`, description: `${key} description` },
        listing: { label: `${key} listing label`, title: `${key} listing title`, description: `${key} listing description` },
        highlightLabel: `${key} saved caption`, highlights: [`${key} first`, `${key} second`],
      };
      const requestedKeys = new Set<string>();
      let latest = delivery();
      globalThis.fetch = mock(async (input: RequestInfo | URL, options?: RequestInit) => {
        const url = new URL(String(input));
        expect(url.pathname).toBe("/api/v1/workspaces/workspace/external-projects/delivery");
        expect(options?.cache).toBe("no-store");
        const freshKey = url.searchParams.get("refresh");
        // Model a CDN holding the pre-save response for reused request URLs.
        const fresh = freshKey && !requestedKeys.has(freshKey);
        if (freshKey) requestedKeys.add(freshKey);
        return Response.json(fresh ? latest : delivery());
      }) as typeof fetch;
      expect((await getUncachedYashieContent()).pageContent[key]).toEqual(DEFAULT_YASHIE_PAGE_CONTENT[key]);
      latest = saved;
      expect((await getUncachedYashieContent()).pageContent[key]).toEqual(pages[key]);
      expect(requestedKeys.size).toBe(2);
      expect(cacheTag).toHaveBeenCalledWith(YASHIE_DELIVERY_CACHE_TAG);
      expect(cacheLife).toHaveBeenCalledWith({ stale: 60, revalidate: 60, expire: 3600 });
      pages[key].highlights = [];
      expect((await getUncachedYashieContent()).pageContent[key].highlights).toEqual([]);
    });
  }

  test("does not seed collections when a valid delivery is empty", async () => {
    const empty = delivery(); empty.collections = [];
    globalThis.fetch = mock(async () => Response.json(empty)) as typeof fetch;
    const content = await getUncachedYashieContent();
    expect(content.blogPosts).toEqual([]);
    expect(content.galleryItems).toEqual([]);
    expect(content.products).toEqual([]);
    expect(content.worlds).toEqual([]);
  });

  for (const failure of ["http", "network", "json"] as const) {
    test(`keeps the site available on ${failure} failure`, async () => {
      globalThis.fetch = mock(async () => {
        if (failure === "network") throw new Error("Offline");
        if (failure === "json") return new Response("Invalid JSON");
        return new Response("Unavailable", { status: 503 });
      }) as typeof fetch;
      expect(await getUncachedYashieContent()).toEqual(DEFAULT_YASHIE_CONTENT);
    });
  }
  test("does not request delivery without a workspace binding", async () => {
    delete process.env.TUTURUUU_YASHIE_WORKSPACE_ID;
    delete process.env.NEXT_PUBLIC_TUTURUUU_YASHIE_WORKSPACE_ID;
    const request = mock(async () => Response.json(delivery()));
    globalThis.fetch = request as typeof fetch;
    expect(await getUncachedYashieContent()).toEqual(DEFAULT_YASHIE_CONTENT);
    expect(request).not.toHaveBeenCalled();
  });
});
