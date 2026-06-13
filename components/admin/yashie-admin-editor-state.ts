import type { YashieContentStatus } from "@/lib/yashie-admin-content-model";

export type YashieAdminEditorDraft = {
  body: string;
  category: string;
  date: string;
  imageAlt: string;
  imagePosition: string;
  price: string;
  readTime: string;
  removeImage: boolean;
  slug: string;
  status: YashieContentStatus;
  summary: string;
  title: string;
  type: string;
};

export type YashieEditorCloseIntent = "close" | "ignore" | "warn";

const draftKeys: Array<keyof YashieAdminEditorDraft> = [
  "body",
  "category",
  "date",
  "imageAlt",
  "imagePosition",
  "price",
  "readTime",
  "removeImage",
  "slug",
  "status",
  "summary",
  "title",
  "type",
];

export function hasYashieEditorDirtyChanges({
  draft,
  hasPendingImageFile,
  savedDraft,
}: {
  draft: YashieAdminEditorDraft;
  hasPendingImageFile: boolean;
  savedDraft: YashieAdminEditorDraft;
}) {
  return (
    hasPendingImageFile ||
    draftKeys.some((key) => draft[key] !== savedDraft[key])
  );
}

export function canSaveYashieEditor({
  isBusy,
  isDirty,
}: {
  isBusy: boolean;
  isDirty: boolean;
}) {
  return isDirty && !isBusy;
}

export function getYashieEditorCloseIntent({
  isBusy,
  isDirty,
}: {
  isBusy: boolean;
  isDirty: boolean;
}): YashieEditorCloseIntent {
  if (isBusy) return "ignore";
  return isDirty ? "warn" : "close";
}
