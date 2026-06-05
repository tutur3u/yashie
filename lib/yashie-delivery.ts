import { cache } from "react";
import {
  buildYashieContent,
  DEFAULT_YASHIE_CONTENT,
  type YashieDeliveryPayload,
} from "./yashie-content";
import { getOptionalYashieWorkspaceId, getYashieApiBaseUrl } from "./yashie-config";

const DELIVERY_REVALIDATE_SECONDS = 60;

async function fetchDeliveryPayload() {
  const workspaceId = getOptionalYashieWorkspaceId();

  if (!workspaceId) {
    return null;
  }

  const apiBaseUrl = getYashieApiBaseUrl();
  const response = await fetch(
    `${apiBaseUrl.replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/delivery`,
    {
      cache: "force-cache",
      next: {
        revalidate: DELIVERY_REVALIDATE_SECONDS,
      },
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

export async function getUncachedYashieContent() {
  try {
    const payload = await fetchDeliveryPayload();

    if (!payload) {
      return DEFAULT_YASHIE_CONTENT;
    }

    return buildYashieContent(payload.delivery, {
      apiBaseUrl: payload.apiBaseUrl,
    });
  } catch {
    return DEFAULT_YASHIE_CONTENT;
  }
}

export const getYashieContent = cache(getUncachedYashieContent);
