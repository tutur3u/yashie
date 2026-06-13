import type {
  YashieAdminCollectionKey,
  YashieContentStatus,
} from "@/lib/yashie-admin-content-model";

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
export type YashieEditorStepId =
  | "basics"
  | "danger"
  | "details"
  | "image"
  | "writing";

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

const previewRouteByCollection: Partial<Record<YashieAdminCollectionKey, string>> =
  {
    blog: "/blog",
    gallery: "/gallery",
    shop: "/shop",
    worlds: "/worlds",
  };

function formatDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function parseDateParts(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const inputMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (inputMatch) {
    const year = Number(inputMatch[1]);
    const month = Number(inputMatch[2]);
    const day = Number(inputMatch[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return { day, month, year };
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function getYashieDateInputValue(displayDate: string) {
  const parts = parseDateParts(displayDate);

  if (!parts) return "";

  return `${parts.year}-${formatDatePart(parts.month)}-${formatDatePart(parts.day)}`;
}

export function getYashieDisplayDateFromInput(inputDate: string) {
  const parts = parseDateParts(inputDate);

  if (!parts) return "";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(parts.year, parts.month - 1, parts.day));
}

export function getYashieEditorPreviewHref({
  collectionKey,
  slug,
}: {
  collectionKey: YashieAdminCollectionKey;
  slug: string;
}) {
  const basePath = previewRouteByCollection[collectionKey];
  const safeSlug = slug.trim();

  if (!basePath || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(safeSlug)) {
    return null;
  }

  return `${basePath}/${safeSlug}`;
}

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

export function getYashieEditorSteps({
  collectionKey,
  hasItem,
}: {
  collectionKey: YashieAdminCollectionKey;
  hasItem: boolean;
}): YashieEditorStepId[] {
  const steps: YashieEditorStepId[] = ["basics", "details"];

  if (collectionKey === "blog" || collectionKey === "worlds") {
    steps.push("writing");
  }

  if (collectionKey !== "categories") {
    steps.push("image");
  }

  if (hasItem) {
    steps.push("danger");
  }

  return steps;
}
