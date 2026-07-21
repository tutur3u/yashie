import { describe, expect, test } from "bun:test";
import {
  buildYashieDriveUrl,
  buildYashieTasksUrl,
  buildYashieWorkspaceUrl,
} from "./yashie-config";

describe("Yashie config links", () => {
  test("opens Tuturuuu Drive through the main Tuturuuu app", () => {
    expect(
      buildYashieDriveUrl({
        webAppUrl: "https://tuturuuu.com",
        workspaceId: "ws-linked",
      }),
    ).toBe("https://tuturuuu.com/ws-linked/drive");
  });

  test("opens member management through the main Tuturuuu app", () => {
    expect(
      buildYashieWorkspaceUrl({
        targetKey: "members",
        webAppUrl: "https://tuturuuu.com",
        workspaceId: "ws-linked",
      }),
    ).toBe("https://tuturuuu.com/ws-linked/members");
  });

  test("opens tasks for the linked Tuturuuu workspace", () => {
    expect(
      buildYashieTasksUrl({
        tasksAppUrl: "https://tasks.tuturuuu.com",
        workspaceId: "ws-linked",
      }),
    ).toBe("https://tasks.tuturuuu.com/ws-linked/tasks");
  });
});
