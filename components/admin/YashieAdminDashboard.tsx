"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import type {
  YashieAdminCollectionKey,
  YashieAdminContentItem,
  YashieContentStatus,
} from "@/lib/yashie-admin-content-model";
import { slugifyYashieContent } from "@/lib/yashie-admin-content-model";
import { YashieAdminSyncPanel } from "./YashieAdminSyncPanel";
import { YASHIE_ADMIN_COPY } from "./yashie-admin-copy";

type AdminTab = YashieAdminCollectionKey | "account" | "publish";

type DashboardContent = Record<YashieAdminCollectionKey, YashieAdminContentItem[]>;

type Draft = {
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

type MutationResponse = {
  error?: string;
  errors?: Record<string, string>;
  item?: YashieAdminContentItem | null;
  items?: YashieAdminContentItem[];
};

const contentTabs: YashieAdminCollectionKey[] = ["blog", "gallery", "shop"];

const tabLabels: Array<{ id: AdminTab; label: string }> = [
  { id: "blog", label: YASHIE_ADMIN_COPY.tabs.blog },
  { id: "gallery", label: YASHIE_ADMIN_COPY.tabs.gallery },
  { id: "shop", label: YASHIE_ADMIN_COPY.tabs.shop },
  { id: "publish", label: YASHIE_ADMIN_COPY.tabs.publish },
  { id: "account", label: YASHIE_ADMIN_COPY.tabs.account },
];

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
};

