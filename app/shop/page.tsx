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

	if (!(await canAccessYashieNavTab(content, "shop"))) {
		notFound();
	}

	return (
		<main>
			<PageIntro
				title="From My Desk to Yours"
				description="Books, prints, stationery, bookmarks, and merch from the InkedByYashie shelf."
				image="/images/artworks/chibi-forest-campfire.jpg"
			/>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<SectionHeader
						label="Shop items"
						title="Shop the shelf"
						description="Books, prints, stationery, bookmarks, and desk treasures from the InkedByYashie world."
					/>
					<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
						{content.products.map((product) => (
							<ProductCard key={product.title} product={product} />
						))}
					</div>
				</div>
			</section>

			<section className="bg-[var(--parchment-rose)] px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
					<div>
						<SectionHeader
							label="Merch language"
							title="Bookish, soft, and sharp"
							description="The shop leans into clothbound textures, peacock ornament, botanical print work, and practical writer desk objects."
						/>
						<div className="grid gap-4 sm:grid-cols-3">
							{["Signed", "Printed", "Carried"].map((word) => (
								<div key={word} className="parchment-card p-5 text-center">
									<p className="font-display text-3xl text-[var(--navy)]">{word}</p>
									<p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--clay)]">
										item family
									</p>
								</div>
							))}
						</div>
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
		</main>
	);
}
