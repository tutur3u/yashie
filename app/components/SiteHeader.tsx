"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { author, navItems } from "@/app/data/portfolio";

function isActivePath(pathname: string, href: string) {
	if (href === "/") {
		return pathname === "/";
	}

	if (href.startsWith("/#")) {
		return false;
	}

	return pathname === href;
}

export function SiteHeader() {
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-50 border-b border-[var(--copper)] bg-[var(--navy)] text-[var(--parchment)] shadow-[0_10px_30px_rgba(14,38,61,0.18)]">
			<div className="edge-frame mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
				<Link
					href="/"
					className="group flex items-center gap-3"
					aria-label="Yashoda U. Itwaru home"
				>
					<span className="grid size-14 shrink-0 place-items-center border border-[var(--gold)] bg-[rgba(239,207,178,0.08)] text-3xl text-[var(--gold)] transition group-hover:bg-[rgba(239,207,178,0.14)]">
						&#10043;
					</span>
					<span>
						<span className="block font-display text-2xl leading-none text-[var(--gold)] sm:text-3xl">
							{author.name}
						</span>
						<span className="mt-1 block text-xs font-bold uppercase tracking-[0.42em] text-[var(--parchment-soft)]">
							{author.brand}
						</span>
					</span>
				</Link>

				<nav
					aria-label="Main navigation"
					className="flex flex-wrap gap-2 pb-1 lg:justify-end lg:pb-0"
				>
					{navItems.map((item) => {
						const active = isActivePath(pathname, item.href);

						return (
							<Link
								key={item.href}
								href={item.href}
								aria-current={active ? "page" : undefined}
								className={`nav-link ${active ? "nav-link-active" : ""}`}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>
		</header>
	);
}
