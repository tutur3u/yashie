import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageIntro, ProductCard, SectionHeader } from "@/app/components/PortfolioSections";
import { getYashieContent } from "@/lib/yashie-delivery";
import { canAccessYashieNavTab } from "@/lib/yashie-navigation-access";

export const metadata: Metadata = {
	title: "Shop | Yashoda U. Itwaru",
	description:
		"Shop for signed books, stationery, bookmarks, art prints, and author merch from InkedByYashie.",
};

export default async function ShopPage() {
	const content = await getYashieContent();
	const page = content.pageContent.shop;

	if (!(await canAccessYashieNavTab(content, "shop"))) {
		notFound();
	}

	return (
		<main>
			<PageIntro
				title={page.intro.title}
				description={page.intro.description}
				image="/images/artworks/chibi-forest-campfire.jpg"
			/>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<SectionHeader
						label={page.listing.label}
						title={page.listing.title}
						description={page.listing.description}
					/>
					{content.products.length > 0 ? (
						<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
							{content.products.map((product) => (
								<ProductCard key={product.title} product={product} />
							))}
						</div>
					) : (
						<div className="parchment-card grid min-h-48 place-items-center border-dashed px-6 py-10 text-center">
							<div className="max-w-xl">
								<p className="script-label">Nothing listed right now</p>
								<h2 className="font-display text-3xl text-[var(--navy)] sm:text-4xl">
									The shelf is being refreshed
								</h2>
								<p className="mt-3 text-sm leading-6 text-[var(--ink-soft)] sm:text-base">
									When a shop item is published, it will appear here. Removed and
									hidden items stay off the shelf.
								</p>
							</div>
						</div>
					)}
				</div>
			</section>

			{content.products.length > 0 ? (
				<section className="bg-[var(--parchment-rose)] px-4 py-12 sm:px-6 lg:px-8">
					<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
						<div>
							<SectionHeader
								label={page.feature.label}
								title={page.feature.title}
								description={page.feature.description}
							/>
							{page.highlights.length > 0 ? (
								<div className="grid gap-4 sm:grid-cols-3">
									{page.highlights.map((word) => (
										<div key={word} className="parchment-card p-5 text-center">
											<p className="font-display text-3xl text-[var(--navy)]">
												{word}
											</p>
											<p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--clay)]">
												{page.highlightLabel}
											</p>
										</div>
									))}
								</div>
							) : null}
						</div>

						<div className="ornament-frame relative min-h-80 overflow-hidden">
							<Image
								src="/images/artworks/lotus-blade-ornament.jpg"
								alt="Black line art of an ornamental blade with lotus flowers."
								fill
								sizes="(min-width: 1024px) 45vw, 100vw"
								className="object-cover"
							/>
						</div>
					</div>
				</section>
			) : null}
		</main>
	);
}