const statusOptions: Array<{ label: string; value: YashieContentStatus }> = [
  { label: YASHIE_ADMIN_COPY.visibility.draft, value: "draft" },
  { label: YASHIE_ADMIN_COPY.visibility.published, value: "published" },
  { label: YASHIE_ADMIN_COPY.visibility.archived, value: "archived" },
  { label: YASHIE_ADMIN_COPY.visibility.scheduled, value: "scheduled" },
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

function TextField<TName extends keyof Draft>({
  error,
  label,
  name,
  onChange,
  placeholder,
  required,
  value,
}: {
  error?: string;
  label: string;
  name: TName;
  onChange: (name: TName, value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
        {label}
      </span>
      <input
        className={`min-h-11 border bg-white/78 px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] ${
          error ? "border-red-400" : "border-[rgba(184,112,81,0.42)]"
        }`}
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

function TextAreaField<TName extends keyof Draft>({
  label,
  name,
  onChange,
  placeholder,
  rows = 4,
  value,
}: {
  label: string;
  name: TName;
  onChange: (name: TName, value: string) => void;
  placeholder?: string;
  rows?: number;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--clay)]">
        {label}
      </span>
      <textarea
        className="min-h-28 resize-y border border-[rgba(184,112,81,0.42)] bg-white/78 px-3 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition focus:border-[var(--gold)]"
        name={name}
        onChange={(event) => onChange(name, event.currentTarget.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
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
    <aside className="grid content-start gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="script-label">{copy.listTitle}</p>
          <h2 className="font-display text-4xl leading-none text-[var(--navy)]">
            Choose one
          </h2>
        </div>
        <button
          className={`min-h-11 border px-4 text-sm font-bold transition ${
            selectedId === null
              ? "border-[var(--gold)] bg-[var(--navy)] text-[var(--parchment)]"
              : "border-[rgba(184,112,81,0.48)] bg-white/72 text-[var(--copper-dark)] hover:border-[var(--gold)]"
          }`}
          onClick={onNew}
          type="button"
        >
          {copy.newLabel}
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-2">
          {items.map((item) => (
            <button
              className={`grid gap-3 border p-4 text-left transition ${
                selectedId === item.id
                  ? "border-[var(--gold)] bg-white shadow-[0_18px_46px_rgba(82,40,37,0.12)]"
                  : "border-[rgba(184,112,81,0.38)] bg-white/70 hover:border-[var(--copper)]"
              }`}
              key={item.id}
              onClick={() => onSelect(item.id)}
              type="button"
            >
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
              <div>
                <strong className="block text-base text-[var(--ink)]">{item.title}</strong>
                <span className="mt-1 block text-sm text-[var(--ink-soft)]">
                  {collectionKey === "blog"
                    ? item.category || "Post"
                    : collectionKey === "gallery"
                      ? item.type || "Gallery piece"
                      : item.price || "Shop item"}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-[rgba(184,112,81,0.5)] bg-white/68 p-6">
          <h3 className="font-display text-3xl leading-none text-[var(--navy)]">
            Nothing here yet.
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{copy.empty}</p>
        </div>
      )}
    </aside>
  );
}

function ContentForm({
  collectionKey,
  item,
  onDeleted,
  onSaved,
}: {
  collectionKey: YashieAdminCollectionKey;
  item: YashieAdminContentItem | null;
  onDeleted: (items: YashieAdminContentItem[]) => void;
  onSaved: (items: YashieAdminContentItem[], item: YashieAdminContentItem | null) => void;
}) {
  const copy = sectionCopy[collectionKey];
  const [draft, setDraft] = useState(() => draftFromItem(item));
  const [slugTouched, setSlugTouched] = useState(Boolean(item));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileLabel, setImageFileLabel] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateDraft = (name: keyof Draft, value: string | boolean) => {
    setDraft((current) => {
      const next = { ...current, [name]: value };

      if (name === "title" && typeof value === "string" && !slugTouched && !item) {
        next.slug = slugifyYashieContent(value);
      }

      return next;
    });
  };

  const updateImageFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;
    setImageFile(file);
    setImageFileLabel(file ? `${file.name} (${Math.round(file.size / 1024)} KB)` : "");

    if (file) {
      setDraft((current) => ({ ...current, removeImage: false }));
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setMessage(null);

    const body = new FormData();
    for (const [key, value] of Object.entries(draft)) {
      body.set(key, typeof value === "boolean" ? String(value) : value);
    }

    if (imageFile) {
      body.set("imageFile", imageFile);
    }

    try {
      const response = await fetch(
        item
          ? `/api/admin/content/${collectionKey}/${encodeURIComponent(item.id)}`
          : `/api/admin/content/${collectionKey}`,
        {
          body,
          method: item ? "PATCH" : "POST",
        },
      );
      const payload = (await response.json().catch(() => ({}))) as MutationResponse;

      if (!response.ok) {
        setFieldErrors(payload.errors ?? {});
        setMessage(readFriendlyError(payload, YASHIE_ADMIN_COPY.errors.save));
        return;
      }

      onSaved(payload.items ?? [], payload.item ?? null);
      setMessage("Saved.");
      setImageFile(null);
      setImageFileLabel("");
      setDraft((current) => ({ ...current, removeImage: false }));
    } catch {
      setMessage(YASHIE_ADMIN_COPY.errors.save);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async () => {
    if (!item) return;

    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/content/${collectionKey}/${encodeURIComponent(item.id)}`,
        {
          method: "DELETE",
        },
      );
      const payload = (await response.json().catch(() => ({}))) as MutationResponse;

      if (!response.ok) {
        setMessage(YASHIE_ADMIN_COPY.errors.delete);
        return;
      }

      onDeleted(payload.items ?? []);
    } catch {
      setMessage(YASHIE_ADMIN_COPY.errors.delete);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form className="grid gap-6" onSubmit={submit}>
      <div className="flex flex-col gap-4 border-b border-[rgba(184,112,81,0.28)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="script-label">{item ? `Edit ${copy.singular}` : copy.newLabel}</p>
          <h2 className="font-display text-5xl leading-none text-[var(--navy)]">
            {draft.title || `Untitled ${copy.singular}`}
          </h2>
        </div>
        <button
          className="button-primary min-w-28 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting || deleting}
          type="submit"
        >
          {submitting ? YASHIE_ADMIN_COPY.actions.saving : YASHIE_ADMIN_COPY.actions.save}
        </button>
      </div>

      {message ? (
        <div className="border border-[rgba(184,112,81,0.34)] bg-white/68 px-4 py-3 text-sm text-[var(--ink-soft)]">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--clay)]">
            {YASHIE_ADMIN_COPY.editor.basics}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextField
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
                className={`min-h-11 border bg-white/78 px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] ${
                  fieldErrors.status ? "border-red-400" : "border-[rgba(184,112,81,0.42)]"
                }`}
                onChange={(event) => updateDraft("status", event.currentTarget.value)}
                value={draft.status}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldErrors.status ? (
                <span className="text-xs text-red-700">{fieldErrors.status}</span>
              ) : null}
            </label>
            <TextField
              label="Website link"
              name="slug"
              onChange={(name, value) => {
                setSlugTouched(true);
                updateDraft(name, slugifyYashieContent(value));
              }}
              value={draft.slug}
            />
            <TextField
              label="Image focus"
              name="imagePosition"
              onChange={updateDraft}
              placeholder="center"
              value={draft.imagePosition}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--clay)]">
          {YASHIE_ADMIN_COPY.editor.details}
        </p>
        {collectionKey === "blog" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <TextField
              label="Category"
              name="category"
              onChange={updateDraft}
              value={draft.category}
            />
            <TextField label="Date" name="date" onChange={updateDraft} value={draft.date} />
            <TextField
              label="Reading time"
              name="readTime"
              onChange={updateDraft}
              value={draft.readTime}
            />
          </div>
        ) : null}
        {collectionKey === "gallery" ? (
          <TextField label="Kind" name="type" onChange={updateDraft} value={draft.type} />
        ) : null}
        {collectionKey === "shop" ? (
          <TextField label="Price" name="price" onChange={updateDraft} value={draft.price} />
        ) : null}
        <TextAreaField
          label={collectionKey === "blog" ? "Short intro" : "Description"}
          name="summary"
          onChange={updateDraft}
          value={draft.summary}
        />
        {collectionKey === "blog" ? (
          <TextAreaField
            label="Post body"
            name="body"
            onChange={updateDraft}
            rows={8}
            value={draft.body}
          />
        ) : null}
      </section>

      <section className="grid gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--clay)]">
            {YASHIE_ADMIN_COPY.editor.image}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            {YASHIE_ADMIN_COPY.editor.imageHelp}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="relative min-h-48 overflow-hidden border border-[rgba(184,112,81,0.42)] bg-white/58">
            {item?.imageUrl && !draft.removeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={item.imageAlt}
                className="h-full min-h-48 w-full object-cover"
                src={item.imageUrl}
                style={{ objectPosition: item.imagePosition || "center" }}
              />
            ) : (
              <div className="grid min-h-48 place-items-center px-4 text-center text-sm text-[var(--ink-soft)]">
                Choose an image when this is ready.
              </div>
            )}
          </div>
          <div className="grid content-start gap-4">
            <TextField
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
                className="min-h-11 border border-[rgba(184,112,81,0.42)] bg-white/78 px-3 py-2 text-sm text-[var(--ink)]"
                name="imageFile"
                onChange={updateImageFile}
                type="file"
              />
              {imageFileLabel ? (
                <span className="text-xs text-[var(--ink-soft)]">{imageFileLabel}</span>
              ) : null}
              {fieldErrors.imageFile ? (
                <span className="text-xs text-red-700">{fieldErrors.imageFile}</span>
              ) : null}
            </label>
            {item?.imageAssetId ? (
              <label className="flex items-center gap-3 border border-[rgba(184,112,81,0.32)] bg-white/58 px-3 py-3 text-sm text-[var(--ink)]">
                <input
                  checked={draft.removeImage}
                  className="size-4 accent-[var(--clay)]"
                  onChange={(event) => updateDraft("removeImage", event.currentTarget.checked)}
                  type="checkbox"
                />
                Remove the current image
              </label>
            ) : null}
          </div>
        </div>
      </section>

      {item ? (
        <section className="border-t border-[rgba(184,112,81,0.28)] pt-5">
          {confirmDelete ? (
            <div className="grid gap-3 border border-red-300 bg-red-500/10 p-4">
              <p className="text-sm text-red-800">
                Delete &ldquo;{item.title}&rdquo; from this website area?
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="min-h-10 bg-red-800 px-4 text-sm font-bold text-white disabled:opacity-50"
                  disabled={deleting || submitting}
                  onClick={() => void deleteItem()}
                  type="button"
                >
                  {deleting ? "Deleting" : YASHIE_ADMIN_COPY.actions.delete}
                </button>
                <button
                  className="button-secondary min-h-10"
                  disabled={deleting}
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
              disabled={submitting || deleting}
              onClick={() => setConfirmDelete(true)}
              type="button"
            >
              Delete this {copy.singular}
            </button>
          )}
        </section>
      ) : null}
    </form>
  );
}

export function YashieAdminDashboard({
  initialContent,
  userEmail,
}: {
  initialContent: DashboardContent;
  userEmail: string | null;
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>("blog");
  const [content, setContent] = useState(initialContent);
  const [selectedIds, setSelectedIds] = useState<Record<YashieAdminCollectionKey, string | null>>({
    blog: initialContent.blog[0]?.id ?? null,
    gallery: initialContent.gallery[0]?.id ?? null,
    shop: initialContent.shop[0]?.id ?? null,
  });

  const renderContentTab = (collectionKey: YashieAdminCollectionKey) => {
    const items = content[collectionKey];
    const selectedId = selectedIds[collectionKey];
    const selectedItem = selectedId
      ? items.find((item) => item.id === selectedId) ?? null
      : null;

    return (
      <section className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
        <ContentList
          collectionKey={collectionKey}
          items={items}
          onNew={() =>
            setSelectedIds((current) => ({
              ...current,
              [collectionKey]: null,
            }))
          }
          onSelect={(id) =>
            setSelectedIds((current) => ({
              ...current,
              [collectionKey]: id,
            }))
          }
          selectedId={selectedId}
        />
        <div className="parchment-card p-5">
          <ContentForm
            collectionKey={collectionKey}
            item={selectedItem}
            key={selectedItem?.id ?? `new-${collectionKey}`}
            onDeleted={(items) => {
              setContent((current) => ({ ...current, [collectionKey]: items }));
              setSelectedIds((current) => ({
                ...current,
                [collectionKey]: items[0]?.id ?? null,
              }));
            }}
            onSaved={(items, savedItem) => {
              setContent((current) => ({ ...current, [collectionKey]: items }));
              setSelectedIds((current) => ({
                ...current,
                [collectionKey]: savedItem?.id ?? items[0]?.id ?? null,
              }));
            }}
          />
        </div>
      </section>
    );
  };

  return (
    <main className="section-band min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="parchment-card overflow-hidden p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="script-label">{YASHIE_ADMIN_COPY.dashboard.eyebrow}</p>
              <h1 className="font-display text-5xl leading-none text-[var(--navy)] sm:text-6xl">
                {YASHIE_ADMIN_COPY.dashboard.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                {YASHIE_ADMIN_COPY.dashboard.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="button-secondary" href="/">
                {YASHIE_ADMIN_COPY.account.viewSite}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="button-primary" type="submit">
                  {YASHIE_ADMIN_COPY.account.signOut}
                </button>
              </form>
            </div>
          </div>
        </header>

        <nav
          aria-label="Dashboard areas"
          className="flex flex-wrap gap-2 border-b border-[rgba(184,112,81,0.34)]"
        >
          {tabLabels.map((tab) => (
            <button
              className={`min-h-12 border-b-2 px-4 text-sm font-black transition ${
                activeTab === tab.id
                  ? "border-[var(--clay)] text-[var(--clay)]"
                  : "border-transparent text-[var(--ink-soft)] hover:text-[var(--navy)]"
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {contentTabs.includes(activeTab as YashieAdminCollectionKey)
          ? renderContentTab(activeTab as YashieAdminCollectionKey)
          : null}

        {activeTab === "publish" ? <YashieAdminSyncPanel /> : null}

        {activeTab === "account" ? (
          <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="parchment-card p-6">
              <p className="script-label">{YASHIE_ADMIN_COPY.account.signedIn}</p>
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
            <div className="parchment-card grid content-start gap-3 p-6">
              <Link className="button-primary" href="/">
                {YASHIE_ADMIN_COPY.account.viewSite}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="button-secondary w-full" type="submit">
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
