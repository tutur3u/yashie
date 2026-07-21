"use client";

export type RefreshSessionResponse = {
  expiresAt?: string;
  refreshEarlySeconds?: number;
  valid?: boolean;
};

const FALLBACK_REFRESH_DELAY_MS = 5 * 60 * 1000;
const DEFAULT_REFRESH_LEAD_SECONDS = 30;
const MIN_REFRESH_LEAD_SECONDS = 5;

let pendingRefresh: Promise<RefreshSessionResponse | null> | null = null;

export function getYashieAdminSessionRefreshLeadSeconds(
  refreshEarlySeconds?: number | null,
) {
  const requested =
    typeof refreshEarlySeconds === "number" && Number.isFinite(refreshEarlySeconds)
      ? refreshEarlySeconds
      : DEFAULT_REFRESH_LEAD_SECONDS;

  return Math.max(MIN_REFRESH_LEAD_SECONDS, requested);
}

export function getYashieAdminSessionRefreshDelayMs({
  expiresAt,
  now = Date.now(),
  refreshEarlySeconds,
}: {
  expiresAt: string;
  now?: number;
  refreshEarlySeconds?: number | null;
}) {
  const expiresAtMs = new Date(expiresAt).getTime();

  if (!Number.isFinite(expiresAtMs)) {
    return FALLBACK_REFRESH_DELAY_MS;
  }

  const remainingMs = expiresAtMs - now;
  const requestedLeadMs =
    getYashieAdminSessionRefreshLeadSeconds(refreshEarlySeconds) * 1000;
  const safeLeadMs = Math.min(
    requestedLeadMs,
    Math.max(MIN_REFRESH_LEAD_SECONDS * 1000, Math.floor(remainingMs / 2)),
  );

  return Math.max(0, remainingMs - safeLeadMs);
}

async function requestYashieAdminSessionRefresh() {
  try {
    const response = await fetch("/api/auth/session/refresh", {
      cache: "no-store",
      credentials: "same-origin",
      method: "POST",
    });
    const payload = (await response.json().catch(() => null)) as
      | RefreshSessionResponse
      | null;

    return response.ok && payload?.valid ? payload : null;
  } catch {
    return null;
  }
}

export function refreshYashieAdminSession() {
  if (!pendingRefresh) {
    pendingRefresh = requestYashieAdminSessionRefresh().finally(() => {
      pendingRefresh = null;
    });
  }

  return pendingRefresh;
}

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const response = await fetch(input, {
    ...init,
    credentials: init.credentials ?? "same-origin",
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshYashieAdminSession();

  if (!refreshed) {
    return response;
  }

  return fetch(input, {
    ...init,
    credentials: init.credentials ?? "same-origin",
  });
}

export function scheduleYashieAdminSessionRefresh({
  expiresAt,
  onRefresh,
  refreshEarlySeconds,
}: {
  expiresAt: string;
  onRefresh?: (payload: RefreshSessionResponse) => void;
  refreshEarlySeconds?: number | null;
}) {
  let cancelled = false;
  let currentExpiresAt = expiresAt;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const schedule = (nextExpiresAt: string) => {
    if (cancelled) return;
    if (timeout) clearTimeout(timeout);

    currentExpiresAt = nextExpiresAt;
    timeout = setTimeout(
      () => void refreshNow(),
      getYashieAdminSessionRefreshDelayMs({
        expiresAt: currentExpiresAt,
        refreshEarlySeconds,
      }),
    );
  };

  const refreshNow = async () => {
    const payload = await refreshYashieAdminSession();

    if (cancelled) return;

    if (payload?.expiresAt) {
      onRefresh?.(payload);
      schedule(payload.expiresAt);
      return;
    }

    schedule(new Date(Date.now() + FALLBACK_REFRESH_DELAY_MS).toISOString());
  };

  const refreshIfNeeded = () => {
    if (cancelled) return;

    if (
      typeof document !== "undefined" &&
      document.visibilityState === "hidden"
    ) {
      return;
    }

    const delay = getYashieAdminSessionRefreshDelayMs({
      expiresAt: currentExpiresAt,
      refreshEarlySeconds,
    });

    if (delay <= 0) {
      void refreshNow();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("focus", refreshIfNeeded);
  }

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", refreshIfNeeded);
  }

  schedule(expiresAt);

  return () => {
    cancelled = true;
    if (timeout) clearTimeout(timeout);
    if (typeof window !== "undefined") {
      window.removeEventListener("focus", refreshIfNeeded);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", refreshIfNeeded);
    }
  };
}
