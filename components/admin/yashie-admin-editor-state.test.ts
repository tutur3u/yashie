import { describe, expect, test } from "bun:test";
import {
  canSaveYashieEditor,
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
});
