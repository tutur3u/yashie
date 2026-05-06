import type { Metadata } from "next";
import {
	GalleryCard,
	PageIntro,
	QuotePanel,
	SectionHeader,
} from "@/app/components/PortfolioSections";
import { author, galleryItems, worlds } from "@/app/data/portfolio";

export const metadata: Metadata = {
	title: "Gallery | Yashoda U. Itwaru",
	description:
		"Mock gallery of book worlds, journals, poetry collections, and personal writing from InkedByYashie.",
};

export default function GalleryPage() {
	return (
		<main>
			<PageIntro
				title="Gallery"
				description="A mock shelf of covers, journals, and writing-world fragments for the InkedByYashie portfolio."
			/>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<SectionHeader
						label="Mock books and keepsakes"
						title="The Book World Shelf"
						description="Every image here is a concept asset for this portfolio build. The titles and descriptions stay code-native so the shelf can evolve."
					/>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
						{galleryItems.map((item) => (
							<GalleryCard key={item.title} item={item} />
						))}
					</div>
				</div>
			</section>

			<section className="bg-[var(--parchment-rose)] px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
					<div>
						<SectionHeader
							label="Recurring rooms"
							title="Writing Modes"
							description="The portfolio treats each genre and format as a doorway into Yashie's larger world."
						/>
						<div className="grid gap-4 md:grid-cols-2">
							{worlds.map((world) => (
								<article key={world.title} className="parchment-card p-5">
									<p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--clay)]">
										{world.kicker}
									</p>
									<h3 className="mt-2 font-display text-3xl text-[var(--navy)]">
										{world.title}
									</h3>
									<p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
										{world.detail}
									</p>
								</article>
							))}
						</div>
					</div>
					<div className="self-center">
						<QuotePanel quote={author.quote} />
					</div>
				</div>
			</section>
		</main>
	);
}
