import { describe, expect, test } from "bun:test";
import { syncPublicFolderAssets } from "./tuturuuu-public-folder-sync";

function createManifest() {
  return {
    adapter: "yashie",
    content: {
      entries: ["a", "b", "c", "d"].map((slug) => ({
        assets: [
          {
            assetType: "image",
            metadata: { publicPath: `/${slug}.png` },
          },
        ],
        collectionSlug: "gallery",
        slug,
      })),
    },
  };
}

describe("public folder asset sync", () => {
  test("uploads with bounded concurrency and preserves manifest order", async () => {
    let activeUploads = 0;
    let maxActiveUploads = 0;

    const fetchImpl = (async (input, init) => {
      const url = input.toString();

      if (url.startsWith("https://site.example/")) {
        return new Response(new Uint8Array([1, 2, 3]), {
          headers: { "Content-Type": "image/png" },
        });
      }

      if (url.endsWith("/external-projects/assets/upload-url")) {
        const payload = JSON.parse(String(init?.body)) as { filename: string };
        return Response.json({
          path: `external-projects/yashie/gallery/${payload.filename}`,
          signedUrl: `https://upload.example/${payload.filename}`,
        });
      }

      if (url.startsWith("https://upload.example/")) {
        activeUploads += 1;
        maxActiveUploads = Math.max(maxActiveUploads, activeUploads);
        await new Promise((resolve) => setTimeout(resolve, 10));
        activeUploads -= 1;
        return new Response(null, { status: 200 });
      }

      return Response.json({ error: `Unexpected URL ${url}` }, { status: 500 });
    }) as typeof fetch;

    const result = await syncPublicFolderAssets({
      accessToken: "token",
      apiBaseUrl: "https://platform.example/api/v1",
      appBaseUrl: "https://site.example",
      concurrency: 2,
      fetch: fetchImpl,
      manifest: createManifest(),
      publicDir: "/tmp/yashie-missing-public-dir",
      workspaceId: "workspace-1",
    });

    expect(maxActiveUploads).toBe(2);
    expect(result.skipped).toEqual([]);
    expect(result.uploaded.map((upload) => upload.filename)).toEqual([
      "a.png",
      "b.png",
      "c.png",
      "d.png",
    ]);
  });
});
