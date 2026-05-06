import type { Metadata } from "next";
import Image from "next/image";
import { BlogCard, PageIntro, SectionHeader } from "@/app/components/PortfolioSections";
import { blogPosts, worlds } from "@/app/data/portfolio";

export const metadata: Metadata = {
	title: "Blog | Yashoda U. Itwaru",
	description:
		"Mock essays, reflections, poetry notes, and bookish posts from InkedByYashie.",
};

export default function BlogPage() {
	return (
		<main>
			<PageIntro
				title="From the Blog"
				description="Mock essays and reflections about culture, writing, memory, books, and the soft violence of becoming yourself."
				image="/images/portfolio/blog-collage.png"
			/>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
					<aside className="parchment-card h-fit p-5">
						<p className="script-label">Journal tabs</p>
						<h2 className="font-display text-3xl text-[var(--navy)]">Categories</h2>
						<div className="mt-4 grid gap-2">
							{worlds.map((world) => (
								<a
									key={world.kicker}
									href={`#${world.kicker.toLowerCase().replaceAll(" ", "-")}`}
									className="flex items-center justify-between border-b border-[rgba(184,112,81,0.22)] py-2 text-sm text-[var(--ink-soft)] transition hover:text-[var(--clay)]"
								>
									<span>{world.kicker}</span>
									<span aria-hidden="true">{"->"}</span>
								</a>
							))}
						</div>
					</aside>

					<div>
						<SectionHeader
							label="Latest mock posts"
							title="Essays, poems, and notes"
							description="This page is frontend-only, but the layout is ready for a future CMS or static post collection."
						/>
						<div className="grid gap-6">
							{blogPosts.map((post) => (
								<BlogCard key={post.title} post={post} />
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="bg-[var(--parchment-rose)] px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
					<div className="ornament-frame relative min-h-80 overflow-hidden">
						<Image
							src="/images/portfolio/hero-still-life.png"
							alt="A parchment writing desk with an ornate navy notebook and ink pot."
							fill
							sizes="(min-width: 1024px) 45vw, 100vw"
							className="object-cover"
						/>
					</div>
					<div className="self-center">
						<SectionHeader
							label="Editorial direction"
							title="The page as a place to remember"
							description="Blog posts can hold craft notes, reading lists, cultural reflections, short poetry, publication news, and the behind-the-scenes work of building a dark fantasy world."
						/>
						<div className="grid gap-4 sm:grid-cols-2">
							{["Memory", "Identity", "Hindu-inspired fantasy", "AI ethics"].map(
								(topic) => (
									<div key={topic} className="parchment-card p-4">
										<p className="font-display text-2xl text-[var(--navy)]">
											{topic}
										</p>
										<p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
											A mock editorial lane for future essays and updates.
										</p>
									</div>
								),
							)}
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
