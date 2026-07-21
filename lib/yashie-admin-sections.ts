export const YASHIE_ADMIN_SECTIONS = [
  "worlds",
  "categories",
  "blog",
  "gallery",
  "shop",
  "profile",
  "publish",
  "storage",
  "members",
  "account",
] as const;

export type YashieAdminSection = (typeof YASHIE_ADMIN_SECTIONS)[number];

export const YASHIE_ADMIN_CONTENT_SECTIONS = [
  "worlds",
  "categories",
  "blog",
  "gallery",
  "shop",
] as const satisfies readonly YashieAdminSection[];

export function isYashieAdminSection(
  value: string | null | undefined,
): value is YashieAdminSection {
  return YASHIE_ADMIN_SECTIONS.includes(value as YashieAdminSection);
}

export function isYashieAdminStudioSection(section: YashieAdminSection) {
  return (
    section === "profile" ||
    YASHIE_ADMIN_CONTENT_SECTIONS.includes(
      section as (typeof YASHIE_ADMIN_CONTENT_SECTIONS)[number],
    )
  );
}

export function getYashieAdminSectionHref(section: YashieAdminSection) {
  return `/admin/${section}`;
}
