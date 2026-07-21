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
  const [restored, setRestored] = useState(false);
  const summary = diff?.summary;
  const totalOperations =
    (summary?.archive ?? 0) +
    (summary?.create ?? 0) +
    (summary?.delete ?? 0) +
    (summary?.update ?? 0);

  const runDiff = async () => {
    setPendingAction("diff");
    setError(null);
    setRestored(false);
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
    setRestored(false);
    try {
      const result = await postAdminJson<{
        diff?: SyncDiffResponse;
      }>("/api/admin/sync/apply", { force, uploadAssets: false });
      setDiff(result.diff ?? (await postAdminJson<SyncDiffResponse>("/api/admin/sync/diff")));
      setRestored(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Sync request failed.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section className="grid min-w-0 gap-4">
      <div className="parchment-card flex min-w-0 flex-col gap-5 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="script-label">{YASHIE_ADMIN_COPY.publish.title}</p>
            <span className="border border-emerald-700/25 bg-emerald-500/10 px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-emerald-800">
              Live
            </span>
          </div>
          <h2 className="break-words font-display text-3xl leading-none text-[var(--navy)] sm:text-4xl">
            Your saved changes publish automatically
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
            {YASHIE_ADMIN_COPY.publish.description}
          </p>
        </div>
        <div className="grid min-w-[13rem] grid-cols-2 gap-2 text-center text-xs sm:text-sm">
          <div className="border border-[rgba(184,112,81,0.26)] bg-[rgba(255,246,239,0.62)] px-3 py-3">
            <strong className="block text-[var(--navy)]">Immediate</strong>
            <span className="text-[var(--ink-soft)]">Admin updates</span>
          </div>
          <div className="border border-[rgba(184,112,81,0.26)] bg-[rgba(255,246,239,0.62)] px-3 py-3">
            <strong className="block text-[var(--navy)]">Up to 60s</strong>
            <span className="text-[var(--ink-soft)]">Public refresh</span>
          </div>
        </div>
      </div>

      <details className="parchment-card group min-w-0 p-4 sm:p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <p className="font-black text-[var(--navy)]">Starter content recovery</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
              Restore only if original starter items are missing. This is separate from normal publishing.
            </p>
          </div>
          <span className="shrink-0 border border-[rgba(184,112,81,0.3)] px-2 py-1 text-xs font-black uppercase tracking-[0.14em] text-[var(--navy)] group-open:hidden">
            Open
          </span>
          <span className="hidden shrink-0 border border-[rgba(184,112,81,0.3)] px-2 py-1 text-xs font-black uppercase tracking-[0.14em] text-[var(--navy)] group-open:inline">
            Close
          </span>
        </summary>

        <div className="mt-5 grid gap-4 border-t border-[rgba(184,112,81,0.22)] pt-5">
          <div className="flex flex-wrap gap-3">
            <button
              className="button-secondary min-w-36 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={pendingAction !== null}
              onClick={runDiff}
              type="button"
            >
              {pendingAction === "diff" ? "Checking..." : YASHIE_ADMIN_COPY.publish.check}
            </button>
            {diff && !diff.hasDestructiveOperations && totalOperations > 0 ? (
              <button
                className="button-primary min-w-36 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={pendingAction !== null}
                onClick={() => void runApply(false)}
                type="button"
              >
                {pendingAction === "apply" ? "Restoring..." : YASHIE_ADMIN_COPY.publish.push}
              </button>
            ) : null}
          </div>

          {diff ? (
            <div className="grid gap-2 text-sm sm:grid-cols-4">
              {[
                ["Missing", summary?.create ?? 0],
                ["Different", summary?.update ?? 0],
                ["Would hide", summary?.archive ?? 0],
                ["Would remove", summary?.delete ?? 0],
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
                {pendingAction === "apply" ? "Restoring..." : YASHIE_ADMIN_COPY.publish.force}
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

          {restored ? (
            <p className="border border-emerald-700/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800">
              Starter content restored. Your public cache is refreshing now.
            </p>
          ) : null}

          {error ? (
            <div className="border border-red-300 bg-red-500/12 px-3 py-2 text-sm text-red-800">
              <strong className="block">Starter recovery failed</strong>
              <span className="mt-1 block">{error}</span>
            </div>
          ) : null}
        </div>
      </details>
    </section>
  );
}
