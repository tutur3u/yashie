"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  BookOpenText,
  CircleUserRound,
  ExternalLink,
  GalleryHorizontalEnd,
  Globe2,
  HardDrive,
  ListTodo,
  LogOut,
  Newspaper,
  Plus,
  Send,
  ShoppingBag,
  Tags,
  UserRoundCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { SocialIcon } from "@/app/components/SocialIcon";
import {
  socialPlatformOptions,
  type SocialPlatform,
} from "@/app/data/portfolio";
import type {
  YashieAdminCollectionKey,
  YashieAdminContentItem,
  YashieContentStatus,
} from "@/lib/yashie-admin-content-model";
import type {
  YashieAdminSiteSettings,
  YashieAdminSiteSettingsInput,
} from "@/lib/yashie-admin-site-settings";
import type {
  YashieAdminMember,
  YashieAdminMembersContext,
} from "@/lib/yashie-admin-members";
import {
  needsYashieStarterContent,
  slugifyYashieContent,
} from "@/lib/yashie-admin-content-model";
import type { YashieStorageAnalyticsState } from "@/lib/yashie-storage-analytics";
import type {
  YashieStorageFileItem,
  YashieStorageFilesState,
} from "@/lib/yashie-storage-files";
import {
  getYashieAdminSectionHref,
  type YashieAdminSection,
} from "@/lib/yashie-admin-sections";
import { YashieAdminSyncPanel } from "./YashieAdminSyncPanel";
import { YASHIE_ADMIN_COPY } from "./yashie-admin-copy";
import {
  adminFetch,
  scheduleYashieAdminSessionRefresh,
} from "./yashie-admin-session-client";
import {
  readContentSaveResponse,
  SaveProgressPanel,
  type MutationResponse,
  type SaveFlowError,
  type SaveProgressState,
} from "./yashie-admin-save-progress";
import {
  canSaveYashieEditor,
  getYashieDateInputValue,
  getYashieDisplayDateFromInput,
  getYashieEditorPreviewHref,
  getYashieEditorSteps,
  getYashieEditorCloseIntent,
  hasYashieEditorDirtyChanges,
  type YashieAdminEditorDraft,
  type YashieEditorStepId,
} from "./yashie-admin-editor-state";

type DashboardContent = Record<
  YashieAdminCollectionKey,
  YashieAdminContentItem[]
>;
type ReadyStorageAnalytics = Extract<
  YashieStorageAnalyticsState,
  { status: "ready" }
>;
type ReadyStorageFiles = Extract<YashieStorageFilesState, { status: "ready" }>;

type Draft = YashieAdminEditorDraft;

type SiteSettingsMutationResponse = {
  error?: string;
  errors?: Record<string, string>;
  settings?: YashieAdminSiteSettings;
};

type MembersResponse = {
  context?: YashieAdminMembersContext;
  error?: string;
  members?: YashieAdminMember[];
};

type EditorTarget = {
  collectionKey: YashieAdminCollectionKey;
  itemId: string | null;
};

const contentTabs: YashieAdminCollectionKey[] = [
  "worlds",
  "categories",
  "blog",
  "gallery",
  "shop",
];

const tabLabels: Array<{
  icon: LucideIcon;
  id: YashieAdminSection;
  label: string;
}> = [
  { icon: BookOpenText, id: "worlds", label: YASHIE_ADMIN_COPY.tabs.worlds },
  { icon: Tags, id: "categories", label: YASHIE_ADMIN_COPY.tabs.categories },
  { icon: Newspaper, id: "blog", label: YASHIE_ADMIN_COPY.tabs.blog },
  { icon: GalleryHorizontalEnd, id: "gallery", label: YASHIE_ADMIN_COPY.tabs.gallery },
  { icon: ShoppingBag, id: "shop", label: YASHIE_ADMIN_COPY.tabs.shop },
  { icon: UserRoundCog, id: "profile", label: YASHIE_ADMIN_COPY.tabs.profile },
  { icon: Send, id: "publish", label: YASHIE_ADMIN_COPY.tabs.publish },
  { icon: HardDrive, id: "storage", label: YASHIE_ADMIN_COPY.tabs.storage },
  { icon: Users, id: "members", label: YASHIE_ADMIN_COPY.tabs.members },
  { icon: CircleUserRound, id: "account", label: YASHIE_ADMIN_COPY.tabs.account },
];

const byteUnits = ["B", "KB", "MB", "GB", "TB"] as const;

const sectionCopy: Record<
  YashieAdminCollectionKey,
  {
    empty: string;
    listTitle: string;
    newLabel: string;
    singular: string;
  }
> = {
  blog: {
    empty: YASHIE_ADMIN_COPY.empty.blog,
    listTitle: "Blog posts",
    newLabel: YASHIE_ADMIN_COPY.actions.newPost,
    singular: "post",
  },
  categories: {
    empty: YASHIE_ADMIN_COPY.empty.categories,
    listTitle: "Categories",
    newLabel: YASHIE_ADMIN_COPY.actions.newCategory,
    singular: "category",
  },
  gallery: {
    empty: YASHIE_ADMIN_COPY.empty.gallery,
    listTitle: "Gallery pieces",
    newLabel: YASHIE_ADMIN_COPY.actions.newGallery,
    singular: "gallery piece",
  },
  shop: {
    empty: YASHIE_ADMIN_COPY.empty.shop,
    listTitle: "Shop items",
    newLabel: YASHIE_ADMIN_COPY.actions.newShop,
    singular: "shop item",
  },
  worlds: {
    empty: YASHIE_ADMIN_COPY.empty.worlds,
    listTitle: "Writing worlds",
    newLabel: YASHIE_ADMIN_COPY.actions.newWorld,
    singular: "writing world",
  },
};

const statusOptions: Array<{ label: string; value: YashieContentStatus }> = [
  { label: YASHIE_ADMIN_COPY.visibility.draft, value: "draft" },
  { label: YASHIE_ADMIN_COPY.visibility.published, value: "published" },
  { label: YASHIE_ADMIN_COPY.visibility.archived, value: "archived" },
  { label: YASHIE_ADMIN_COPY.visibility.scheduled, value: "scheduled" },
];

const categoryGroupOptions: Array<{
  label: string;
  value: YashieAdminCollectionKey;
}> = [
  { label: "Writing worlds", value: "worlds" },
  { label: "Blog", value: "blog" },
  { label: "Gallery", value: "gallery" },
  { label: "Shop", value: "shop" },
];

function getInitials(email: string | null) {
  if (!email) return "Y";

  const [name] = email.split("@");
  const initials =
    name
      ?.split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2) ?? "";

  return initials.toUpperCase() || "Y";
}

function statusLabel(status: YashieContentStatus) {
  return YASHIE_ADMIN_COPY.visibility[status];
}

function statusClass(status: YashieContentStatus) {
  if (status === "published") {
    return "border-[rgba(31,107,115,0.32)] bg-[rgba(31,107,115,0.1)] text-[var(--teal)]";
  }

  if (status === "archived") {
    return "border-[rgba(89,73,90,0.28)] bg-[rgba(89,73,90,0.08)] text-[var(--ink-soft)]";
  }

  if (status === "scheduled") {
    return "border-[rgba(217,167,91,0.45)] bg-[rgba(217,167,91,0.14)] text-[var(--copper-dark)]";
  }

  return "border-[rgba(184,112,81,0.34)] bg-[rgba(184,112,81,0.1)] text-[var(--clay)]";
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    byteUnits.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const formatted =
    value >= 10 || exponent === 0
      ? Math.round(value).toString()
      : value.toFixed(1);

  return `${formatted} ${byteUnits[exponent]}`;
}

function formatFileDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return YASHIE_ADMIN_COPY.storage.unknownDate;
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function StorageMetric({
  detail,
  label,
  value,
}: {
  detail?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="parchment-card min-w-0 p-5 sm:p-6">
      <p className="text-sm font-bold text-[var(--clay)]">{label}</p>
      <strong className="mt-3 block break-words font-display text-3xl leading-none text-[var(--navy)] sm:text-4xl">
        {value}
      </strong>
      {detail ? (
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

function StorageFileHighlight({
  file,
  label,
}: {
  file: ReadyStorageAnalytics["data"]["largestFile"];
  label: string;
}) {
  return (
    <div className="parchment-card min-w-0 p-5 sm:p-6">
      <p className="text-sm font-bold text-[var(--clay)]">{label}</p>
      {file ? (
        <div className="mt-3">
          <strong className="block truncate text-[var(--ink)]">
            {file.name}
          </strong>
          <span className="mt-1 block text-sm text-[var(--ink-soft)]">
            {formatBytes(file.size)} - {formatFileDate(file.createdAt)}
          </span>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          {YASHIE_ADMIN_COPY.storage.noFiles}
        </p>
      )}
    </div>
  );
}

function storageParentPath(path: string) {
  const segments = path.split("/").filter(Boolean);
  segments.pop();
  return segments.join("/");
}

function isStorageFilesPayload(
  value: unknown,
): value is ReadyStorageFiles["data"] {
  if (!value || typeof value !== "object") return false;

  const payload = value as Record<string, unknown>;
  return (
    Array.isArray(payload.items) &&
    typeof payload.path === "string" &&
    typeof payload.total === "number"
  );
}

function isStorageAnalyticsState(
  value: unknown,
): value is YashieStorageAnalyticsState {
  if (!value || typeof value !== "object") return false;

  const payload = value as Record<string, unknown>;
  return payload.status === "ready" || payload.status === "unavailable";
}

function StorageFileRow({
  busy,
  confirmDeletePath,
  item,
  onDelete,
  onOpen,
  onOpenFolder,
  onRename,
  renamingPath,
  renameValue,
  setConfirmDeletePath,
  setRenamingPath,
  setRenameValue,
}: {
  busy: boolean;
  confirmDeletePath: string | null;
  item: YashieStorageFileItem;
  onDelete: (item: YashieStorageFileItem) => void;
  onOpen: (item: YashieStorageFileItem) => void;
  onOpenFolder: (path: string) => void;
  onRename: (item: YashieStorageFileItem) => void;
  renamingPath: string | null;
  renameValue: string;
  setConfirmDeletePath: (path: string | null) => void;
  setRenamingPath: (path: string | null) => void;
  setRenameValue: (name: string) => void;
}) {
  const isRenaming = renamingPath === item.path;
  const isConfirmingDelete = confirmDeletePath === item.path;
  const dateLabel = formatFileDate(item.updatedAt ?? item.createdAt ?? "");

  return (
    <div className="grid gap-4 border border-[rgba(184,112,81,0.34)] bg-white/68 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        {isRenaming ? (
          <input
            className="min-h-11 w-full border border-[rgba(184,112,81,0.42)] bg-white px-3 text-sm font-bold text-[var(--ink)] outline-none focus:border-[var(--gold)]"
            onChange={(event) => setRenameValue(event.currentTarget.value)}
            value={renameValue}
          />
        ) : item.kind === "folder" ? (
          <button
            className="block max-w-full truncate text-left font-bold text-[var(--ink)] underline decoration-[rgba(184,112,81,0.28)] underline-offset-4"
            onClick={() => onOpenFolder(item.path)}
            type="button"
          >
            {item.name}
          </button>
        ) : (
          <strong className="block truncate text-[var(--ink)]">
            {item.name}
          </strong>
        )}
        <span className="mt-1 block text-sm text-[var(--ink-soft)]">
          {item.kind === "folder" ? "Folder" : formatBytes(item.size)} -{" "}
          {dateLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {item.kind === "file" && !isRenaming && !isConfirmingDelete ? (
          <button
            className="button-secondary min-h-10 px-4 text-xs"
            disabled={busy}
            onClick={() => onOpen(item)}
            type="button"
          >
            {YASHIE_ADMIN_COPY.storage.open}
          </button>
        ) : null}
        {isRenaming ? (
          <>
            <button
              className="button-primary min-h-10 px-4 text-xs"
              disabled={busy || !renameValue.trim()}
              onClick={() => onRename(item)}
              type="button"
            >
              {YASHIE_ADMIN_COPY.actions.save}
            </button>
            <button
              className="button-secondary min-h-10 px-4 text-xs"
              disabled={busy}
              onClick={() => setRenamingPath(null)}
              type="button"
            >
              {YASHIE_ADMIN_COPY.actions.cancel}
            </button>
          </>
        ) : isConfirmingDelete ? (
          <>
            <button
              className="min-h-10 bg-red-800 px-4 text-xs font-bold text-white disabled:opacity-50"
              disabled={busy}
              onClick={() => onDelete(item)}
              type="button"
            >
              {YASHIE_ADMIN_COPY.storage.remove}
            </button>
            <button
              className="button-secondary min-h-10 px-4 text-xs"
              disabled={busy}
              onClick={() => setConfirmDeletePath(null)}
              type="button"
            >
              {YASHIE_ADMIN_COPY.actions.keep}
            </button>
          </>
        ) : (
          <>
            <button
              className="button-secondary min-h-10 px-4 text-xs"
              disabled={busy}
              onClick={() => {
                setRenameValue(item.name);
                setRenamingPath(item.path);
              }}
              type="button"
            >
              {YASHIE_ADMIN_COPY.storage.rename}
            </button>
            <button
              className="min-h-10 border border-red-300 px-4 text-xs font-bold text-red-800 disabled:opacity-50"
              disabled={busy}
              onClick={() => setConfirmDeletePath(item.path)}
              type="button"
            >
              {YASHIE_ADMIN_COPY.storage.remove}
            </button>
          </>
        )}
      </div>
      {isConfirmingDelete ? (
        <p className="text-sm leading-6 text-red-800 md:col-span-2">
          {YASHIE_ADMIN_COPY.storage.deleteHint}
        </p>
      ) : null}
    </div>
  );
}

function StoragePanel({
  driveHref,
  storageAnalytics,
  storageFiles,
  onResourcesChanged,
}: {
  driveHref: string;
  storageAnalytics: YashieStorageAnalyticsState;
  storageFiles: YashieStorageFilesState;
  onResourcesChanged: () => Promise<void>;
}) {
  const [analyticsState, setAnalyticsState] = useState(storageAnalytics);
  const [filesState, setFilesState] = useState(storageFiles);
  const [currentPath, setCurrentPath] = useState(
    storageFiles.status === "ready" ? storageFiles.data.path : "",
  );
  const [folderName, setFolderName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeletePath, setConfirmDeletePath] = useState<string | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const refreshStorage = async (path = currentPath) => {
    setBusy(true);
    setCurrentPath(path);

    try {
      const filesUrl = new URL("/api/admin/storage", window.location.origin);
      if (path) {
        filesUrl.searchParams.set("path", path);
      }

      const [filesResponse, analyticsResponse] = await Promise.all([
        adminFetch(filesUrl, { cache: "no-store" }),
        adminFetch("/api/admin/storage/analytics", { cache: "no-store" }),
      ]);
      const filesPayload = (await filesResponse.json().catch(() => null)) as {
        data?: unknown;
        error?: string;
      } | null;
      const analyticsPayload = (await analyticsResponse
        .json()
        .catch(() => null)) as unknown;

      if (filesResponse.ok && isStorageFilesPayload(filesPayload?.data)) {
        setFilesState({ data: filesPayload.data, status: "ready" });
      } else {
        setFilesState({
          message: filesPayload?.error ?? "Files are not available right now.",
          status: "unavailable",
        });
      }

      if (analyticsResponse.ok && isStorageAnalyticsState(analyticsPayload)) {
        setAnalyticsState(analyticsPayload);
      }
    } catch {
      setFilesState({
        message: "Files are not available right now.",
        status: "unavailable",
      });
    } finally {
      setBusy(false);
    }
  };

  const runStorageMutation = async (
    request: Promise<Response>,
    successMessage: string,
    refreshPath = currentPath,
  ) => {
    setBusy(true);

    try {
      const response = await request;
      const payload = (await response.json().catch(() => null)) as {
        data?: { detachedAssets?: number; updatedAssets?: number };
        error?: string;
      } | null;

      if (!response.ok) {
        toast.error(payload?.error ?? "Storage request failed.");
        return;
      }

      const changedLinks =
        (payload?.data?.detachedAssets ?? 0) +
        (payload?.data?.updatedAssets ?? 0);
      const successText =
        changedLinks > 0
          ? `${successMessage} ${changedLinks} saved item${changedLinks === 1 ? "" : "s"} updated.`
          : successMessage;
      setConfirmDeletePath(null);
      setRenamingPath(null);
      await refreshStorage(refreshPath);
      toast.success(successText);
      await onResourcesChanged();
    } catch {
      toast.error("Storage request failed.");
    } finally {
      setBusy(false);
    }
  };

  const uploadSelectedFile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uploadFile) {
      toast.error(YASHIE_ADMIN_COPY.storage.chooseFile);
      return;
    }

    const body = new FormData();
    body.set("file", uploadFile);
    body.set("path", currentPath);
    body.set("upsert", "true");

    await runStorageMutation(
      adminFetch("/api/admin/storage", {
        body,
        method: "POST",
      }),
      YASHIE_ADMIN_COPY.storage.uploadDone,
    );
    setUploadFile(null);
  };

  const createFolder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = folderName.trim();
    if (!name) return;

    await runStorageMutation(
      adminFetch("/api/admin/storage", {
        body: JSON.stringify({ name, path: currentPath }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
      YASHIE_ADMIN_COPY.storage.folderDone,
    );
    setFolderName("");
  };

  const renameItem = (item: YashieStorageFileItem) => {
    void runStorageMutation(
      adminFetch("/api/admin/storage", {
        body: JSON.stringify({
          kind: item.kind,
          newName: renameValue.trim(),
          path: item.path,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }),
      YASHIE_ADMIN_COPY.storage.renameDone,
      storageParentPath(item.path),
    );
  };

  const deleteItem = (item: YashieStorageFileItem) => {
    void runStorageMutation(
      adminFetch("/api/admin/storage", {
        body: JSON.stringify({ kind: item.kind, path: item.path }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      }),
      YASHIE_ADMIN_COPY.storage.deleteDone,
      storageParentPath(item.path),
    );
  };

  const openFile = async (item: YashieStorageFileItem) => {
    setBusy(true);

    try {
      const url = new URL("/api/admin/storage", window.location.origin);
      url.searchParams.set("filePath", item.path);
      const response = await adminFetch(url, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as {
        data?: { signedUrl?: string };
        error?: string;
      } | null;

      if (!response.ok || !payload?.data?.signedUrl) {
        toast.error(payload?.error ?? "File could not be opened.");
        return;
      }

      window.open(payload.data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("File could not be opened.");
    } finally {
      setBusy(false);
    }
  };

  if (
    analyticsState.status === "unavailable" &&
    filesState.status === "unavailable"
  ) {
    return (
      <section className="parchment-card min-w-0 p-5 sm:p-6">
        <p className="script-label">{YASHIE_ADMIN_COPY.storage.title}</p>
        <h2 className="break-words font-display text-4xl leading-none text-[var(--navy)] sm:text-5xl">
          {YASHIE_ADMIN_COPY.storage.unavailableTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          {analyticsState.message}
        </p>
        <Link
          className="button-secondary mt-5 inline-flex"
          href={driveHref}
          rel="noreferrer"
          target="_blank"
        >
          {YASHIE_ADMIN_COPY.storage.driveLink}
        </Link>
      </section>
    );
  }

  const data = analyticsState.status === "ready" ? analyticsState.data : null;
  const usagePercentage = data
    ? Math.max(0, Math.min(100, data.usagePercentage))
    : 0;
  const files = filesState.status === "ready" ? filesState.data.items : [];
  const pathLabel = currentPath || YASHIE_ADMIN_COPY.storage.root;

  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-3">
      {data ? (
        <div className="parchment-card min-w-0 p-5 sm:p-6 lg:col-span-3">
          <p className="script-label">{YASHIE_ADMIN_COPY.storage.title}</p>
          <div className="mt-2 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <h2 className="break-words font-display text-4xl leading-none text-[var(--navy)] sm:text-5xl">
                {YASHIE_ADMIN_COPY.storage.heading}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                {YASHIE_ADMIN_COPY.storage.description}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                {YASHIE_ADMIN_COPY.storage.driveDescription}
              </p>
            </div>
            <div className="grid gap-3 text-left lg:text-right">
              <strong className="font-display text-4xl leading-none text-[var(--clay)] sm:text-5xl">
                {usagePercentage.toFixed(usagePercentage % 1 === 0 ? 0 : 1)}%
              </strong>
              <Link
                className="button-secondary w-full lg:w-auto"
                href={driveHref}
                rel="noreferrer"
                target="_blank"
              >
                {YASHIE_ADMIN_COPY.storage.driveLink}
              </Link>
            </div>
          </div>
          <div className="mt-6 h-3 overflow-hidden border border-[rgba(184,112,81,0.34)] bg-white/72">
            <div
              className="h-full bg-[var(--clay)]"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      ) : null}

      {data ? (
        <>
          <StorageMetric
            detail={`${formatBytes(data.totalSize)} ${YASHIE_ADMIN_COPY.storage.of} ${formatBytes(
              data.storageLimit,
            )}`}
            label={YASHIE_ADMIN_COPY.storage.used}
            value={formatBytes(data.totalSize)}
          />
          <StorageMetric
            label={YASHIE_ADMIN_COPY.storage.limit}
            value={formatBytes(data.storageLimit)}
          />
          <StorageMetric
            label={YASHIE_ADMIN_COPY.storage.files}
            value={String(data.fileCount)}
          />
          <StorageFileHighlight
            file={data.largestFile}
            label={YASHIE_ADMIN_COPY.storage.largest}
          />
          <StorageFileHighlight
            file={data.smallestFile}
            label={YASHIE_ADMIN_COPY.storage.smallest}
          />
        </>
      ) : null}

      <div className="parchment-card grid min-w-0 gap-5 p-5 sm:p-6 lg:col-span-3">
        <p className="script-label">{YASHIE_ADMIN_COPY.storage.title}</p>
        <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="min-w-0">
            <h3 className="break-words font-display text-3xl leading-none text-[var(--navy)] sm:text-4xl">
              {pathLabel}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              {YASHIE_ADMIN_COPY.storage.uploadHelp}
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            {currentPath ? (
              <button
                className="button-secondary min-h-10 px-4 text-xs"
                disabled={busy}
                onClick={() =>
                  void refreshStorage(storageParentPath(currentPath))
                }
                type="button"
              >
                {YASHIE_ADMIN_COPY.storage.back}
              </button>
            ) : null}
            <button
              className="button-secondary min-h-10 px-4 text-xs"
              disabled={busy}
              onClick={() => void refreshStorage(currentPath)}
              type="button"
            >
              {YASHIE_ADMIN_COPY.storage.refresh}
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <form
            className="grid min-w-0 gap-3 border border-[rgba(184,112,81,0.34)] bg-white/58 p-4"
            onSubmit={uploadSelectedFile}
          >
            <label className="grid min-w-0 gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
                {YASHIE_ADMIN_COPY.storage.chooseFile}
              </span>
              <input
                className="min-h-11 w-full min-w-0 border border-[rgba(184,112,81,0.42)] bg-white/78 px-3 py-2 text-sm text-[var(--ink)]"
                onChange={(event) =>
                  setUploadFile(event.currentTarget.files?.[0] ?? null)
                }
                type="file"
              />
            </label>
            <button
              className="button-primary w-full"
              disabled={busy || !uploadFile}
              type="submit"
            >
              {YASHIE_ADMIN_COPY.storage.upload}
            </button>
          </form>

          <form
            className="grid min-w-0 gap-3 border border-[rgba(184,112,81,0.34)] bg-white/58 p-4"
            onSubmit={createFolder}
          >
            <label className="grid min-w-0 gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
                {YASHIE_ADMIN_COPY.storage.folderName}
              </span>
              <input
                className="min-h-11 w-full min-w-0 border border-[rgba(184,112,81,0.42)] bg-white/78 px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--gold)]"
                onChange={(event) => setFolderName(event.currentTarget.value)}
                value={folderName}
              />
            </label>
            <button
              className="button-secondary w-full"
              disabled={busy || !folderName.trim()}
              type="submit"
            >
              {YASHIE_ADMIN_COPY.storage.createFolder}
            </button>
          </form>
        </div>

        <div className="grid gap-3">
          {filesState.status === "unavailable" ? (
            <p className="text-sm leading-6 text-[var(--ink-soft)]">
              {filesState.message}
            </p>
          ) : files.length > 0 ? (
            files.map((item) => (
              <StorageFileRow
                busy={busy}
                confirmDeletePath={confirmDeletePath}
                item={item}
                key={item.path}
                onDelete={deleteItem}
                onOpen={(file) => void openFile(file)}
                onOpenFolder={(path) => void refreshStorage(path)}
                onRename={renameItem}
                renameValue={renameValue}
                renamingPath={renamingPath}
                setConfirmDeletePath={setConfirmDeletePath}
                setRenameValue={setRenameValue}
                setRenamingPath={setRenamingPath}
              />
            ))
          ) : (
            <p className="border border-dashed border-[rgba(184,112,81,0.5)] bg-white/58 p-6 text-sm leading-6 text-[var(--ink-soft)]">
              {YASHIE_ADMIN_COPY.storage.emptyFiles}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function draftFromItem(item: YashieAdminContentItem | null): Draft {
  return {
    body: item?.body ?? "",
    category: item?.category ?? "",
    date: item?.date ?? "",
    imageAlt: item?.imageAlt ?? "",
    imagePosition: item?.imagePosition ?? "",
    price: item?.price ?? "",
    readTime: item?.readTime ?? "",
    removeImage: false,
    slug: item?.slug ?? "",
    status: item?.status ?? "draft",
    summary: item?.summary ?? "",
    title: item?.title ?? "",
    type: item?.type ?? "",
  };
}

function readFriendlyError(payload: MutationResponse, fallback: string) {
  return Object.values(payload.errors ?? {})[0] ?? fallback;
}

function categoryOptionsFor(
  categories: YashieAdminContentItem[],
  collectionKey: YashieAdminCollectionKey,
  currentValue: string,
) {
  const values = categories
    .filter(
      (item) =>
        item.status !== "archived" &&
        item.category === collectionKey &&
        item.title.trim(),
    )
    .map((item) => item.title.trim());
  const uniqueValues = [...new Set(values)].sort((left, right) =>
    left.localeCompare(right),
  );

  if (currentValue.trim() && !uniqueValues.includes(currentValue.trim())) {
    uniqueValues.unshift(currentValue.trim());
  }

  return uniqueValues.map((value) => ({ label: value, value }));
}

function categoryGroupLabel(value: string) {
  return (
    categoryGroupOptions.find((option) => option.value === value)?.label ??
    value
  );
}

function contentItemMetaLabel(
  collectionKey: YashieAdminCollectionKey,
  item: YashieAdminContentItem,
) {
  if (collectionKey === "blog") return item.category || "Post";
  if (collectionKey === "categories") return categoryGroupLabel(item.category);
  if (collectionKey === "gallery") return item.type || "Gallery piece";
  if (collectionKey === "worlds") return item.category || "Writing world";
  return item.price || "Shop item";
}

function coverBackgroundStyle(item: YashieAdminContentItem | null) {
  if (!item?.imageUrl) return undefined;

  return {
    backgroundImage: `url(${JSON.stringify(item.imageUrl)})`,
    backgroundPosition: item.imagePosition || "center",
  };
}

function ContentCardCover({ item }: { item: YashieAdminContentItem }) {
  return (
    <span
      className={`relative block min-h-28 overflow-hidden border border-[rgba(184,112,81,0.34)] bg-[rgba(239,207,178,0.55)] bg-cover bg-center ${
        item.imageUrl ? "" : "grid place-items-center"
      }`}
      style={coverBackgroundStyle(item)}
    >
      {item.imageUrl ? (
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,31,52,0.02),rgba(12,31,52,0.12))]" />
      ) : (
        <span className="px-3 text-center text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          No cover
        </span>
      )}
    </span>
  );
}

function EditorCoverSummary({
  draft,
  imageFileLabel,
  item,
}: {
  draft: Draft;
  imageFileLabel: string;
  item: YashieAdminContentItem | null;
}) {
  const hasVisibleCover = Boolean(item?.imageUrl && !draft.removeImage);
  const status = imageFileLabel
    ? "New cover selected"
    : hasVisibleCover
      ? "Current cover"
      : draft.removeImage
        ? "Cover will be removed"
        : "No cover yet";

  return (
    <aside className="grid min-w-0 gap-2 border border-[rgba(184,112,81,0.32)] bg-white/50 p-3">
      <span
        className={`relative block min-h-36 overflow-hidden border border-[rgba(184,112,81,0.28)] bg-[rgba(239,207,178,0.55)] bg-cover bg-center ${
          hasVisibleCover ? "" : "grid place-items-center"
        }`}
        style={hasVisibleCover ? coverBackgroundStyle(item) : undefined}
      >
        {hasVisibleCover ? (
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,31,52,0.02),rgba(12,31,52,0.14))]" />
        ) : (
          <span className="px-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            Cover preview
          </span>
        )}
      </span>
      <span className="truncate text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
        {status}
      </span>
      {imageFileLabel ? (
        <span className="truncate text-xs text-[var(--ink-soft)]">
          {imageFileLabel}
        </span>
      ) : null}
    </aside>
  );
}

function EditorStepHeader({ step }: { step: YashieEditorStepId }) {
  const copy = YASHIE_ADMIN_COPY.editor.steps[step];

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--clay)]">
        {copy.label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
        {copy.description}
      </p>
    </div>
  );
}

function TextField<TName extends keyof Draft>({
  disabled,
  error,
  label,
  name,
  onChange,
  placeholder,
  required,
  value,
}: {
  disabled?: boolean;
  error?: string;
  label: string;
  name: TName;
  onChange: (name: TName, value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
        {label}
      </span>
      <input
        className={`min-h-11 w-full min-w-0 border bg-white/78 px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] ${
          error ? "border-red-400" : "border-[rgba(184,112,81,0.42)]"
        } disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]`}
        disabled={disabled}
        name={name}
        onChange={(event) => onChange(name, event.currentTarget.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

function DateField<TName extends keyof Draft>({
  disabled,
  label,
  name,
  onChange,
  value,
}: {
  disabled?: boolean;
  label: string;
  name: TName;
  onChange: (name: TName, value: string) => void;
  value: string;
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
        {label}
      </span>
      <input
        className="min-h-11 w-full min-w-0 border border-[rgba(184,112,81,0.42)] bg-white/78 px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]"
        disabled={disabled}
        name={name}
        onChange={(event) =>
          onChange(
            name,
            getYashieDisplayDateFromInput(event.currentTarget.value),
          )
        }
        title={value}
        type="date"
        value={getYashieDateInputValue(value)}
      />
    </label>
  );
}

function SelectField<TName extends keyof Draft>({
  disabled,
  label,
  name,
  onChange,
  options,
  placeholder = "Select an option",
  value,
}: {
  disabled?: boolean;
  label: string;
  name: TName;
  onChange: (name: TName, value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  value: string;
}) {
  const hasCurrentValue =
    value.trim() && !options.some((option) => option.value === value);

  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
        {label}
      </span>
      <select
        className="min-h-11 w-full min-w-0 border border-[rgba(184,112,81,0.42)] bg-white/78 px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]"
        disabled={disabled}
        name={name}
        onChange={(event) => onChange(name, event.currentTarget.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {hasCurrentValue ? <option value={value}>{value}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField<TName extends keyof Draft>({
  disabled,
  label,
  name,
  onChange,
  placeholder,
  rows = 4,
  value,
}: {
  disabled?: boolean;
  label: string;
  name: TName;
  onChange: (name: TName, value: string) => void;
  placeholder?: string;
  rows?: number;
  value: string;
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
        {label}
      </span>
      <textarea
        className="min-h-28 w-full min-w-0 resize-y border border-[rgba(184,112,81,0.42)] bg-white/78 px-3 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition focus:border-[var(--gold)] disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]"
        disabled={disabled}
        name={name}
        onChange={(event) => onChange(name, event.currentTarget.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function siteSettingsDraftFromSettings(
  settings: YashieAdminSiteSettings,
): YashieAdminSiteSettingsInput {
  return {
    navigation: settings.navigation.map((item) => ({
      key: item.key,
      label: item.label,
      visible: item.visible,
    })),
    profile: {
      alias: settings.profile.alias,
      brand: settings.profile.brand,
      email: settings.profile.email,
      location: settings.profile.location,
      name: settings.profile.name,
      shortName: settings.profile.shortName,
      status: settings.profile.status,
      summary: settings.profile.summary,
      title: settings.profile.title,
    },
    socials: settings.socials.map((social) => ({
      handle: social.handle,
      href: social.href,
      id: social.id,
      label: social.label,
      platform: social.platform,
      sortOrder: social.sortOrder,
      status: social.status,
    })),
  };
}

function normalizeSocialDraftOrder(
  socials: YashieAdminSiteSettingsInput["socials"],
) {
  return socials.map((social, index) => ({
    ...social,
    sortOrder: index,
  }));
}

function createEmptySocialDraft(
  sortOrder: number,
): YashieAdminSiteSettingsInput["socials"][number] {
  return {
    handle: "",
    href: "",
    id: null,
    label: "New link",
    platform: "other",
    sortOrder,
    status: "published",
  };
}

function SettingsTextField({
  disabled,
  error,
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  disabled?: boolean;
  error?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
        {label}
      </span>
      <input
        className={`min-h-11 w-full min-w-0 border bg-white/78 px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] ${
          error ? "border-red-400" : "border-[rgba(184,112,81,0.42)]"
        } disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]`}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

type ProfileFieldName = keyof YashieAdminSiteSettingsInput["profile"];
type NavigationDraft = YashieAdminSiteSettingsInput["navigation"][number];
type SocialDraft = YashieAdminSiteSettingsInput["socials"][number];

type ProfileFieldConfig = {
  inputType?: string;
  label: string;
  multiline?: boolean;
  name: ProfileFieldName;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
};

type SettingsDialogTarget =
  | { field: ProfileFieldName; kind: "profile" }
  | { index: number; kind: "navigation" }
  | { index: number; kind: "social" }
  | { kind: "new-social" };

const profileFieldConfigs: ProfileFieldConfig[] = [
  { label: "Author name", name: "name", required: true },
  { label: "Public title", name: "title", required: true },
  { label: "Public handle", name: "alias", required: true },
  { inputType: "email", label: "Email", name: "email", required: true },
  { label: "Brand", name: "brand", required: true },
  { label: "Short name", name: "shortName", required: true },
  { label: "Location", name: "location" },
  {
    label: YASHIE_ADMIN_COPY.editor.visibility,
    name: "status",
    options: statusOptions,
    required: true,
  },
  { label: "Intro line", multiline: true, name: "summary" },
];

function settingsSnapshot(value: unknown) {
  return JSON.stringify(value);
}

function settingsEqual(left: unknown, right: unknown) {
  return settingsSnapshot(left) === settingsSnapshot(right);
}

function profileFieldConfigFor(field: ProfileFieldName) {
  return (
    profileFieldConfigs.find((config) => config.name === field) ??
    profileFieldConfigs[0]!
  );
}

function profileFieldPreview(
  field: ProfileFieldName,
  value: YashieAdminSiteSettingsInput["profile"][ProfileFieldName],
) {
  if (field === "status") {
    return statusLabel(value as YashieContentStatus);
  }

  return String(value || "No value set");
}

function clearFieldErrorEntries(
  errors: Record<string, string>,
  prefixes: string[],
) {
  return Object.fromEntries(
    Object.entries(errors).filter(
      ([key]) =>
        !prefixes.some(
          (prefix) => key === prefix || key.startsWith(`${prefix}.`),
        ),
    ),
  );
}

function SettingsDialogFrame({
  children,
  description,
  footer,
  onClose,
  title,
}: {
  children: ReactNode;
  description?: string;
  footer: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid min-h-dvh overflow-y-auto bg-[rgba(12,31,52,0.58)] px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-modal="true"
        className="parchment-card mx-auto grid w-full max-w-2xl min-w-0 self-center p-5 shadow-[0_28px_90px_rgba(12,31,52,0.38)] sm:p-6"
        role="dialog"
      >
        <div className="flex min-w-0 items-start justify-between gap-4 border-b border-[rgba(184,112,81,0.28)] pb-4">
          <div className="min-w-0">
            <p className="script-label">{YASHIE_ADMIN_COPY.profile.heading}</p>
            <h3 className="break-words font-display text-3xl leading-none text-[var(--navy)] sm:text-4xl">
              {title}
            </h3>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center border border-[rgba(184,112,81,0.42)] text-lg font-bold text-[var(--ink-soft)] transition hover:border-[var(--copper)] hover:text-[var(--navy)]"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>
        <div className="grid min-w-0 gap-4 py-5">{children}</div>
        <div className="flex flex-col gap-3 border-t border-[rgba(184,112,81,0.28)] pt-4 sm:flex-row sm:justify-end">
          {footer}
        </div>
      </section>
    </div>
  );
}

function SectionSaveButton({
  dirty,
  onSave,
  submitting,
}: {
  dirty: boolean;
  onSave: () => void;
  submitting: boolean;
}) {
  return (
    <button
      className="button-primary min-w-28 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      disabled={submitting || !dirty}
      onClick={onSave}
      type="button"
    >
      {submitting
        ? YASHIE_ADMIN_COPY.actions.saving
        : YASHIE_ADMIN_COPY.actions.save}
    </button>
  );
}

function SettingsSectionHeader({
  description,
  dirty,
  onSave,
  submitting,
  title,
}: {
  description?: string;
  dirty: boolean;
  onSave: () => void;
  submitting: boolean;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--clay)]">
          {title}
        </p>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            {description}
          </p>
        ) : null}
      </div>
      <SectionSaveButton
        dirty={dirty}
        onSave={onSave}
        submitting={submitting}
      />
    </div>
  );
}

function SettingSummaryCard({
  actionLabel = "Edit",
  detail,
  error,
  label,
  onEdit,
  value,
}: {
  actionLabel?: string;
  detail?: ReactNode;
  error?: string;
  label: string;
  onEdit: () => void;
  value: ReactNode;
}) {
  return (
    <article className="grid min-w-0 gap-3 border border-[rgba(184,112,81,0.34)] bg-white/58 p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--clay)]">
            {label}
          </p>
          <div className="mt-2 break-words text-sm leading-6 text-[var(--ink)]">
            {value}
          </div>
          {detail ? (
            <div className="mt-1 break-words text-xs leading-5 text-[var(--ink-soft)]">
              {detail}
            </div>
          ) : null}
        </div>
        <button
          className="button-secondary min-h-10 shrink-0 px-4 text-xs"
          onClick={onEdit}
          type="button"
        >
          {actionLabel}
        </button>
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </article>
  );
}

function ProfileFieldDialog({
  config,
  currentValue,
  error,
  onApply,
  onClose,
  submitting,
}: {
  config: ProfileFieldConfig;
  currentValue: string;
  error?: string;
  onApply: (value: string) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const [value, setValue] = useState(currentValue);
  const isDirty = value !== currentValue;
  const isInvalid = Boolean(config.required && !value.trim());

  return (
    <SettingsDialogFrame
      footer={
        <>
          <button
            className="button-secondary w-full sm:w-auto"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            {YASHIE_ADMIN_COPY.actions.cancel}
          </button>
          <button
            className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            disabled={submitting || !isDirty || isInvalid}
            onClick={() => onApply(value)}
            type="button"
          >
            Apply
          </button>
        </>
      }
      onClose={onClose}
      title={config.label}
    >
      {config.options ? (
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
            {config.label}
          </span>
          <select
            className={`min-h-11 w-full min-w-0 border bg-white/78 px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] ${
              error ? "border-red-400" : "border-[rgba(184,112,81,0.42)]"
            } disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]`}
            disabled={submitting}
            onChange={(event) => setValue(event.currentTarget.value)}
            value={value}
          >
            {config.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error ? <span className="text-xs text-red-700">{error}</span> : null}
        </label>
      ) : config.multiline ? (
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
            {config.label}
          </span>
          <textarea
            className={`min-h-36 w-full min-w-0 resize-y border bg-white/78 px-3 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition focus:border-[var(--gold)] ${
              error ? "border-red-400" : "border-[rgba(184,112,81,0.42)]"
            } disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]`}
            disabled={submitting}
            onChange={(event) => setValue(event.currentTarget.value)}
            value={value}
          />
          {error ? <span className="text-xs text-red-700">{error}</span> : null}
        </label>
      ) : (
        <SettingsTextField
          disabled={submitting}
          error={error}
          label={config.label}
          onChange={setValue}
          required={config.required}
          type={config.inputType}
          value={value}
        />
      )}
    </SettingsDialogFrame>
  );
}

function NavigationItemDialog({
  currentItem,
  error,
  onApply,
  onClose,
  submitting,
}: {
  currentItem: NavigationDraft;
  error?: string;
  onApply: (item: NavigationDraft) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const [item, setItem] = useState(currentItem);
  const isDirty = !settingsEqual(item, currentItem);
  const isInvalid = !item.label.trim();

  return (
    <SettingsDialogFrame
      footer={
        <>
          <button
            className="button-secondary w-full sm:w-auto"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            {YASHIE_ADMIN_COPY.actions.cancel}
          </button>
          <button
            className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            disabled={submitting || !isDirty || isInvalid}
            onClick={() => onApply(item)}
            type="button"
          >
            Apply
          </button>
        </>
      }
      onClose={onClose}
      title={item.label || "Website tab"}
    >
      <SettingsTextField
        disabled={submitting}
        error={error}
        label="Tab name"
        onChange={(value) =>
          setItem((current) => ({ ...current, label: value }))
        }
        required
        value={item.label}
      />
      <label className="flex min-w-0 items-center gap-3 border border-[rgba(184,112,81,0.34)] bg-white/58 px-3 py-3 text-sm font-bold text-[var(--ink-soft)]">
        <input
          checked={item.visible}
          className="size-4 accent-[var(--clay)]"
          disabled={submitting}
          onChange={(event) =>
            setItem((current) => ({
              ...current,
              visible: event.currentTarget.checked,
            }))
          }
          type="checkbox"
        />
        <span>{YASHIE_ADMIN_COPY.profile.showTab}</span>
      </label>
    </SettingsDialogFrame>
  );
}

function SocialLinkDialog({
  currentSocial,
  errorPrefix,
  errors,
  onApply,
  onClose,
  submitting,
  title,
}: {
  currentSocial: SocialDraft;
  errorPrefix: string;
  errors: Record<string, string>;
  onApply: (social: SocialDraft) => void;
  onClose: () => void;
  submitting: boolean;
  title: string;
}) {
  const [social, setSocial] = useState(currentSocial);
  const isDirty = !settingsEqual(social, currentSocial);
  const isInvalid = !social.label.trim() || !social.href.trim();
  const updateSocial = <TName extends keyof SocialDraft>(
    name: TName,
    value: SocialDraft[TName],
  ) => {
    setSocial((current) => ({ ...current, [name]: value }));
  };

  return (
    <SettingsDialogFrame
      footer={
        <>
          <button
            className="button-secondary w-full sm:w-auto"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            {YASHIE_ADMIN_COPY.actions.cancel}
          </button>
          <button
            className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            disabled={submitting || !isDirty || isInvalid}
            onClick={() => onApply(social)}
            type="button"
          >
            Apply
          </button>
        </>
      }
      onClose={onClose}
      title={title}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SettingsTextField
          disabled={submitting}
          error={errors[`${errorPrefix}.label`]}
          label="Name"
          onChange={(value) => updateSocial("label", value)}
          required
          value={social.label}
        />
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
            Icon
          </span>
          <select
            className={`min-h-11 w-full min-w-0 border bg-white/78 px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] ${
              errors[`${errorPrefix}.platform`]
                ? "border-red-400"
                : "border-[rgba(184,112,81,0.42)]"
            } disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]`}
            disabled={submitting}
            onChange={(event) =>
              updateSocial(
                "platform",
                event.currentTarget.value as SocialPlatform,
              )
            }
            value={social.platform}
          >
            {socialPlatformOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors[`${errorPrefix}.platform`] ? (
            <span className="text-xs text-red-700">
              {errors[`${errorPrefix}.platform`]}
            </span>
          ) : null}
        </label>
        <SettingsTextField
          disabled={submitting}
          error={errors[`${errorPrefix}.handle`]}
          label="Handle"
          onChange={(value) => updateSocial("handle", value)}
          value={social.handle}
        />
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
            {YASHIE_ADMIN_COPY.editor.visibility}
          </span>
          <select
            className={`min-h-11 w-full min-w-0 border bg-white/78 px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] ${
              errors[`${errorPrefix}.status`]
                ? "border-red-400"
                : "border-[rgba(184,112,81,0.42)]"
            } disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]`}
            disabled={submitting}
            onChange={(event) =>
              updateSocial(
                "status",
                event.currentTarget.value as SocialDraft["status"],
              )
            }
            value={social.status}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors[`${errorPrefix}.status`] ? (
            <span className="text-xs text-red-700">
              {errors[`${errorPrefix}.status`]}
            </span>
          ) : null}
        </label>
        <div className="md:col-span-2">
          <SettingsTextField
            disabled={submitting}
            error={errors[`${errorPrefix}.href`]}
            label="Link"
            onChange={(value) => updateSocial("href", value)}
            required
            type="url"
            value={social.href}
          />
        </div>
      </div>
    </SettingsDialogFrame>
  );
}

function ImportSeedContentPanel({
  importing,
  onImport,
}: {
  importing: boolean;
  onImport: () => void;
}) {
  return (
    <section className="grid min-w-0 gap-4 border border-[rgba(184,112,81,0.38)] bg-white/62 p-4 sm:p-5">
      <div className="min-w-0">
        <p className="script-label">{YASHIE_ADMIN_COPY.publish.title}</p>
        <h2 className="break-words font-display text-3xl leading-none text-[var(--navy)] sm:text-4xl">
          {YASHIE_ADMIN_COPY.importSeed.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
          {YASHIE_ADMIN_COPY.importSeed.description}
        </p>
      </div>
      <button
        className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
        disabled={importing}
        onClick={onImport}
        type="button"
      >
        {importing
          ? YASHIE_ADMIN_COPY.importSeed.pending
          : YASHIE_ADMIN_COPY.importSeed.action}
      </button>
    </section>
  );
}

function SiteSettingsPanel({
  settings,
  onSaved,
  onRefresh,
}: {
  settings: YashieAdminSiteSettings;
  onSaved: (settings: YashieAdminSiteSettings) => void;
  onRefresh?: () => Promise<void>;
}) {
  const [draft, setDraft] = useState(() =>
    siteSettingsDraftFromSettings(settings),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [dialogTarget, setDialogTarget] = useState<SettingsDialogTarget | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const savedDraft = siteSettingsDraftFromSettings(settings);
  const profileDirty = !settingsEqual(draft.profile, savedDraft.profile);
  const navigationDirty = !settingsEqual(
    draft.navigation,
    savedDraft.navigation,
  );
  const socialsDirty = !settingsEqual(draft.socials, savedDraft.socials);
  const hasChanges = profileDirty || navigationDirty || socialsDirty;

  useEffect(() => {
    setDraft(siteSettingsDraftFromSettings(settings));
    setFieldErrors({});
  }, [settings]);

  const clearErrors = (prefixes: string[]) => {
    setFieldErrors((current) => clearFieldErrorEntries(current, prefixes));
  };

  const removeSocial = (index: number) => {
    setDraft((current) => ({
      ...current,
      socials: normalizeSocialDraftOrder(
        current.socials.filter((_, socialIndex) => socialIndex !== index),
      ),
    }));
    clearErrors(["socials"]);
    toast.success(YASHIE_ADMIN_COPY.profile.linkRemoved);
  };

  const moveSocial = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.socials.length) {
        return current;
      }

      const nextSocials = [...current.socials];
      const [moved] = nextSocials.splice(index, 1);

      if (!moved) {
        return current;
      }

      nextSocials.splice(nextIndex, 0, moved);

      return {
        ...current,
        socials: normalizeSocialDraftOrder(nextSocials),
      };
    });
    clearErrors(["socials"]);
  };

  const applyProfileField = (field: ProfileFieldName, value: string) => {
    setDraft((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [field]: value,
      } as YashieAdminSiteSettingsInput["profile"],
    }));
    clearErrors([`profile.${field}`]);
    setDialogTarget(null);
  };

  const applyNavigationItem = (index: number, item: NavigationDraft) => {
    setDraft((current) => ({
      ...current,
      navigation: current.navigation.map((currentItem, itemIndex) =>
        itemIndex === index ? item : currentItem,
      ),
    }));
    clearErrors([`navigation.${index}`]);
    setDialogTarget(null);
  };

  const applySocial = (index: number, social: SocialDraft) => {
    setDraft((current) => ({
      ...current,
      socials: normalizeSocialDraftOrder(
        current.socials.map((currentSocial, socialIndex) =>
          socialIndex === index ? social : currentSocial,
        ),
      ),
    }));
    clearErrors(["socials"]);
    setDialogTarget(null);
  };

  const appendSocial = (social: SocialDraft) => {
    setDraft((current) => ({
      ...current,
      socials: normalizeSocialDraftOrder([...current.socials, social]),
    }));
    clearErrors(["socials"]);
    setDialogTarget(null);
  };

  const saveSettings = async () => {
    if (!hasChanges) return false;

    setSubmitting(true);
    setFieldErrors({});

    try {
      const response = await adminFetch("/api/admin/site-settings", {
        body: JSON.stringify(draft),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response
        .json()
        .catch(() => ({}))) as SiteSettingsMutationResponse;

      if (!response.ok || !payload.settings) {
        setFieldErrors(payload.errors ?? {});
        toast.error(readFriendlyError(payload, YASHIE_ADMIN_COPY.errors.save));
        return false;
      }

      setDraft(siteSettingsDraftFromSettings(payload.settings));
      onSaved(payload.settings);
      toast.success(YASHIE_ADMIN_COPY.profile.saved);
      void onRefresh?.().catch(() => undefined);
      return true;
    } catch {
      toast.error(YASHIE_ADMIN_COPY.errors.save);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-w-0 gap-6">
      <div className="flex flex-col gap-4 border-b border-[rgba(184,112,81,0.28)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="script-label">{YASHIE_ADMIN_COPY.profile.title}</p>
          <h2 className="break-words font-display text-4xl leading-none text-[var(--navy)] sm:text-5xl">
            {YASHIE_ADMIN_COPY.profile.heading}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            {YASHIE_ADMIN_COPY.profile.description}
          </p>
        </div>
        <button
          className="button-primary min-w-28 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          disabled={submitting || !hasChanges}
          onClick={() => void saveSettings()}
          type="button"
        >
          {submitting
            ? YASHIE_ADMIN_COPY.actions.saving
            : YASHIE_ADMIN_COPY.actions.save}
        </button>
      </div>

      <section className="grid gap-4">
        <SettingsSectionHeader
          dirty={profileDirty}
          onSave={() => void saveSettings()}
          submitting={submitting}
          title={YASHIE_ADMIN_COPY.profile.title}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {profileFieldConfigs.map((config) => (
            <SettingSummaryCard
              error={fieldErrors[`profile.${config.name}`]}
              key={config.name}
              label={config.label}
              onEdit={() =>
                setDialogTarget({ field: config.name, kind: "profile" })
              }
              value={profileFieldPreview(
                config.name,
                draft.profile[config.name],
              )}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <SettingsSectionHeader
          description={YASHIE_ADMIN_COPY.profile.menuDescription}
          dirty={navigationDirty}
          onSave={() => void saveSettings()}
          submitting={submitting}
          title={YASHIE_ADMIN_COPY.profile.menu}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {draft.navigation.map((item, index) => (
            <SettingSummaryCard
              detail={
                item.visible ? "Shown to visitors" : "Hidden from visitors"
              }
              error={fieldErrors[`navigation.${index}.label`]}
              key={item.key}
              label="Tab"
              onEdit={() => setDialogTarget({ index, kind: "navigation" })}
              value={item.label}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <SettingsSectionHeader
            dirty={socialsDirty}
            onSave={() => void saveSettings()}
            submitting={submitting}
            title={YASHIE_ADMIN_COPY.profile.links}
          />
          <button
            className="button-secondary min-w-28 w-full sm:w-auto"
            onClick={() => setDialogTarget({ kind: "new-social" })}
            type="button"
          >
            Add link
          </button>
        </div>
        <div className="grid gap-4">
          {draft.socials.map((social, index) => (
            <div
              className="grid min-w-0 gap-4 border border-[rgba(184,112,81,0.34)] bg-white/58 p-4"
              key={social.id ?? `social-${index}`}
            >
              <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start">
                <span className="inline-flex size-11 items-center justify-center border border-[rgba(184,112,81,0.38)] text-[var(--clay)]">
                  <SocialIcon platform={social.platform as SocialPlatform} />
                </span>
                <div className="min-w-0">
                  <p className="break-words font-display text-3xl leading-none text-[var(--navy)]">
                    {social.label || "Untitled link"}
                  </p>
                  <p className="mt-1 break-words text-sm text-[var(--ink-soft)]">
                    {social.href || "No link set"}
                  </p>
                  <p className="mt-1 break-words text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    {statusLabel(social.status)}
                    {social.handle ? ` - ${social.handle}` : ""}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <button
                    className="border border-[rgba(184,112,81,0.34)] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink-soft)]"
                    onClick={() => setDialogTarget({ index, kind: "social" })}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="border border-[rgba(184,112,81,0.34)] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() => moveSocial(index, -1)}
                    type="button"
                  >
                    Up
                  </button>
                  <button
                    className="border border-[rgba(184,112,81,0.34)] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={index === draft.socials.length - 1}
                    onClick={() => moveSocial(index, 1)}
                    type="button"
                  >
                    Down
                  </button>
                  <button
                    className="border border-red-300 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-red-800"
                    onClick={() => removeSocial(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {fieldErrors[`socials.${index}.label`] ||
              fieldErrors[`socials.${index}.href`] ||
              fieldErrors[`socials.${index}.platform`] ||
              fieldErrors[`socials.${index}.status`] ? (
                <p className="text-xs text-red-700">
                  {fieldErrors[`socials.${index}.label`] ??
                    fieldErrors[`socials.${index}.href`] ??
                    fieldErrors[`socials.${index}.platform`] ??
                    fieldErrors[`socials.${index}.status`]}
                </p>
              ) : null}
            </div>
          ))}
        </div>
        {fieldErrors.socials ? (
          <span className="text-xs text-red-700">{fieldErrors.socials}</span>
        ) : null}
      </section>

      {dialogTarget?.kind === "profile" ? (
        <ProfileFieldDialog
          config={profileFieldConfigFor(dialogTarget.field)}
          currentValue={String(draft.profile[dialogTarget.field] ?? "")}
          error={fieldErrors[`profile.${dialogTarget.field}`]}
          key={`profile-${dialogTarget.field}`}
          onApply={(value) => applyProfileField(dialogTarget.field, value)}
          onClose={() => setDialogTarget(null)}
          submitting={submitting}
        />
      ) : null}

      {dialogTarget?.kind === "navigation" &&
      draft.navigation[dialogTarget.index] ? (
        <NavigationItemDialog
          currentItem={draft.navigation[dialogTarget.index]}
          error={fieldErrors[`navigation.${dialogTarget.index}.label`]}
          key={`navigation-${dialogTarget.index}`}
          onApply={(item) => applyNavigationItem(dialogTarget.index, item)}
          onClose={() => setDialogTarget(null)}
          submitting={submitting}
        />
      ) : null}

      {dialogTarget?.kind === "social" && draft.socials[dialogTarget.index] ? (
        <SocialLinkDialog
          currentSocial={draft.socials[dialogTarget.index]}
          errorPrefix={`socials.${dialogTarget.index}`}
          errors={fieldErrors}
          key={`social-${dialogTarget.index}`}
          onApply={(social) => applySocial(dialogTarget.index, social)}
          onClose={() => setDialogTarget(null)}
          submitting={submitting}
          title={draft.socials[dialogTarget.index].label || "Link"}
        />
      ) : null}

      {dialogTarget?.kind === "new-social" ? (
        <SocialLinkDialog
          currentSocial={createEmptySocialDraft(draft.socials.length)}
          errorPrefix={`socials.${draft.socials.length}`}
          errors={fieldErrors}
          key={`new-social-${draft.socials.length}`}
          onApply={appendSocial}
          onClose={() => setDialogTarget(null)}
          submitting={submitting}
          title="New link"
        />
      ) : null}
    </div>
  );
}

function MembersPanel({ membersHref }: { membersHref: string }) {
  const [members, setMembers] = useState<YashieAdminMember[]>([]);
  const [context, setContext] = useState<YashieAdminMembersContext | null>(
    null,
  );
  const [status, setStatus] = useState<"error" | "loading" | "ready">(
    "loading",
  );
  const [message, setMessage] = useState<string>(
    YASHIE_ADMIN_COPY.members.loading,
  );

  useEffect(() => {
    let active = true;

    const loadMembers = async () => {
      setStatus("loading");
      setMessage(YASHIE_ADMIN_COPY.members.loading);

      try {
        const response = await adminFetch("/api/admin/members", {
          cache: "no-store",
        });
        const payload = (await response
          .json()
          .catch(() => ({}))) as MembersResponse;

        if (!active) return;

        if (!response.ok || !payload.members) {
          setStatus("error");
          setMessage(payload.error ?? YASHIE_ADMIN_COPY.members.unavailable);
          return;
        }

        setMembers(payload.members);
        setContext(payload.context ?? null);
        setStatus("ready");
      } catch {
        if (!active) return;
        setStatus("error");
        setMessage(YASHIE_ADMIN_COPY.members.unavailable);
      }
    };

    void loadMembers();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="parchment-card grid min-w-0 gap-5 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="script-label">{YASHIE_ADMIN_COPY.members.title}</p>
          <h2 className="break-words font-display text-4xl leading-none text-[var(--navy)] sm:text-5xl">
            {context?.boundProjectName ?? "Site team"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            {YASHIE_ADMIN_COPY.members.description}
          </p>
        </div>
        <Link
          className="button-primary w-full sm:w-auto"
          href={membersHref}
          rel="noreferrer"
          target="_blank"
        >
          {YASHIE_ADMIN_COPY.members.manage}
        </Link>
      </div>

      {status === "loading" || status === "error" ? (
        <div className="border border-[rgba(184,112,81,0.34)] bg-white/68 px-4 py-3 text-sm text-[var(--ink-soft)]">
          {message}
        </div>
      ) : null}

      {status === "ready" && members.length === 0 ? (
        <p className="border border-dashed border-[rgba(184,112,81,0.5)] bg-white/58 p-6 text-sm leading-6 text-[var(--ink-soft)]">
          {YASHIE_ADMIN_COPY.members.empty}
        </p>
      ) : null}

      {members.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {members.map((member) => (
            <div
              className="grid min-w-0 gap-2 border border-[rgba(184,112,81,0.34)] bg-white/68 p-4"
              key={member.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center bg-[var(--navy)] font-display text-xl text-[var(--parchment)]">
                  {member.initials}
                </span>
                <div className="min-w-0">
                  <strong className="block truncate text-[var(--ink)]">
                    {member.name}
                  </strong>
                  {member.email ? (
                    <span className="mt-1 block truncate text-sm text-[var(--ink-soft)]">
                      {member.email}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="border border-[rgba(184,112,81,0.34)] bg-white/72 px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--clay)]">
                  {member.status}
                </span>
                <span className="border border-[rgba(31,107,115,0.22)] bg-[rgba(31,107,115,0.08)] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--teal)]">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ContentList({
  collectionKey,
  items,
  onNew,
  onSelect,
  selectedId,
}: {
  collectionKey: YashieAdminCollectionKey;
  items: YashieAdminContentItem[];
  onNew: () => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const copy = sectionCopy[collectionKey];

  return (
    <section className="grid min-w-0 content-start gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="script-label">{copy.listTitle}</p>
          <h2 className="font-display text-4xl leading-none text-[var(--navy)] sm:text-5xl">
            {items.length > 0
              ? `Manage ${copy.listTitle.toLowerCase()}`
              : `Create your first ${copy.singular}`}
          </h2>
          {items.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] font-black uppercase tracking-[0.12em]">
              <span className="border border-[rgba(184,112,81,0.36)] bg-white/68 px-2.5 py-1 text-[var(--ink-soft)]">
                {items.length} {items.length === 1 ? copy.singular : copy.listTitle.toLowerCase()}
              </span>
              <span className="border border-[rgba(31,107,115,0.24)] bg-[rgba(31,107,115,0.08)] px-2.5 py-1 text-[var(--teal)]">
                {items.filter((item) => item.status === "published").length} live
              </span>
            </div>
          ) : null}
        </div>
        <button
          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 border px-4 text-sm font-bold transition sm:w-auto ${
            selectedId === null
              ? "border-[var(--gold)] bg-[var(--navy)] text-[var(--parchment)]"
              : "border-[rgba(184,112,81,0.48)] bg-white/72 text-[var(--copper-dark)] hover:border-[var(--gold)]"
          }`}
          onClick={onNew}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
          {copy.newLabel}
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <button
              className={`grid min-w-0 gap-4 border bg-white/72 p-4 text-left transition ${
                selectedId === item.id
                  ? "border-[var(--gold)] shadow-[0_18px_46px_rgba(82,40,37,0.12)]"
                  : "border-[rgba(184,112,81,0.38)] hover:border-[var(--copper)]"
              }`}
              key={item.id}
              onClick={() => onSelect(item.id)}
              type="button"
            >
              <div className="grid min-w-0 gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                <ContentCardCover item={item} />
                <div className="grid min-w-0 content-start gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`border px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] ${statusClass(
                        item.status,
                      )}`}
                    >
                      {statusLabel(item.status)}
                    </span>
                    {item.imageUrl ? (
                      <span className="border border-[rgba(31,107,115,0.22)] bg-[rgba(31,107,115,0.08)] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--teal)]">
                        Image ready
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <strong className="block break-words text-base text-[var(--ink)]">
                      {item.title}
                    </strong>
                    <span className="mt-1 block break-words text-sm text-[var(--ink-soft)]">
                      {contentItemMetaLabel(collectionKey, item)}
                    </span>
                  </div>
                  {item.summary ? (
                    <span className="line-clamp-2 text-xs leading-5 text-[var(--ink-soft)]">
                      {item.summary}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-[rgba(184,112,81,0.5)] bg-white/68 p-6">
          <h3 className="font-display text-3xl leading-none text-[var(--navy)]">
            No {copy.listTitle.toLowerCase()} yet.
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            {copy.empty}
          </p>
        </div>
      )}
    </section>
  );
}

function ContentForm({
  categories,
  collectionKey,
  item,
  onClose,
  onCloseRequest,
  onBusyChange,
  onDeleted,
  onDirtyChange,
  onSaved,
}: {
  categories: YashieAdminContentItem[];
  collectionKey: YashieAdminCollectionKey;
  item: YashieAdminContentItem | null;
  onClose: () => void;
  onCloseRequest: () => void;
  onBusyChange: (isBusy: boolean) => void;
  onDeleted: (items: YashieAdminContentItem[]) => void;
  onDirtyChange: (isDirty: boolean) => void;
  onSaved: (
    items: YashieAdminContentItem[],
    item: YashieAdminContentItem | null,
  ) => void;
}) {
  const copy = sectionCopy[collectionKey];
  const [savedItem, setSavedItem] = useState<YashieAdminContentItem | null>(
    null,
  );
  const effectiveItem = savedItem ?? item;
  const [draft, setDraft] = useState(() => draftFromItem(item));
  const [slugTouched, setSlugTouched] = useState(Boolean(item));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileLabel, setImageFileLabel] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveProgress, setSaveProgress] = useState<SaveProgressState>({
    label: "",
    percent: 0,
    status: "idle",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeStep, setActiveStep] = useState<YashieEditorStepId>("basics");
  const savedDraft = draftFromItem(effectiveItem);
  const isBusy = submitting || deleting;
  const supportsImage = collectionKey !== "categories";
  const editorSteps = getYashieEditorSteps({
    collectionKey,
    hasItem: Boolean(effectiveItem),
  });
  const visibleStep = editorSteps.includes(activeStep)
    ? activeStep
    : (editorSteps[0] ?? "basics");
  const visibleStepIndex = Math.max(editorSteps.indexOf(visibleStep), 0);
  const isFirstStep = visibleStepIndex === 0;
  const isLastStep = visibleStepIndex === editorSteps.length - 1;
  const sectionSurfaceClass =
    "grid gap-4 border border-[rgba(184,112,81,0.28)] bg-white/42 p-4 sm:p-5";
  const isDirty = hasYashieEditorDirtyChanges({
    draft,
    hasPendingImageFile: Boolean(imageFile),
    savedDraft,
  });
  const canSave = canSaveYashieEditor({ isBusy, isDirty });
  const previewHref = effectiveItem
    ? getYashieEditorPreviewHref({
        collectionKey,
        slug: effectiveItem.slug,
      })
    : null;

  useEffect(() => {
    onBusyChange(isBusy);
  }, [isBusy, onBusyChange]);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateDraft = (name: keyof Draft, value: string | boolean) => {
    setDraft((current) => {
      const next = { ...current, [name]: value };

      if (
        name === "title" &&
        typeof value === "string" &&
        !slugTouched &&
        !effectiveItem
      ) {
        next.slug = slugifyYashieContent(value);
      }

      return next;
    });
  };

  const updateImageFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;
    setImageFile(file);
    setImageFileLabel(
      file ? `${file.name} (${Math.round(file.size / 1024)} KB)` : "",
    );

    if (file) {
      setDraft((current) => ({ ...current, removeImage: false }));
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    setSubmitting(true);
    setFieldErrors({});
    setSaveProgress({
      label: "Checking content",
      percent: 2,
      status: "running",
      step: "validate",
    });

    const body = new FormData();
    for (const [key, value] of Object.entries(draft)) {
      body.set(key, typeof value === "boolean" ? String(value) : value);
    }

    if (imageFile) {
      body.set("imageFile", imageFile);
    }

    try {
      const response = await adminFetch(
        effectiveItem
          ? `/api/admin/content/${collectionKey}/${encodeURIComponent(effectiveItem.id)}`
          : `/api/admin/content/${collectionKey}`,
        {
          body,
          method: effectiveItem ? "PATCH" : "POST",
        },
      );
      const payload = await readContentSaveResponse({
        response,
        setSaveProgress,
      });

      onSaved(payload.items ?? [], payload.item ?? null);
      setSavedItem(payload.item ?? effectiveItem ?? null);
      setImageFile(null);
      setImageFileLabel("");
      setConfirmDelete(false);

      if (payload.item) {
        setDraft(draftFromItem(payload.item));
        setSlugTouched(true);
      } else {
        setDraft((current) => ({ ...current, removeImage: false }));
      }

      setSaveProgress({
        label: "",
        percent: 0,
        status: "idle",
      });
      toast.success(YASHIE_ADMIN_COPY.editor.saved);
    } catch (error) {
      const saveError = error as SaveFlowError;
      const fallback =
        saveError instanceof Error
          ? saveError.message
          : YASHIE_ADMIN_COPY.errors.save;
      setFieldErrors(saveError.errors ?? {});
      setSaveProgress((current) => ({
        error: readFriendlyError(
          { error: fallback, errors: saveError.errors },
          YASHIE_ADMIN_COPY.errors.save,
        ),
        label: saveError.label ?? current.label ?? "Save failed",
        percent: Math.max(current.percent, 1),
        status: "error",
        statusCode: saveError.statusCode,
        step: saveError.step ?? current.step,
      }));
      toast.error(YASHIE_ADMIN_COPY.errors.save);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async () => {
    if (!effectiveItem) return;

    setDeleting(true);

    try {
      const response = await adminFetch(
        `/api/admin/content/${collectionKey}/${encodeURIComponent(effectiveItem.id)}`,
        {
          method: "DELETE",
        },
      );
      const payload = (await response
        .json()
        .catch(() => ({}))) as MutationResponse;

      if (!response.ok) {
        toast.error(YASHIE_ADMIN_COPY.errors.delete);
        return;
      }

      onDeleted(payload.items ?? []);
      toast.success(YASHIE_ADMIN_COPY.editor.removed);
      onClose();
    } catch {
      toast.error(YASHIE_ADMIN_COPY.errors.delete);
    } finally {
      setDeleting(false);
    }
  };

  const goToStep = (offset: number) => {
    const nextStep = editorSteps[visibleStepIndex + offset];
    if (nextStep) setActiveStep(nextStep);
  };

  const renderStepSaveButton = () => (
    <div className="mt-2 flex justify-end border-t border-[rgba(184,112,81,0.24)] pt-4">
      <button
        className="button-primary min-w-28 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={!canSave}
        type="submit"
      >
        {submitting
          ? YASHIE_ADMIN_COPY.actions.saving
          : YASHIE_ADMIN_COPY.actions.save}
      </button>
    </div>
  );

  return (
    <form className="grid min-w-0 gap-6" onSubmit={submit}>
      <div className="grid gap-4 border-b border-[rgba(184,112,81,0.28)] pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div
          className={`grid min-w-0 gap-4 ${
            supportsImage ? "lg:grid-cols-[minmax(0,1fr)_220px]" : ""
          }`}
        >
          <div className="min-w-0">
            <p className="script-label">
              {effectiveItem ? `Edit ${copy.singular}` : copy.newLabel}
            </p>
            <h2 className="break-words font-display text-4xl leading-none text-[var(--navy)] sm:text-5xl">
              {draft.title || `Untitled ${copy.singular}`}
            </h2>
          </div>
          {supportsImage ? (
            <EditorCoverSummary
              draft={draft}
              imageFileLabel={imageFileLabel}
              item={effectiveItem}
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
          {previewHref ? (
            <Link
              className="button-secondary min-w-32 w-full text-center sm:w-auto"
              href={previewHref}
              rel="noreferrer"
              target="_blank"
            >
              {YASHIE_ADMIN_COPY.editor.openPreview}
            </Link>
          ) : null}
          <button
            className="button-secondary min-w-28 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            disabled={isBusy}
            onClick={onCloseRequest}
            type="button"
          >
            Close
          </button>
          <button
            className="button-primary min-w-28 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            disabled={!canSave}
            type="submit"
          >
            {submitting
              ? YASHIE_ADMIN_COPY.actions.saving
              : YASHIE_ADMIN_COPY.actions.save}
          </button>
        </div>
      </div>

      {saveProgress.status === "running" || saveProgress.status === "error" ? (
        <SaveProgressPanel state={saveProgress} />
      ) : null}

      <nav
        aria-label="Editor sections"
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
      >
        {editorSteps.map((step, index) => {
          const stepCopy = YASHIE_ADMIN_COPY.editor.steps[step];
          const isActive = step === visibleStep;

          return (
            <button
              className={`grid min-h-16 min-w-0 border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
                isActive
                  ? "border-[var(--gold)] bg-[var(--navy)] text-[var(--parchment)]"
                  : "border-[rgba(184,112,81,0.34)] bg-white/52 text-[var(--ink)] hover:border-[var(--copper)]"
              }`}
              disabled={isBusy}
              key={step}
              onClick={() => setActiveStep(step)}
              type="button"
            >
              <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] opacity-75">
                Step {index + 1}
              </span>
              <span className="truncate text-sm font-black">
                {stepCopy.label}
              </span>
              <span className="truncate text-xs opacity-75">
                {stepCopy.description}
              </span>
            </button>
          );
        })}
      </nav>

      {visibleStep === "basics" ? (
        <section className={sectionSurfaceClass}>
          <EditorStepHeader step="basics" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextField
              disabled={isBusy}
              error={fieldErrors.title}
              label="Title"
              name="title"
              onChange={updateDraft}
              required
              value={draft.title}
            />
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
                {YASHIE_ADMIN_COPY.editor.visibility}
              </span>
              <select
                className={`min-h-11 w-full min-w-0 border bg-white/78 px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] ${
                  fieldErrors.status
                    ? "border-red-400"
                    : "border-[rgba(184,112,81,0.42)]"
                } disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]`}
                disabled={isBusy}
                onChange={(event) =>
                  updateDraft("status", event.currentTarget.value)
                }
                value={draft.status}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldErrors.status ? (
                <span className="text-xs text-red-700">
                  {fieldErrors.status}
                </span>
              ) : null}
            </label>
            <TextField
              disabled={isBusy}
              label="Website link"
              name="slug"
              onChange={(name, value) => {
                setSlugTouched(true);
                updateDraft(name, slugifyYashieContent(value));
              }}
              value={draft.slug}
            />
          </div>
          {renderStepSaveButton()}
        </section>
      ) : null}

      {visibleStep === "details" ? (
        <section className={sectionSurfaceClass}>
          <EditorStepHeader step="details" />
          {collectionKey === "categories" ? (
            <SelectField
              disabled={isBusy}
              label="Section"
              name="category"
              onChange={updateDraft}
              options={categoryGroupOptions}
              placeholder="Choose a section"
              value={draft.category}
            />
          ) : null}
          {collectionKey === "blog" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <SelectField
                disabled={isBusy}
                label="Category"
                name="category"
                onChange={updateDraft}
                options={categoryOptionsFor(categories, "blog", draft.category)}
                placeholder="Choose a category"
                value={draft.category}
              />
              <DateField
                disabled={isBusy}
                label="Date"
                name="date"
                onChange={updateDraft}
                value={draft.date}
              />
              <TextField
                disabled={isBusy}
                label="Reading time"
                name="readTime"
                onChange={updateDraft}
                value={draft.readTime}
              />
            </div>
          ) : null}
          {collectionKey === "gallery" ? (
            <SelectField
              disabled={isBusy}
              label="Category"
              name="type"
              onChange={updateDraft}
              options={categoryOptionsFor(categories, "gallery", draft.type)}
              placeholder="Choose a category"
              value={draft.type}
            />
          ) : null}
          {collectionKey === "shop" ? (
            <TextField
              disabled={isBusy}
              label="Price"
              name="price"
              onChange={updateDraft}
              value={draft.price}
            />
          ) : null}
          {collectionKey === "worlds" ? (
            <SelectField
              disabled={isBusy}
              label="Category"
              name="category"
              onChange={updateDraft}
              options={categoryOptionsFor(categories, "worlds", draft.category)}
              placeholder="Choose a category"
              value={draft.category}
            />
          ) : null}
          <TextAreaField
            disabled={isBusy}
            label={collectionKey === "blog" ? "Short intro" : "Description"}
            name="summary"
            onChange={updateDraft}
            value={draft.summary}
          />
          {renderStepSaveButton()}
        </section>
      ) : null}

      {visibleStep === "writing" ? (
        <section className={sectionSurfaceClass}>
          <EditorStepHeader step="writing" />
          {collectionKey === "blog" || collectionKey === "worlds" ? (
            <TextAreaField
              disabled={isBusy}
              label={collectionKey === "worlds" ? "Detail copy" : "Post body"}
              name="body"
              onChange={updateDraft}
              rows={8}
              value={draft.body}
            />
          ) : null}
          {renderStepSaveButton()}
        </section>
      ) : null}

      {visibleStep === "image" && supportsImage ? (
        <section className={sectionSurfaceClass}>
          <EditorStepHeader step="image" />
          <div>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              {YASHIE_ADMIN_COPY.editor.imageHelp}
            </p>
          </div>
          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
            <div className="relative min-h-48 overflow-hidden border border-[rgba(184,112,81,0.42)] bg-white/58">
              {effectiveItem?.imageUrl && !draft.removeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={effectiveItem.imageAlt}
                  className="h-full min-h-48 w-full object-cover"
                  src={effectiveItem.imageUrl}
                  style={{
                    objectPosition: effectiveItem.imagePosition || "center",
                  }}
                />
              ) : (
                <div className="grid min-h-48 place-items-center px-4 text-center text-sm text-[var(--ink-soft)]">
                  Choose an image when this is ready.
                </div>
              )}
            </div>
            <div className="grid min-w-0 content-start gap-4">
              <TextField
                disabled={isBusy}
                label="Image description"
                name="imageAlt"
                onChange={updateDraft}
                value={draft.imageAlt}
              />
              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
                  Choose image
                </span>
                <input
                  accept="image/*"
                  className="min-h-11 w-full min-w-0 max-w-full border border-[rgba(184,112,81,0.42)] bg-white/78 px-3 py-2 text-sm text-[var(--ink)] disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-[var(--ink-soft)]"
                  disabled={isBusy}
                  name="imageFile"
                  onChange={updateImageFile}
                  type="file"
                />
                {imageFileLabel ? (
                  <span className="text-xs text-[var(--ink-soft)]">
                    {imageFileLabel}
                  </span>
                ) : null}
                {fieldErrors.imageFile ? (
                  <span className="text-xs text-red-700">
                    {fieldErrors.imageFile}
                  </span>
                ) : null}
              </label>
              {effectiveItem?.imageAssetId ? (
                <label className="flex items-center gap-3 border border-[rgba(184,112,81,0.32)] bg-white/58 px-3 py-3 text-sm text-[var(--ink)]">
                  <input
                    checked={draft.removeImage}
                    className="size-4 accent-[var(--clay)]"
                    disabled={isBusy}
                    onChange={(event) =>
                      updateDraft("removeImage", event.currentTarget.checked)
                    }
                    type="checkbox"
                  />
                  Remove the current image
                </label>
              ) : null}
            </div>
          </div>
          {renderStepSaveButton()}
        </section>
      ) : null}

      {visibleStep === "danger" && effectiveItem ? (
        <section className={sectionSurfaceClass}>
          <EditorStepHeader step="danger" />
          {confirmDelete ? (
            <div className="grid gap-3 border border-red-300 bg-red-500/10 p-4">
              <p className="text-sm text-red-800">
                Delete &ldquo;{effectiveItem.title}&rdquo; from this website
                area?
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="min-h-10 bg-red-800 px-4 text-sm font-bold text-white disabled:opacity-50"
                  disabled={isBusy}
                  onClick={() => void deleteItem()}
                  type="button"
                >
                  {deleting ? "Deleting" : YASHIE_ADMIN_COPY.actions.delete}
                </button>
                <button
                  className="button-secondary min-h-10"
                  disabled={isBusy}
                  onClick={() => setConfirmDelete(false)}
                  type="button"
                >
                  {YASHIE_ADMIN_COPY.actions.keep}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="text-sm font-bold text-red-800 underline decoration-red-800/25 underline-offset-4"
              disabled={isBusy}
              onClick={() => setConfirmDelete(true)}
              type="button"
            >
              Delete this {copy.singular}
            </button>
          )}
          {renderStepSaveButton()}
        </section>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[rgba(184,112,81,0.28)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="button-secondary min-w-28 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isBusy || isFirstStep}
          onClick={() => goToStep(-1)}
          type="button"
        >
          Back
        </button>
        <span className="text-center text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          Step {visibleStepIndex + 1} of {editorSteps.length}
        </span>
        <button
          className="button-secondary min-w-28 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isBusy || isLastStep}
          onClick={() => goToStep(1)}
          type="button"
        >
          Next
        </button>
      </div>
    </form>
  );
}

export function YashieAdminDashboard({
  activeSection,
  driveHref,
  initialContent,
  initialNeedsImport = false,
  initialSiteSettings,
  membersHref,
  sessionExpiresAt,
  sessionRefreshEarlySeconds,
  storageAnalytics,
  storageFiles,
  tasksHref,
  userEmail,
}: {
  activeSection: YashieAdminSection;
  driveHref: string;
  initialContent: DashboardContent;
  initialNeedsImport?: boolean;
  initialSiteSettings: YashieAdminSiteSettings;
  membersHref: string;
  sessionExpiresAt: string;
  sessionRefreshEarlySeconds?: number;
  storageAnalytics: YashieStorageAnalyticsState;
  storageFiles: YashieStorageFilesState;
  tasksHref: string;
  userEmail: string | null;
}) {
  const [content, setContent] = useState(initialContent);
  const [editorTarget, setEditorTarget] = useState<EditorTarget | null>(null);
  const [editorBusy, setEditorBusy] = useState(false);
  const [editorDirty, setEditorDirty] = useState(false);
  const [confirmEditorClose, setConfirmEditorClose] = useState(false);
  const [importingSeed, setImportingSeed] = useState(false);
  const [needsImport, setNeedsImport] = useState(initialNeedsImport);
  const [siteSettings, setSiteSettings] = useState(initialSiteSettings);
  const [selectedIds, setSelectedIds] = useState<
    Record<YashieAdminCollectionKey, string | null>
  >({
    worlds: initialContent.worlds[0]?.id ?? null,
    categories: initialContent.categories[0]?.id ?? null,
    blog: initialContent.blog[0]?.id ?? null,
    gallery: initialContent.gallery[0]?.id ?? null,
    shop: initialContent.shop[0]?.id ?? null,
  });

  useEffect(
    () =>
      scheduleYashieAdminSessionRefresh({
        expiresAt: sessionExpiresAt,
        refreshEarlySeconds: sessionRefreshEarlySeconds,
      }),
    [sessionExpiresAt, sessionRefreshEarlySeconds],
  );

  useEffect(() => {
    if (!editorTarget) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [editorTarget]);

  const refreshContent = async () => {
    const nextContent = { ...content };

    await Promise.all(
      contentTabs.map(async (collectionKey) => {
        const response = await adminFetch(
          `/api/admin/content/${collectionKey}`,
          {
            cache: "no-store",
          },
        );
        const payload = (await response
          .json()
          .catch(() => ({}))) as MutationResponse;

        if (response.ok && payload.items) {
          nextContent[collectionKey] = payload.items;
        }
      }),
    );

    setContent(nextContent);
    setNeedsImport(needsYashieStarterContent(nextContent));
    setSelectedIds((current) => {
      const next = { ...current };

      for (const collectionKey of contentTabs) {
        const selectedId = next[collectionKey];
        if (
          !selectedId ||
          !nextContent[collectionKey].some((item) => item.id === selectedId)
        ) {
          next[collectionKey] = nextContent[collectionKey][0]?.id ?? null;
        }
      }

      return next;
    });
  };

  const refreshSiteSettings = async () => {
    const response = await adminFetch("/api/admin/site-settings", {
      cache: "no-store",
    });
    const payload = (await response
      .json()
      .catch(() => ({}))) as SiteSettingsMutationResponse;

    if (response.ok && payload.settings) {
      setSiteSettings(payload.settings);
    }
  };

  const importSeedContent = async () => {
    setImportingSeed(true);

    try {
      const response = await adminFetch("/api/admin/sync/apply", {
        body: JSON.stringify({ force: false, uploadAssets: true }),
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      await Promise.all([refreshContent(), refreshSiteSettings()]);
      toast.success(YASHIE_ADMIN_COPY.importSeed.success);
    } catch {
      toast.error(YASHIE_ADMIN_COPY.errors.importSeed);
    } finally {
      setImportingSeed(false);
    }
  };

  const openEditor = (target: EditorTarget) => {
    setConfirmEditorClose(false);
    setEditorBusy(false);
    setEditorDirty(false);
    setEditorTarget(target);
  };

  const closeEditor = () => {
    setConfirmEditorClose(false);
    setEditorBusy(false);
    setEditorDirty(false);
    setEditorTarget(null);
  };

  const requestCloseEditor = () => {
    const intent = getYashieEditorCloseIntent({
      isBusy: editorBusy,
      isDirty: editorDirty,
    });

    if (intent === "close") {
      closeEditor();
      return;
    }

    if (intent === "warn") {
      setConfirmEditorClose(true);
    }
  };

  const renderContentTab = (collectionKey: YashieAdminCollectionKey) => {
    const items = content[collectionKey];
    const selectedId = selectedIds[collectionKey];

    return (
      <section className="grid min-w-0 gap-6">
        {needsImport && items.length === 0 ? (
          <ImportSeedContentPanel
            importing={importingSeed}
            onImport={() => void importSeedContent()}
          />
        ) : null}
        <ContentList
          collectionKey={collectionKey}
          items={items}
          onNew={() => {
            setSelectedIds((current) => ({
              ...current,
              [collectionKey]: null,
            }));
            openEditor({ collectionKey, itemId: null });
          }}
          onSelect={(id) => {
            setSelectedIds((current) => ({
              ...current,
              [collectionKey]: id,
            }));
            openEditor({ collectionKey, itemId: id });
          }}
          selectedId={selectedId}
        />
      </section>
    );
  };

  const editorItems = editorTarget ? content[editorTarget.collectionKey] : [];
  const editorItem =
    editorTarget?.itemId && editorItems.length > 0
      ? (editorItems.find((item) => item.id === editorTarget.itemId) ?? null)
      : null;

  return (
    <main className="section-band min-h-screen px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid min-w-0 max-w-7xl gap-6">
        <header className="parchment-card overflow-hidden p-5 sm:p-6">
          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <p className="script-label">
                {YASHIE_ADMIN_COPY.dashboard.eyebrow}
              </p>
              <h1 className="break-words font-display text-4xl leading-none text-[var(--navy)] sm:text-6xl">
                {YASHIE_ADMIN_COPY.dashboard.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                {YASHIE_ADMIN_COPY.dashboard.subtitle}
              </p>
            </div>
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <Link
                className="button-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                href={tasksHref}
                rel="noreferrer"
                target="_blank"
              >
                <ListTodo aria-hidden="true" className="size-4" />
                {YASHIE_ADMIN_COPY.tabs.tasks}
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </Link>
              <Link
                className="button-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                href="/"
                prefetch={false}
              >
                <Globe2 aria-hidden="true" className="size-4" />
                {YASHIE_ADMIN_COPY.account.viewSite}
              </Link>
              <form action="/api/auth/logout" className="min-w-0" method="post">
                <button
                  className="button-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                  type="submit"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  {YASHIE_ADMIN_COPY.account.signOut}
                </button>
              </form>
            </div>
          </div>
        </header>

        <nav
          aria-label="Dashboard areas"
          className="flex gap-2 overflow-x-auto border-b border-[rgba(184,112,81,0.34)] pb-3"
        >
          {tabLabels.map((tab) => {
            const Icon = tab.icon;

            return (
              <Link
                aria-current={activeSection === tab.id ? "page" : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap border px-3 text-sm font-black transition sm:min-h-12 sm:border-b-2 sm:px-4 ${
                  activeSection === tab.id
                    ? "border-[var(--clay)] bg-[rgba(164,78,67,0.08)] text-[var(--clay)]"
                    : "border-[rgba(184,112,81,0.28)] bg-white/35 text-[var(--ink-soft)] hover:text-[var(--navy)] sm:border-transparent sm:bg-transparent"
                }`}
                href={getYashieAdminSectionHref(tab.id)}
                key={tab.id}
              >
                <Icon aria-hidden="true" className="size-4" />
                {tab.label}
              </Link>
            );
          })}
          <Link
            className="flex min-h-11 shrink-0 items-center gap-2 border border-[rgba(31,107,115,0.34)] bg-[rgba(31,107,115,0.08)] px-4 text-sm font-black text-[var(--teal)] transition hover:border-[var(--teal)] sm:min-h-12"
            href={tasksHref}
            rel="noreferrer"
            target="_blank"
          >
            <ListTodo aria-hidden="true" className="size-4" />
            {YASHIE_ADMIN_COPY.tabs.tasks}
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </Link>
        </nav>

        {contentTabs.includes(activeSection as YashieAdminCollectionKey)
          ? renderContentTab(activeSection as YashieAdminCollectionKey)
          : null}

        {editorTarget ? (
          <div
            className="fixed inset-0 z-50 grid overscroll-contain bg-[rgba(12,31,52,0.58)] px-3 py-4 backdrop-blur-sm sm:px-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                requestCloseEditor();
              }
            }}
            role="presentation"
          >
            <section
              aria-label={`${editorTarget.itemId ? "Edit" : "Create"} ${sectionCopy[editorTarget.collectionKey].singular}`}
              aria-modal="true"
              className="parchment-card mx-auto grid max-h-[calc(100vh-2rem)] w-full max-w-5xl min-w-0 overscroll-contain self-center overflow-y-auto p-4 shadow-[0_28px_90px_rgba(12,31,52,0.38)] sm:p-5"
              role="dialog"
            >
              <ContentForm
                categories={content.categories}
                collectionKey={editorTarget.collectionKey}
                item={editorItem}
                key={`${editorTarget.collectionKey}-${editorTarget.itemId ?? "new"}`}
                onBusyChange={setEditorBusy}
                onClose={closeEditor}
                onCloseRequest={requestCloseEditor}
                onDeleted={(items) => {
                  setContent((current) => ({
                    ...current,
                    [editorTarget.collectionKey]: items,
                  }));
                  setSelectedIds((current) => ({
                    ...current,
                    [editorTarget.collectionKey]: items[0]?.id ?? null,
                  }));
                }}
                onDirtyChange={setEditorDirty}
                onSaved={(items, savedItem) => {
                  setContent((current) => ({
                    ...current,
                    [editorTarget.collectionKey]: items,
                  }));
                  setSelectedIds((current) => ({
                    ...current,
                    [editorTarget.collectionKey]:
                      savedItem?.id ?? items[0]?.id ?? null,
                  }));
                }}
              />
            </section>
            {confirmEditorClose ? (
              <div
                className="absolute inset-0 z-10 grid place-items-center bg-[rgba(12,31,52,0.36)] px-4"
                role="presentation"
              >
                <section
                  aria-modal="true"
                  className="parchment-card w-full max-w-md p-5 shadow-[0_24px_80px_rgba(12,31,52,0.34)]"
                  role="alertdialog"
                >
                  <p className="script-label">
                    {YASHIE_ADMIN_COPY.editor.unsavedTitle}
                  </p>
                  <h3 className="mt-2 font-display text-4xl leading-none text-[var(--navy)]">
                    {YASHIE_ADMIN_COPY.editor.unsavedHeading}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                    {YASHIE_ADMIN_COPY.editor.unsavedDescription}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      className="button-secondary w-full"
                      onClick={() => setConfirmEditorClose(false)}
                      type="button"
                    >
                      {YASHIE_ADMIN_COPY.editor.keepEditing}
                    </button>
                    <button
                      className="button-primary w-full"
                      onClick={closeEditor}
                      type="button"
                    >
                      {YASHIE_ADMIN_COPY.editor.discardChanges}
                    </button>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeSection === "publish" ? <YashieAdminSyncPanel /> : null}

        {activeSection === "profile" ? (
          <section className="parchment-card min-w-0 p-4 sm:p-5">
            <SiteSettingsPanel
              onSaved={setSiteSettings}
              onRefresh={refreshSiteSettings}
              settings={siteSettings}
            />
          </section>
        ) : null}

        {activeSection === "storage" ? (
          <StoragePanel
            driveHref={driveHref}
            onResourcesChanged={refreshContent}
            storageAnalytics={storageAnalytics}
            storageFiles={storageFiles}
          />
        ) : null}

        {activeSection === "members" ? (
          <MembersPanel membersHref={membersHref} />
        ) : null}

        {activeSection === "account" ? (
          <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="parchment-card min-w-0 p-5 sm:p-6">
              <p className="script-label">
                {YASHIE_ADMIN_COPY.account.signedIn}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <span className="grid size-14 place-items-center bg-[var(--navy)] font-display text-2xl text-[var(--parchment)]">
                  {getInitials(userEmail)}
                </span>
                <div className="min-w-0">
                  <strong className="block truncate text-[var(--ink)]">
                    {userEmail ?? "Website editor"}
                  </strong>
                  <span className="mt-1 block text-sm text-[var(--ink-soft)]">
                    {YASHIE_ADMIN_COPY.account.description}
                  </span>
                </div>
              </div>
            </div>
            <div className="parchment-card grid min-w-0 content-start gap-3 p-5 sm:p-6">
              <Link
                className="button-primary inline-flex w-full items-center justify-center gap-2"
                href="/"
                prefetch={false}
              >
                <Globe2 aria-hidden="true" className="size-4" />
                {YASHIE_ADMIN_COPY.account.viewSite}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="button-secondary inline-flex w-full items-center justify-center gap-2" type="submit">
                  <LogOut aria-hidden="true" className="size-4" />
                  {YASHIE_ADMIN_COPY.account.signOut}
                </button>
              </form>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
