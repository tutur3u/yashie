import {
  BookOpenText,
  ExternalLink,
  LayoutDashboard,
  Plus,
} from "lucide-react";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block bg-[rgba(184,112,81,0.13)] motion-safe:animate-pulse ${className}`}
    />
  );
}

export function YashieAdminLoadingPanel() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading Yashie dashboard"
      className="section-band min-h-screen px-3 py-6 sm:px-6 sm:py-8 lg:px-8"
    >
      <div className="mx-auto grid min-w-0 max-w-7xl gap-6">
        <header className="parchment-card grid min-w-0 gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <p className="script-label flex items-center gap-2">
              <LayoutDashboard aria-hidden="true" className="size-4" />
              InkedByYashie
            </p>
            <SkeletonBlock className="mt-3 h-12 w-full max-w-xl sm:h-16" />
            <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl" />
            <SkeletonBlock className="mt-2 h-4 w-3/5 max-w-md" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <SkeletonBlock className="h-11 w-full min-w-28 border border-[rgba(184,112,81,0.24)] bg-white/60 sm:w-28" />
            <SkeletonBlock className="h-11 w-full min-w-28 border border-[rgba(184,112,81,0.24)] bg-white/60 sm:w-28" />
            <SkeletonBlock className="col-span-2 h-11 w-full min-w-28 bg-[rgba(12,31,52,0.16)] sm:w-28" />
          </div>
        </header>

        <div className="flex gap-2 overflow-hidden border-b border-[rgba(184,112,81,0.34)] pb-3">
          {Array.from({ length: 8 }, (_, index) => (
            <SkeletonBlock
              className="h-11 w-24 shrink-0 border border-[rgba(184,112,81,0.22)] bg-white/42"
              key={index}
            />
          ))}
        </div>

        <section className="grid min-w-0 gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="script-label flex items-center gap-2">
                <BookOpenText aria-hidden="true" className="size-4" />
                Preparing your library
              </p>
              <SkeletonBlock className="mt-3 h-12 w-full max-w-lg" />
              <div className="mt-3 flex gap-2">
                <SkeletonBlock className="h-7 w-24" />
                <SkeletonBlock className="h-7 w-16" />
              </div>
            </div>
            <div className="flex min-h-11 items-center justify-center gap-2 border border-[rgba(184,112,81,0.34)] bg-white/58 px-4 text-sm font-bold text-[var(--ink-soft)]">
              <Plus aria-hidden="true" className="size-4" />
              New item
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <article
                className="grid min-h-48 content-start gap-4 border border-[rgba(184,112,81,0.28)] bg-white/58 p-4"
                key={index}
              >
                <div className="flex items-start justify-between gap-3">
                  <SkeletonBlock className="size-16 shrink-0" />
                  <ExternalLink
                    aria-hidden="true"
                    className="size-4 text-[rgba(184,112,81,0.32)]"
                  />
                </div>
                <SkeletonBlock className="h-7 w-4/5" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-2/3" />
              </article>
            ))}
          </div>
        </section>

        <p className="sr-only" role="status">
          Loading your dashboard, content, and workspace tools.
        </p>
      </div>
    </main>
  );
}

export function YashieAdminSectionLoadingPanel() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading dashboard section"
      className="grid min-w-0 gap-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="script-label flex items-center gap-2">
            <BookOpenText aria-hidden="true" className="size-4" />
            Preparing this section
          </p>
          <SkeletonBlock className="mt-3 h-10 w-full max-w-md sm:h-12" />
          <SkeletonBlock className="mt-3 h-4 w-full max-w-xl" />
        </div>
        <SkeletonBlock className="h-11 w-full border border-[rgba(184,112,81,0.24)] bg-white/60 sm:w-36" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <article
            className="parchment-card grid min-h-44 content-start gap-4 p-5"
            key={index}
          >
            <div className="flex items-start justify-between gap-3">
              <SkeletonBlock className="size-14 shrink-0" />
              <SkeletonBlock className="h-7 w-16" />
            </div>
            <SkeletonBlock className="h-6 w-4/5" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-2/3" />
          </article>
        ))}
      </div>

      <p className="sr-only" role="status">
        Loading this dashboard section. Navigation remains available.
      </p>
    </section>
  );
}
