import { PageIntro } from "@/app/components/PortfolioSections";

export default function ShopLoading() {
	return (
		<main aria-busy="true" aria-live="polite">
			<PageIntro
				title="From My Desk to Yours"
				description="Opening the latest InkedByYashie shelf..."
				image="/images/artworks/chibi-forest-campfire.jpg"
			/>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<p className="script-label">Available now</p>
					<h2 className="font-display text-4xl leading-tight text-[var(--navy)] sm:text-5xl">
						Preparing the shelf
					</h2>
					<p className="mt-3 text-base leading-7 text-[var(--ink-soft)]">
						Checking which books and desk treasures are currently available.
					</p>
					<div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
						{Array.from({ length: 5 }, (_, index) => (
							<div
								className="parchment-card min-h-80 animate-pulse bg-white/48"
								key={index}
							/>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
