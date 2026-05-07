import Image from "next/image";
import Link from "next/link";
import { MobileCarousel } from "@/app/components/MobileCarousel";
import {
	BlogCard,
	GalleryCard,
	ProductCard,
	QuotePanel,
	SectionHeader,
	WorldCard,
} from "@/app/components/PortfolioSections";
import {
	author,
	blogPosts,
	galleryItems,
	products,
	profileFacts,
	socials,
	worlds,
} from "@/app/data/portfolio";

export default function Home() {
	return (
		<main>
			<section className="hero-shell relative overflow-hidden border-b border-[var(--copper)]">
				<Image
					src="/images/portfolio/hero-still-life.png"
					alt="A navy and parchment writing desk with an ornate journal, ink pot, and peacock feather."
					fill
					priority
					sizes="100vw"
					className="object-cover object-center"
				/>
				<div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,221,205,0.96)_0%,rgba(246,221,205,0.9)_44%,rgba(246,221,205,0.18)_74%)]" />
				<div className="relative mx-auto grid min-h-[640px] max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
					<div className="max-w-3xl">
						<p className="script-label">Namaste, I&apos;m Yashie</p>
						<h1 className="font-display text-6xl leading-[0.9] text-[var(--navy)] sm:text-7xl lg:text-8xl">
							{author.name}
						</h1>
						<p className="mt-3 font-display text-3xl text-[var(--clay)]">
							{author.title}
						</p>
						<div className="mt-4 h-px w-64 bg-[var(--copper)]" />
						<p className="mt-5 max-w-xl text-lg leading-8 text-[var(--ink)]">
							{author.tagline}
						</p>
						<div className="mt-7 flex flex-col gap-3 sm:flex-row">
							<Link href="/blog" className="button-primary">
								Read My Writings
							</Link>
							<Link href="/gallery" className="button-secondary">
								Explore Gallery
							</Link>
						</div>
						<p className="mt-7 inline-block border border-[rgba(184,112,81,0.35)] bg-[rgba(255,246,239,0.72)] px-5 py-3 font-display text-xl italic text-[var(--ink-soft)]">
							also known online as <span className="text-[var(--clay)]">{author.alias}</span>
						</p>
					</div>

					<div className="hidden lg:block">
						<QuotePanel quote={author.quote} />
					</div>
				</div>
			</section>

			<section className="bg-[var(--navy)] px-4 py-8 text-[var(--parchment)] sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<h2 className="font-display text-3xl text-[var(--gold)]">
						Explore My Worlds
					</h2>
					<MobileCarousel
						label="World"
						tone="dark"
						desktopClassName="md:grid md:grid-cols-2 xl:grid-cols-5"
					>
						{worlds.map((world) => (
							<WorldCard key={world.title} world={world} />
						))}
					</MobileCarousel>
				</div>
			</section>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<SectionHeader
							label="A peek into books, writing, journals, and poetry"
							title="Gallery"
							description="Mock covers, journals, and world fragments arranged like a shelf of secret rooms."
						/>
						<Link href="/gallery" className="link-cta">
							View full gallery {"->"}
						</Link>
					</div>
					<MobileCarousel
						label="Gallery"
						desktopClassName="md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-6"
					>
						{galleryItems.slice(0, 6).map((item) => (
							<GalleryCard key={item.title} item={item} />
						))}
					</MobileCarousel>
				</div>
			</section>

			<section className="bg-[var(--parchment-rose)] px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[1fr_320px]">
					<div className="min-w-0">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
							<SectionHeader
								label="Latest thoughts, stories, and posts"
								title="From the Blog"
								description="Mock posts shaped around writing practice, becoming, reading, and reclamation."
							/>
							<Link href="/blog" className="link-cta">
								Visit blog {"->"}
							</Link>
						</div>
						<MobileCarousel
							label="Post"
							desktopClassName="md:grid md:gap-5 lg:grid-cols-2"
						>
							{blogPosts.map((post) => (
								<BlogCard key={post.title} post={post} />
							))}
						</MobileCarousel>
					</div>
					<div className="min-w-0 self-stretch">
						<QuotePanel quote="Words are how I make sense of the world." />
					</div>
				</div>
			</section>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<SectionHeader
							label="Books, prints, merch, and stationery"
							title="From My Desk to Yours"
							description="A mock shop shelf for signed copies, art prints, notebooks, bookmarks, and merch."
						/>
						<Link href="/shop" className="link-cta">
							Open shop {"->"}
						</Link>
					</div>
					<MobileCarousel
						label="Shop"
						desktopClassName="md:grid md:grid-cols-2 md:gap-5 xl:grid-cols-5"
					>
						{products.map((product) => (
							<ProductCard key={product.title} product={product} />
						))}
					</MobileCarousel>
				</div>
			</section>

			<section
				id="about"
				className="bg-[var(--parchment-rose)] px-4 py-14 sm:px-6 lg:px-8"
			>
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr_320px]">
					<div>
						<SectionHeader label="Who is Yashie?" title="About Me" />
						<p className="text-base leading-8 text-[var(--ink)]">
							I am Yashie, Yashoda U. Itwaru. I write essays, reflections,
							books, stories, poetry, blog posts, and personal writing. My work
							is a love letter to the cultures and identity I once felt pushed
							to hide, and a rebellion against erasure.
						</p>
						<div className="mt-5 flex flex-wrap gap-2">
							{author.values.map((value) => (
								<span key={value} className="tag-chip">
									{value}
								</span>
							))}
						</div>
					</div>

					<div>
						<SectionHeader label="Connect" title="Let's Connect" />
						<p className="text-base leading-7 text-[var(--ink-soft)]">
							You can find me everywhere as {author.alias}. DMs are welcome so
							long as everyone is respectful.
						</p>
						<Link href="/contact" className="mt-5 button-primary">
							Contact Me
						</Link>
						<div className="mt-5 grid gap-3 sm:grid-cols-2">
							{socials.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noreferrer"
									className="social-row"
								>
									<span className="social-orb">{social.label.slice(0, 1)}</span>
									<span>
										<span className="block font-semibold text-[var(--navy)]">
											{social.label}
										</span>
										<span className="text-sm text-[var(--ink-soft)]">
											{social.handle}
										</span>
									</span>
								</a>
							))}
						</div>
					</div>

					<div className="parchment-card p-5">
						<p className="script-label">Author Brand</p>
						<h3 className="font-display text-3xl text-[var(--navy)]">
							{author.brand}
						</h3>
						<ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--ink-soft)]">
							{profileFacts.map((fact) => (
								<li key={fact} className="flex gap-3">
									<span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--copper)]" />
									<span>{fact}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>
		</main>
	);
}
