export default function AdminLoading() {
  return (
    <main className="section-band min-h-screen px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid min-w-0 max-w-7xl gap-6">
        <section className="parchment-card grid min-w-0 gap-5 p-5 sm:p-6">
          <p className="script-label">InkedByYashie</p>
          <h1 className="break-words font-display text-4xl leading-none text-[var(--navy)] sm:text-6xl">
            Opening the dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Checking the site room, latest content, and file details.
          </p>
          <div className="h-3 overflow-hidden border border-[rgba(184,112,81,0.34)] bg-white/72">
            <div className="h-full w-1/2 animate-pulse bg-[var(--clay)]" />
          </div>
        </section>
      </div>
    </main>
  );
}
