import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	GalleryCard,
	PageIntro,
	QuotePanel,
	SectionHeader,
} from "@/app/components/PortfolioSections";
import { getWorldHref } from "@/app/data/portfolio";
import { getYashieContent } from "@/lib/yashie-delivery";
import { canAccessYashieNavTab } from "@/lib/yashie-navigation-access";

export const metadata: Metadata = {
	title: "Gallery | Yashoda U. Itwaru",
	description:
		"Gallery of book worlds, journals, poetry collections, and personal writing from InkedByYashie.",
};

export default async function GalleryPage() {
	const content = await getYashieContent();
	const page = content.pageContent.gallery;

	if (!(await canAccessYashieNavTab(content, "gallery"))) {
		notFound();
	}

	return (
		<main>
			<PageIntro
				title={page.intro.title}
				description={page.intro.description}
			/>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<SectionHeader
						label={page.listing.label}
						title={page.listing.title}
						description={page.listing.description}
					/>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
						{content.galleryItems.map((item) => (
							<GalleryCard key={item.title} item={item} />
						))}
					</div>
				</div>
			</section>

			<section className="bg-[var(--parchment-rose)] px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
					<div>
						<SectionHeader
							label={page.feature.label}
							title={page.feature.title}
							description={page.feature.description}
						/>
						<div className="grid gap-4 md:grid-cols-2">
							{content.worlds.map((world) => (
								<Link
									key={world.title}
									href={getWorldHref(world)}
									className="parchment-card p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--parchment-rose)]"
								>
									<p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--clay)]">
										{world.kicker}
									</p>
									<h3 className="mt-2 font-display text-3xl text-[var(--navy)]">
										{world.title}
									</h3>
									<p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
										{world.detail}
									</p>
								</Link>
							))}
						</div>
					</div>
					<div className="self-center">
						<QuotePanel quote={content.author.quote} />
					</div>
				</div>
			</section>
		</main>
	);
}
