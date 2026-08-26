import Link from "next/link";
import { NewsletterForm } from "@/app/components/MockForms";
import { SocialIcon } from "@/app/components/SocialIcon";
import type { YashieContent } from "@/lib/yashie-content";

export function SiteFooter({
	author,
	navItems,
	socials,
	page,
}: {
	author: YashieContent["author"];
	navItems: YashieContent["navItems"];
	socials: YashieContent["socials"];
	page: YashieContent["pageContent"]["footer"];
}) {
	return (
		<footer className="border-t border-[var(--copper)] bg-[var(--navy)] text-[var(--parchment)]">
			<div className="edge-frame mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1.2fr_1fr] lg:px-8">
				<div>
					<p className="font-display text-3xl text-[var(--gold)]">{page.intro.title}</p>
					<p className="mt-2 max-w-sm text-sm leading-6 text-[var(--parchment-soft)]">
						{page.intro.description}
					</p>
				</div>

				<div>
					<NewsletterForm />
					<p className="mt-3 text-sm italic text-[var(--parchment-soft)]">
						{page.listing.title}
					</p>
					<p className="mt-1 text-xs text-[var(--parchment-soft)]">
						{page.listing.description}
					</p>
				</div>

				<div className="lg:text-right">
					<p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--parchment-soft)]">
						{page.feature.label}
					</p>
					<p className="font-display text-2xl text-[var(--gold)]">
						{page.feature.title}
					</p>
					<p className="mt-1 whitespace-nowrap text-xs font-bold uppercase tracking-[0.38em] text-[var(--parchment-soft)]">
						{author.brand}
					</p>
					<div className="mt-4 flex flex-wrap gap-2 lg:justify-end">
						{socials.slice(0, 5).map((social) => (
							<a
								key={social.label}
								href={social.href}
								target="_blank"
								rel="noreferrer"
								className="social-orb"
								aria-label={social.label}
							>
								<SocialIcon platform={social.platform} />
							</a>
						))}
					</div>
				</div>
			</div>

			<div className="border-t border-[rgba(239,207,178,0.2)] px-4 py-4 text-xs text-[var(--parchment-soft)]">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="flex flex-wrap items-center gap-1">
						<span>© 2026 {author.name}.</span>
						<span>{page.feature.description}</span>
					</p>
					<div className="flex flex-wrap gap-x-4 gap-y-2">
						{navItems.slice(0, 6).map((item) => (
							<Link key={item.href} href={item.href} className="hover:text-white">
								{item.label}
							</Link>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}
