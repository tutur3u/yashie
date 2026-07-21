import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import {
  buildYashieContent,
  DEFAULT_YASHIE_CONTENT,
  type YashieDeliveryPayload,
} from "./yashie-content";
import { getOptionalYashieWorkspaceId, getYashieApiBaseUrl } from "./yashie-config";
import { YASHIE_DELIVERY_CACHE_TAG } from "./yashie-cache";

async function getCachedDeliveryPayload(
  workspaceId: string,
  apiBaseUrl: string,
) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 60 * 60 });
  cacheTag(YASHIE_DELIVERY_CACHE_TAG);

  const response = await fetch(
    `${apiBaseUrl.replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/delivery`,
  );

  if (!response.ok) {
    throw new Error(`Yashie delivery failed with status ${response.status}`);
  }

  return {
    apiBaseUrl,
    delivery: (await response.json()) as YashieDeliveryPayload,
  };
}

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
