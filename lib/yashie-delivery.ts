import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  buildYashieContent,
  DEFAULT_YASHIE_CONTENT,
  type YashieDeliveryPayload,
} from "./yashie-content";
import { getOptionalYashieWorkspaceId, getYashieApiBaseUrl } from "./yashie-config";
import { YASHIE_DELIVERY_CACHE_TAG } from "./yashie-cache";

const DELIVERY_REVALIDATE_SECONDS = 60;

async function fetchDeliveryPayload(workspaceId: string, apiBaseUrl: string) {
  const response = await fetch(
    `${apiBaseUrl.replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/delivery`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Yashie delivery failed with status ${response.status}`);
  }

  return {
    apiBaseUrl,
    delivery: (await response.json()) as YashieDeliveryPayload,
  };
}

const getCachedDeliveryPayload = unstable_cache(
  fetchDeliveryPayload,
  [YASHIE_DELIVERY_CACHE_TAG],
  {
    revalidate: DELIVERY_REVALIDATE_SECONDS,
    tags: [YASHIE_DELIVERY_CACHE_TAG],
  },
);

export async function getUncachedYashieContent() {
  try {
    const workspaceId = getOptionalYashieWorkspaceId();

    if (!workspaceId) {
      return DEFAULT_YASHIE_CONTENT;
    }

    const payload = await getCachedDeliveryPayload(workspaceId, getYashieApiBaseUrl());

    return buildYashieContent(payload.delivery, {
      apiBaseUrl: payload.apiBaseUrl,
    });
  } catch {
    return DEFAULT_YASHIE_CONTENT;
  }
}

export const getYashieContent = cache(getUncachedYashieContent);
