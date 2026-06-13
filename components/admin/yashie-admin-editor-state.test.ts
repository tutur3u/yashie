import { describe, expect, test } from "bun:test";
import {
  canSaveYashieEditor,
  getYashieDateInputValue,
  getYashieDisplayDateFromInput,
  getYashieEditorSteps,
  getYashieEditorCloseIntent,
  hasYashieEditorDirtyChanges,
  type YashieAdminEditorDraft,
} from "./yashie-admin-editor-state";

const baseDraft: YashieAdminEditorDraft = {
  body: "Body",
  category: "Blog",
  date: "Apr 27, 2024",
  imageAlt: "Open notebook",
  imagePosition: "",
  price: "",
  readTime: "6 min",
  removeImage: false,
  slug: "books-that-changed-me",
  status: "published",
  summary: "Short intro",
  title: "Books That Changed Me",
  type: "",
};

describe("Yashie admin editor state", () => {
  test("keeps save disabled when nothing changed", () => {
    const isDirty = hasYashieEditorDirtyChanges({
      draft: baseDraft,
      hasPendingImageFile: false,
      savedDraft: { ...baseDraft },
    });

    expect(isDirty).toBe(false);
    expect(canSaveYashieEditor({ isBusy: false, isDirty })).toBe(false);
  });

  test("marks edited fields and queued image files as dirty", () => {
    expect(
      hasYashieEditorDirtyChanges({
        draft: { ...baseDraft, title: "Books That Changed Me Again" },
        hasPendingImageFile: false,
        savedDraft: baseDraft,
      }),
    ).toBe(true);

    expect(
      hasYashieEditorDirtyChanges({
        draft: baseDraft,
        hasPendingImageFile: true,
        savedDraft: baseDraft,
      }),
    ).toBe(true);
  });

  test("only allows save when the editor is dirty and idle", () => {
    expect(canSaveYashieEditor({ isBusy: false, isDirty: true })).toBe(true);
    expect(canSaveYashieEditor({ isBusy: true, isDirty: true })).toBe(false);
  });

  test("warns before closing dirty idle work and ignores close while busy", () => {
    expect(
      getYashieEditorCloseIntent({ isBusy: false, isDirty: false }),
    ).toBe("close");
    expect(getYashieEditorCloseIntent({ isBusy: false, isDirty: true })).toBe(
      "warn",
    );
    expect(getYashieEditorCloseIntent({ isBusy: true, isDirty: true })).toBe(
      "ignore",
    );
  });

  test("uses focused steps for each content type", () => {
    expect(
      getYashieEditorSteps({ collectionKey: "blog", hasItem: true }),
    ).toEqual(["basics", "details", "writing", "image", "danger"]);
    expect(
      getYashieEditorSteps({ collectionKey: "gallery", hasItem: true }),
    ).toEqual(["basics", "details", "image", "danger"]);
    expect(
      getYashieEditorSteps({ collectionKey: "categories", hasItem: false }),
    ).toEqual(["basics", "details"]);
  });

  test("normalizes display dates for the native date picker", () => {
    expect(getYashieDateInputValue("Apr 27, 2024")).toBe("2024-04-27");
    expect(getYashieDateInputValue("June 13, 2026")).toBe("2026-06-13");
    expect(getYashieDateInputValue("not a date")).toBe("");
  });

  test("formats picked dates back to visitor-friendly copy", () => {
    expect(getYashieDisplayDateFromInput("2024-05-12")).toBe("May 12, 2024");
    expect(getYashieDisplayDateFromInput("2026-06-13")).toBe("Jun 13, 2026");
    expect(getYashieDisplayDateFromInput("2026-02-31")).toBe("");
  });
});
