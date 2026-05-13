import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { YashieAdminSyncPanel } from "@/components/admin/YashieAdminSyncPanel";
import { author, blogPosts, galleryItems, products, socials, worlds } from "@/app/data/portfolio";
import {
  buildYashieAdminLinks,
  getYashieAdminLoginPath,
  resolveYashieAdminTargetKey,
} from "@/lib/yashie-config";
import { yashieExternalProjectManifest } from "@/lib/yashie-external-project-manifest";
import { getYashieSessionFromCookies } from "@/lib/yashie-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yashie Admin Center",
  description: "Centralized Tuturuuu admin dashboard for InkedByYashie content.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ target?: string }>;
}) {
  const session = await getYashieSessionFromCookies();
  const resolvedSearchParams = await searchParams;
  const activeTarget = resolveYashieAdminTargetKey(resolvedSearchParams?.target);

  if (!session) {
    redirect(getYashieAdminLoginPath(activeTarget));
  }

  const adminLinks = buildYashieAdminLinks();
  const collectionCount = yashieExternalProjectManifest.schema.collections.length;
  const entryCount = yashieExternalProjectManifest.content.entries.length;
  const assetCount = yashieExternalProjectManifest.content.entries.reduce(
    (count, entry) => count + ("assets" in entry ? (entry.assets?.length ?? 0) : 0),
    0,
  );

  return (
    <main className="section-band min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="parchment-card flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="script-label">Tuturuuu Admin</p>
            <h1 className="font-display text-5xl leading-none text-[var(--navy)]">
              Yashie CMS Control Room
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              Signed in as {session.user.email ?? session.user.id}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="button-secondary" href="/">
              Back to site
            </Link>
            <form action="/api/auth/logout" method="post">
              <button className="button-primary" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {adminLinks.map((link) => (
            <a
              className={`parchment-card flex min-h-40 flex-col gap-3 p-4 transition hover:-translate-y-1 hover:border-[var(--gold)] ${
                link.key === activeTarget ? "border-[var(--gold)] bg-[var(--parchment-rose)]" : ""
              }`}
              href={link.cmsHref}
              key={link.key}
              rel="noreferrer"
              target="_blank"
            >
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--clay)]">
                {link.label}
              </span>
              <strong className="font-display text-2xl leading-tight text-[var(--navy)]">
                {link.actionLabel}
              </strong>
              <span className="text-sm leading-6 text-[var(--ink-soft)]">{link.description}</span>
            </a>
          ))}
        </section>

        <YashieAdminSyncPanel />

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="parchment-card p-5">
            <p className="script-label">Local manifest</p>
            <h2 className="font-display text-4xl leading-none text-[var(--navy)]">
              Seed data coverage
            </h2>
            <div className="mt-5 grid gap-3 text-sm">
              {[
                ["Collections", collectionCount],
                ["Entries", entryCount],
                ["Public assets", assetCount],
              ].map(([label, value]) => (
                <div
                  className="flex items-center justify-between border-b border-[rgba(184,112,81,0.25)] py-2"
                  key={label}
                >
                  <span className="text-[var(--ink-soft)]">{label}</span>
                  <strong className="font-display text-2xl text-[var(--navy)]">{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="parchment-card p-5">
            <p className="script-label">Current site model</p>
            <h2 className="font-display text-4xl leading-none text-[var(--navy)]">
              {author.brand}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
              This admin bridge turns the existing static Yashie portfolio into a Tuturuuu
              external project. Push the manifest first to seed CMS collections, then use the
              CMS links above for ongoing edits and review.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Worlds", worlds.length],
                ["Gallery", galleryItems.length],
                ["Blog", blogPosts.length],
                ["Shop", products.length],
                ["Social", socials.length],
              ].map(([label, value]) => (
                <div
                  className="border border-[rgba(184,112,81,0.34)] bg-[rgba(255,246,239,0.62)] px-3 py-3"
                  key={label}
                >
                  <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[var(--clay)]">
                    {label}
                  </span>
                  <strong className="mt-2 block font-display text-3xl leading-none text-[var(--navy)]">
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
