import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

const originalFetch = globalThis.fetch;
const revalidatePath = mock(() => undefined);

const manifest = {
  adapter: "yashie",
  content: {
    entries: [
      {
        assets: [
          {
            altText: "Signature mark",
            assetType: "image",
            metadata: {
              publicPath: "/missing-from-serverless-fs.svg",
            },
            sourceUrl: "/missing-from-serverless-fs.svg",
            stableSourceId: "yashie:profile:profile:image",
          },
        ],
        blocks: [],
        collectionSlug: "profile",
        slug: "profile",
        stableSourceId: "yashie:profile",
        status: "published",
        summary: "Profile summary",
        title: "Profile",
      },
    ],
  },
  schema: {
    collections: [
      {
        assetTypes: ["image"],
        collection_type: "profile",
        slug: "profile",
        title: "Profile",
      },
    ],
  },
  version: 1,
} as const;

mock.module("@/lib/yashie-external-project-manifest", () => ({
  yashieExternalProjectManifest: manifest,
}));

mock.module("@/lib/yashie-session", () => ({
  getYashieSessionFromCookies: async () => ({
    accessToken: "app-token",
    app: {
      name: "yashie",
    },
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    tokenType: "Bearer",
    user: {
      email: "admin@example.com",
      id: "user-1",
    },
    workspaceId: "ws-linked",
  }),
}));

mock.module("next/cache", () => ({
  revalidatePath,
}));

const { POST } = await import("./route");

type FetchCall = {
  init?: RequestInit;
  input: RequestInfo | URL;
};

type ManifestAssetPayload = {
  metadata?: Record<string, unknown>;
  sourceUrl?: string | null;
  storagePath?: string | null;
};

type ManifestRequestPayload = {
  force?: boolean;
  manifest: {
    content: {
      entries: Array<{
        assets?: ManifestAssetPayload[];
      }>;
    };
  };
};

function createRequest(force = false) {
  return new Request("http://localhost/api/admin/sync/apply", {
    body: JSON.stringify({ force }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

function createMockFetch() {
  const calls: FetchCall[] = [];

  globalThis.fetch = (async (input, init) => {
    calls.push({ init, input });

    const url = input.toString();

    if (url.endsWith("/external-projects/setup")) {
      return Response.json({
        autoSetup: true,
        binding: {
          adapter: "yashie",
          canonical_id: "yashie-main",
          canonical_project: null,
          enabled: true,
          workspace_id: "ws-linked",
        },
        createdBinding: false,
        createdCanonicalProject: false,
      });
    }

    if (url.endsWith("/external-projects/assets/upload-url")) {
      const formData = init?.body;
      if (!(formData instanceof FormData)) {
        return Response.json({ error: "Invalid upload body" }, { status: 400 });
      }

      const file = formData.get("file");
      if (!(file instanceof File)) {
        return Response.json({ error: "Missing file" }, { status: 400 });
      }

      return Response.json({
        contentType: file.type,
        data: {
          fullPath: "ws-linked/external-projects/yashie/profile/profile/missing-from-serverless-fs.svg",
          path: "external-projects/yashie/profile/profile/missing-from-serverless-fs.svg",
        },
        filename: file.name,
      });
    }

    if (url === "https://yashodauitwaru.com/missing-from-serverless-fs.svg") {
      return new Response("<svg />", {
        headers: {
          "Content-Type": "image/svg+xml",
        },
        status: 200,
      });
    }

    if (url.endsWith("/external-projects/sync/apply")) {
      return Response.json({
        applied: true,
        diff: {
          hasDestructiveOperations: false,
          operations: [],
          summary: {
            archive: 0,
            create: 1,
            delete: 0,
            noop: 0,
            update: 0,
          },
        },
      });
    }

    return Response.json({ error: `Unexpected request: ${url}` }, { status: 500 });
  }) as typeof fetch;

  return calls;
}

function findCall(calls: FetchCall[], suffix: string) {
  return calls.find((call) => call.input.toString().endsWith(suffix));
}

function parseBody(call: FetchCall | undefined) {
  expect(call).toBeDefined();
  expect(typeof call?.init?.body).toBe("string");
  return JSON.parse(call?.init?.body as string) as ManifestRequestPayload;
}

describe("Yashie admin sync apply route", () => {
  beforeEach(() => {
    process.env.TUTURUUU_API_BASE_URL = "https://platform.example.com/api/v1";
    process.env.TUTURUUU_YASHIE_WORKSPACE_ID = "ws-linked";
    process.env.YASHIE_APP_URL = "https://yashodauitwaru.com";
    revalidatePath.mockClear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.TUTURUUU_API_BASE_URL;
    delete process.env.TUTURUUU_YASHIE_WORKSPACE_ID;
    delete process.env.YASHIE_APP_URL;
  });

  test("normalizes and fetches public folder assets before setup and apply", async () => {
    const calls = createMockFetch();
    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");

    const setupBody = parseBody(findCall(calls, "/external-projects/setup"));
    const setupAsset = setupBody.manifest.content.entries[0]?.assets?.[0];

    expect(setupAsset?.sourceUrl).toBeNull();
    expect(setupAsset?.metadata?.publicPath).toBe("/missing-from-serverless-fs.svg");
    expect(setupAsset?.storagePath).toBe(
      "external-projects/yashie/profile/profile/missing-from-serverless-fs.svg",
    );

    const publicAssetFetch = findCall(calls, "/missing-from-serverless-fs.svg");
    expect(publicAssetFetch?.input.toString()).toBe(
      "https://yashodauitwaru.com/missing-from-serverless-fs.svg",
    );

    const uploadCall = findCall(calls, "/external-projects/assets/upload-url");
    const uploadUrlBody = uploadCall?.init?.body as FormData;
    const uploadFile = uploadUrlBody.get("file") as File;

    expect(uploadUrlBody).toBeInstanceOf(FormData);
    expect(uploadUrlBody.get("collectionType")).toBe("profile");
    expect(uploadUrlBody.get("entrySlug")).toBe("profile");
    expect(uploadUrlBody.get("upsert")).toBe("true");
    expect(uploadFile).toBeInstanceOf(File);
    expect(uploadFile.name).toBe("missing-from-serverless-fs.svg");
    expect(uploadFile.type).toBe("image/svg+xml");
    await expect(uploadFile.text()).resolves.toBe("<svg />");
    expect(Object.keys((uploadCall?.init?.headers ?? {}) as Record<string, string>)).not.toContain(
      "Content-Type",
    );

    const applyBody = parseBody(findCall(calls, "/external-projects/sync/apply"));
    const applyAsset = applyBody.manifest.content.entries[0]?.assets?.[0];

    expect(applyBody.force).toBe(false);
    expect(applyAsset?.sourceUrl).toBeNull();
    expect(applyAsset?.storagePath).toBe(
      "external-projects/yashie/profile/profile/missing-from-serverless-fs.svg",
    );
  });
});
