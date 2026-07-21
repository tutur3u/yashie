"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Send,
  ShoppingBag,
  Tags,
  UserRoundCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  getYashieAdminSectionHref,
  isYashieAdminSection,
  type YashieAdminSection,
} from "@/lib/yashie-admin-sections";
import { YASHIE_ADMIN_COPY } from "./yashie-admin-copy";

const tabs: Array<{
  icon: LucideIcon;
  id: YashieAdminSection;
  label: string;
}> = [
  { icon: BookOpenText, id: "worlds", label: YASHIE_ADMIN_COPY.tabs.worlds },
  { icon: Tags, id: "categories", label: YASHIE_ADMIN_COPY.tabs.categories },
  { icon: Newspaper, id: "blog", label: YASHIE_ADMIN_COPY.tabs.blog },
  {
    icon: GalleryHorizontalEnd,
    id: "gallery",
    label: YASHIE_ADMIN_COPY.tabs.gallery,
  },
  { icon: ShoppingBag, id: "shop", label: YASHIE_ADMIN_COPY.tabs.shop },
  { icon: UserRoundCog, id: "profile", label: YASHIE_ADMIN_COPY.tabs.profile },
  { icon: Send, id: "publish", label: YASHIE_ADMIN_COPY.tabs.publish },
  { icon: HardDrive, id: "storage", label: YASHIE_ADMIN_COPY.tabs.storage },
  { icon: Users, id: "members", label: YASHIE_ADMIN_COPY.tabs.members },
  {
    icon: CircleUserRound,
    id: "account",
    label: YASHIE_ADMIN_COPY.tabs.account,
  },
];

function readActiveSection(pathname: string): YashieAdminSection | null {
  const section = pathname.split("/").filter(Boolean)[1];
  return isYashieAdminSection(section) ? section : null;
}

export function YashieAdminShell({
  children,
  tasksHref,
}: {
  children: ReactNode;
  tasksHref: string;
}) {
  const activeSection = readActiveSection(usePathname());

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
          {tabs.map((tab) => {
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

        <div className="grid min-w-0 gap-6" id="admin-section-content">
          {children}
        </div>
      </div>
    </main>
  );
}
