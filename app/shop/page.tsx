import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro, ProductCard, SectionHeader } from "@/app/components/PortfolioSections";
import { products } from "@/app/data/portfolio";

export const metadata: Metadata = {
	title: "Shop | Yashoda U. Itwaru",
	description:
		"Mock shop for signed books, stationery, bookmarks, art prints, and author merch from InkedByYashie.",
};

export default function ShopPage() {
	return (
		<main>
			<PageIntro
				title="From My Desk to Yours"
				description="A frontend-only mock shop for books, prints, stationery, bookmarks, and merch."
				image="/images/portfolio/items/shop-merch.jpg"
			/>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<SectionHeader
						label="Mock products"
						title="Shop the shelf"
						description="No checkout is connected. These cards model the future commerce experience and visual direction."
					/>
					<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
						{products.map((product) => (
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
							description="The mock shop leans into clothbound textures, peacock ornament, botanical print work, and practical writer desk objects."
						/>
						<div className="grid gap-4 sm:grid-cols-3">
							{["Signed", "Printed", "Carried"].map((word) => (
								<div key={word} className="parchment-card p-5 text-center">
									<p className="font-display text-3xl text-[var(--navy)]">{word}</p>
									<p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--clay)]">
										mock item family
									</p>
								</div>
							))}
						</div>
					</div>

					<div className="ornament-frame relative min-h-80 overflow-hidden">
						<Image
							src="/images/portfolio/items/shop-stationery.jpg"
							alt="A flat-lay of mock literary merchandise with notebooks, a print, bookmark, pin, and tote."
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
