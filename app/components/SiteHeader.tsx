"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { YashieContent } from "@/lib/yashie-content";

function isActivePath(pathname: string, href: string) {
	if (href === "/") {
		return pathname === "/";
	}

	if (href.startsWith("/#")) {
		return false;
	}

	return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({
	author,
	navItems,
}: {
	author: YashieContent["author"];
	navItems: YashieContent["navItems"];
}) {
	const pathname = usePathname();
	const [openAtPath, setOpenAtPath] = useState<string | null>(null);
	const menuOpen = openAtPath === pathname;
	const closeMenu = () => setOpenAtPath(null);
	const toggleMenu = () => {
		setOpenAtPath((currentPath) => (currentPath === pathname ? null : pathname));
	};

	useEffect(() => {
		if (!menuOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpenAtPath(null);
			}
		};

		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [menuOpen]);

	return (
		<header className="sticky top-0 z-50 border-b border-[var(--copper)] bg-[var(--navy)] text-[var(--parchment)] shadow-[0_10px_30px_rgba(14,38,61,0.18)]">
			<div className="edge-frame mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-4 lg:px-8">
				<Link
					href="/"
					className="group flex min-w-0 items-center gap-2 sm:gap-3"
					aria-label="Yashoda U. Itwaru home"
				>
					<span className="grid size-11 shrink-0 place-items-center border border-[var(--gold)] bg-[rgba(239,207,178,0.08)] text-2xl text-[var(--gold)] transition group-hover:bg-[rgba(239,207,178,0.14)] sm:size-14 sm:text-3xl">
						&#10043;
					</span>
					<span className="min-w-0">
						<span className="block truncate font-display text-xl leading-none text-[var(--gold)] sm:text-3xl">
							{author.name}
						</span>
						<span className="mt-1 block truncate text-[0.58rem] font-bold uppercase tracking-[0.24em] text-[var(--parchment-soft)] sm:text-xs sm:tracking-[0.42em]">
							{author.brand}
						</span>
					</span>
				</Link>

				<nav
					aria-label="Main navigation"
					className="hidden flex-wrap gap-2 lg:flex lg:justify-end"
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

				<button
					type="button"
					className="grid size-11 shrink-0 place-items-center border border-[rgba(217,167,91,0.72)] bg-[rgba(239,207,178,0.08)] text-[var(--gold)] transition hover:bg-[rgba(239,207,178,0.16)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--navy)] lg:hidden"
					aria-label={menuOpen ? "Close navigation" : "Open navigation"}
					aria-controls="mobile-navigation"
					aria-expanded={menuOpen}
					onClick={toggleMenu}
				>
					<span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
					<span className="relative block h-4 w-5" aria-hidden="true">
						<span
							className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition duration-200 ${
								menuOpen ? "translate-y-[7px] rotate-45" : ""
							}`}
						/>
						<span
							className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition duration-200 ${
								menuOpen ? "opacity-0" : ""
							}`}
						/>
						<span
							className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition duration-200 ${
								menuOpen ? "-translate-y-[7px] -rotate-45" : ""
							}`}
						/>
					</span>
				</button>
			</div>

			{menuOpen ? (
				<div className="fixed inset-0 z-[60] bg-[rgba(7,25,42,0.98)] text-[var(--parchment)] lg:hidden">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(217,167,91,0.18),transparent_16rem),radial-gradient(circle_at_88%_72%,rgba(31,107,115,0.24),transparent_18rem)]" />
					<div className="relative flex min-h-dvh flex-col overflow-y-auto px-4 py-4">
						<div className="flex items-center justify-between gap-4">
							<Link
								href="/"
								className="flex min-w-0 items-center gap-3"
								aria-label="Yashoda U. Itwaru home"
								onClick={closeMenu}
							>
								<span className="grid size-11 shrink-0 place-items-center border border-[var(--gold)] bg-[rgba(239,207,178,0.1)] text-2xl text-[var(--gold)]">
									&#10043;
								</span>
								<span className="min-w-0">
									<span className="block truncate font-display text-xl leading-none text-[var(--gold)]">
										{author.shortName}
									</span>
									<span className="mt-1 block truncate text-[0.62rem] font-bold uppercase tracking-[0.28em] text-[var(--parchment-soft)]">
										{author.brand}
									</span>
								</span>
							</Link>
							<button
								type="button"
								className="grid size-11 shrink-0 place-items-center border border-[rgba(217,167,91,0.72)] bg-[rgba(239,207,178,0.08)] text-[var(--gold)] transition hover:bg-[rgba(239,207,178,0.16)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--navy)]"
								aria-label="Close navigation"
								onClick={closeMenu}
							>
								<span className="relative block h-5 w-5" aria-hidden="true">
									<span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rotate-45 bg-current" />
									<span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 -rotate-45 bg-current" />
								</span>
							</button>
						</div>

						<div className="flex flex-1 flex-col justify-center py-8">
							<p className="script-label text-[var(--gold)]">Navigate the archive</p>
							<nav
								id="mobile-navigation"
								aria-label="Mobile navigation"
								className="mt-5 grid gap-3"
							>
								{navItems.map((item) => {
									const active = isActivePath(pathname, item.href);

									return (
										<Link
											key={item.href}
											href={item.href}
											aria-current={active ? "page" : undefined}
											onClick={closeMenu}
											className={`mobile-nav-link ${active ? "mobile-nav-link-active" : ""}`}
										>
											<span>{item.label}</span>
											<span aria-hidden="true">{"->"}</span>
										</Link>
									);
								})}
							</nav>
						</div>

						<div className="border-t border-[rgba(217,167,91,0.28)] pt-4">
							<p className="font-display text-2xl text-[var(--gold)]">
								Open to respectful DMs.
							</p>
							<p className="mt-2 text-sm leading-6 text-[var(--parchment-soft)]">
								Use the dedicated contact page for notes, collaborations, and
								respectful reader messages.
							</p>
						</div>
					</div>
				</div>
			) : null}
		</header>
	);
}
