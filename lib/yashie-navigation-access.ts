import type { NavTabKey } from "@/app/data/portfolio";
import { getYashieAdminSessionReadState } from "./yashie-admin-api";
import type { YashieContent } from "./yashie-content";

export function isYashieNavTabVisible(
  content: Pick<YashieContent, "navigationTabs">,
  key: NavTabKey,
) {
  return content.navigationTabs.find((tab) => tab.key === key)?.visible ?? true;
}

export function getVisibleYashieNavTabs(
  content: Pick<YashieContent, "navigationTabs">,
) {
  return new Set(
    content.navigationTabs
      .filter((tab) => tab.visible)
      .map((tab) => tab.key),
  );
}

export async function canAccessYashieNavTab(
  content: Pick<YashieContent, "navigationTabs">,
  key: NavTabKey,
) {
  if (isYashieNavTabVisible(content, key)) {
    return true;
  }

  const sessionState = await getYashieAdminSessionReadState().catch(() => null);
  return sessionState?.status === "authenticated";
}
