import Link from "next/link";
import Image from "next/image";

const TUTURUUU_LOGO_URL = "https://tuturuuu.com/media/logos/transparent.png";

export function YashieAdminLoginPanel({ loginHref }: { loginHref: string }) {
	return (
		<main className="section-band min-h-screen px-4 py-8 sm:px-6 lg:px-8">
			<div className="mx-auto grid max-w-7xl gap-6">
				<header className="parchment-card overflow-hidden p-6">
					<p className="script-label">InkedByYashie</p>
					<h1 className="font-display text-5xl leading-none text-[var(--navy)] sm:text-6xl">
						Yashie Dashboard
					</h1>
				</header>

				<section className="parchment-card p-6 sm:p-8">
					<div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_auto] lg:items-end">
						<div className="max-w-2xl">
							<div className="flex items-center gap-3">
								<span className="grid size-14 place-items-center border border-[rgba(184,112,81,0.5)] bg-[rgba(255,246,239,0.58)] p-2">
									<Image
										alt="Tuturuuu logo"
										className="h-auto w-10"
										height={40}
										src={TUTURUUU_LOGO_URL}
										unoptimized
										width={40}
									/>
								</span>
								<span className="text-sm font-black tracking-[0.18em] text-[var(--ink-soft)] uppercase">
									Tuturuuu
								</span>
							</div>
							<p className="script-label mt-5">Admin access</p>
							<h2 className="font-display text-4xl leading-none text-[var(--navy)] sm:text-5xl">
								Login with Tuturuuu
							</h2>
							<p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
								Use your Tuturuuu account to open the dashboard.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<a className="button-primary" href={loginHref}>
								Login with Tuturuuu
							</a>
							<Link className="button-secondary" href="/">
								Back to site
							</Link>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
