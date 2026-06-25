import { afterEach, describe, expect, mock, test } from "bun:test";

const getYashieAdminSession = mock(async () => sessionValue);
const getYashieAdminStudio = mock(async () => ({ studio: true }));
const setupYashieAdminStudio = mock(async () => undefined);
const readYashieAdminSiteSettings = mock(() => settingsValue);
const updateYashieAdminSiteSettings = mock(async () => settingsValue);
const parseYashieSiteSettingsPayload = mock(() => parseResult);

let sessionValue: unknown = {
  accessToken: "admin-token",
};
const validInput = {
  navigation: [
    {
      key: "blog",
      label: "Letters",
      visible: true,
    },
  ],
  profile: {
    alias: "@inkedbyyashie",
    brand: "InkedByYashie",
    email: "yashodauitwaru.pa@gmail.com",
    name: "Yashoda U. Itwaru",
    shortName: "Yashie",
    status: "published",
    title: "Writer. Author. Storyteller.",
  },
  socials: [],
};
let parseResult: {
  errors: Record<string, string>;
  input: unknown;
} = {
  errors: {},
  input: validInput,
};
const settingsValue = {
  navigation: [
    {
      entryId: "navigation-blog",
      href: "/blog",
      key: "blog",
      label: "Letters",
      sortOrder: 5,
      visible: true,
    },
  ],
  profile: {
    alias: "@inkedbyyashie",
    brand: "InkedByYashie",
    email: "yashodauitwaru.pa@gmail.com",
    entryId: "profile-1",
    location: "Indo-Guyanese Hindu author world",
    name: "Yashoda U. Itwaru",
    shortName: "Yashie",
    status: "published",
    summary: "Profile summary",
    title: "Writer. Author. Storyteller.",
  },
  socials: [],
};

mock.module("@/lib/yashie-admin-api", () => ({
  getYashieAdminSession,
  getYashieAdminStudio,
  setupYashieAdminStudio,
}));

mock.module("@/lib/yashie-admin-site-settings", () => ({
  parseYashieSiteSettingsPayload,
  readYashieAdminSiteSettings,
  updateYashieAdminSiteSettings,
}));

const { GET, PATCH } = await import("./route");

function createPatchRequest() {
  return new Request("http://localhost/api/admin/site-settings", {
    body: JSON.stringify({ settings: true }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });
}

describe("Yashie admin site settings route", () => {
  afterEach(() => {
    sessionValue = { accessToken: "admin-token" };
    parseResult = { errors: {}, input: validInput };
    getYashieAdminSession.mockClear();
    getYashieAdminStudio.mockClear();
    setupYashieAdminStudio.mockClear();
    readYashieAdminSiteSettings.mockClear();
    updateYashieAdminSiteSettings.mockClear();
    parseYashieSiteSettingsPayload.mockClear();
  });

  test("returns the current settings for authenticated editors", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(getYashieAdminStudio).toHaveBeenCalledWith("admin-token");
    expect(readYashieAdminSiteSettings).toHaveBeenCalledWith({ studio: true });
    expect(payload.settings.profile.alias).toBe("@inkedbyyashie");
  });

  test("saves validated settings", async () => {
    const response = await PATCH(createPatchRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(setupYashieAdminStudio).not.toHaveBeenCalled();
    expect(updateYashieAdminSiteSettings).toHaveBeenCalledWith(
      "admin-token",
      parseResult.input,
    );
    expect(payload.settings.profile.email).toBe("yashodauitwaru.pa@gmail.com");
  });

  test("rejects invalid settings", async () => {
    parseResult = {
      errors: {
        "profile.email": "Use a valid email address.",
      },
      input: null,
    };

    const response = await PATCH(createPatchRequest());
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.errors).toEqual(parseResult.errors);
    expect(updateYashieAdminSiteSettings).not.toHaveBeenCalled();
  });

  test("requires an admin session", async () => {
    sessionValue = null;

    const response = await PATCH(createPatchRequest());

    expect(response.status).toBe(401);
  });
});
