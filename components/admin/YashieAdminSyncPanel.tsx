"use client";

import { useState } from "react";
import { adminFetch } from "./yashie-admin-session-client";
import { YASHIE_ADMIN_COPY } from "./yashie-admin-copy";

async function readAdminError(response: Response) {
  const data = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof data?.error === "string" && data.error.trim()
    ? data.error
    : `Request failed with status ${response.status}`;
}

async function postAdminJson<T>(url: string, body?: unknown) {
  const response = await adminFetch(url, {
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await readAdminError(response));
  }

  return (await response.json()) as T;
}

type SyncDiffResponse = {
  hasDestructiveOperations?: boolean;
  operations?: unknown[];
  summary?: {
    archive?: number;
    create?: number;
    delete?: number;
    noop?: number;
    update?: number;
  };
};

export function YashieAdminSyncPanel() {
  const [diff, setDiff] = useState<SyncDiffResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"apply" | "diff" | null>(null);
  const [publicAssetSync, setPublicAssetSync] = useState<{
    skipped?: unknown[];
    uploaded?: unknown[];
  } | null>(null);
  const summary = diff?.summary;
  const totalOperations =
    (summary?.archive ?? 0) +
    (summary?.create ?? 0) +
    (summary?.delete ?? 0) +
    (summary?.update ?? 0);

  const runDiff = async () => {
    setPendingAction("diff");
    setError(null);
    setPublicAssetSync(null);
    try {
      setDiff(await postAdminJson<SyncDiffResponse>("/api/admin/sync/diff"));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Sync request failed.");
    } finally {
      setPendingAction(null);
    }
  };

  const runApply = async (force: boolean) => {
    setPendingAction("apply");
    setError(null);
    try {
      const result = await postAdminJson<{
        diff?: SyncDiffResponse;
        publicAssetSync?: {
          skipped?: unknown[];
          uploaded?: unknown[];
        };
      }>("/api/admin/sync/apply", { force });
      setPublicAssetSync(result.publicAssetSync ?? null);
      setDiff(result.diff ?? (await postAdminJson<SyncDiffResponse>("/api/admin/sync/diff")));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Sync request failed.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section className="parchment-card grid gap-5 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="script-label">{YASHIE_ADMIN_COPY.publish.title}</p>
          <h2 className="font-display text-4xl leading-none text-[var(--navy)]">
            Share the latest website
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
            {YASHIE_ADMIN_COPY.publish.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="button-secondary min-w-32 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={pendingAction !== null}
            onClick={runDiff}
            type="button"
          >
            {pendingAction === "diff" ? "Checking..." : YASHIE_ADMIN_COPY.publish.check}
          </button>
          <button
            className="button-primary min-w-32 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={pendingAction !== null}
            onClick={() => void runApply(false)}
            type="button"
          >
            {pendingAction === "apply" ? "Sharing..." : YASHIE_ADMIN_COPY.publish.push}
          </button>
        </div>
      </div>

      {diff ? (
        <div className="grid gap-2 text-sm sm:grid-cols-4">
          {[
            ["New", summary?.create ?? 0],
            ["Changed", summary?.update ?? 0],
            ["Hidden", summary?.archive ?? 0],
            ["Removed", summary?.delete ?? 0],
          ].map(([label, value]) => (
            <div
              className="border border-[rgba(184,112,81,0.34)] bg-[rgba(255,246,239,0.62)] px-3 py-2"
              key={label}
            >
              <span className="text-[var(--ink-soft)]">{label}</span>
              <span className="float-right font-black text-[var(--navy)]">{value}</span>
            </div>
          ))}
        </div>
      ) : null}

      {diff?.hasDestructiveOperations ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-red-300 bg-red-500/12 px-3 py-2 text-sm text-red-800">
          <span>{YASHIE_ADMIN_COPY.publish.warning}</span>
          <button
            className="border border-red-300 px-3 py-2 text-xs font-black uppercase tracking-[0.16em]"
            disabled={pendingAction !== null}
            onClick={() => void runApply(true)}
            type="button"
          >
            {YASHIE_ADMIN_COPY.publish.force}
          </button>
        </div>
      ) : null}

      {diff && !diff.hasDestructiveOperations ? (
        <p className="text-sm text-[var(--ink-soft)]">
          {totalOperations === 0
            ? YASHIE_ADMIN_COPY.publish.done
            : `${totalOperations} ${YASHIE_ADMIN_COPY.publish.pending}.`}
        </p>
      ) : null}

      {publicAssetSync ? (
        <p className="text-sm text-[var(--ink-soft)]">
          Prepared {publicAssetSync.uploaded?.length ?? 0} images
          {publicAssetSync.skipped?.length ? `, skipped ${publicAssetSync.skipped.length}` : ""}.
        </p>
      ) : null}

      {error ? (
        <div className="border border-red-300 bg-red-500/12 px-3 py-2 text-sm text-red-800">
          We could not share the latest version. Please try again.
        </div>
      ) : null}
    </section>
  );
}
