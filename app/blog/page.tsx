import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard, PageIntro, SectionHeader } from "@/app/components/PortfolioSections";
import { getWorldHref } from "@/app/data/portfolio";
import { getYashieContent } from "@/lib/yashie-delivery";
import { canAccessYashieNavTab } from "@/lib/yashie-navigation-access";

export const metadata: Metadata = {
	title: "Blog | Yashoda U. Itwaru",
	description:
		"Essays, reflections, poetry notes, and bookish posts from InkedByYashie.",
};

export default async function BlogPage() {
	const content = await getYashieContent();
	const page = content.pageContent.blog;

	if (!(await canAccessYashieNavTab(content, "blog"))) {
		notFound();
	}

	return (
		<main>
			<PageIntro
				title={page.intro.title}
				description={page.intro.description}
				image="/images/artworks/chibi-family-cast.jpg"
			/>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
					<aside className="parchment-card h-fit p-5">
						<p className="script-label">Journal tabs</p>
						<h2 className="font-display text-3xl text-[var(--navy)]">Categories</h2>
						<div className="mt-4 grid gap-2">
							{content.worlds.map((world) => (
								<Link
									key={world.kicker}
									href={getWorldHref(world)}
									className="flex items-center justify-between border-b border-[rgba(184,112,81,0.22)] py-2 text-sm text-[var(--ink-soft)] transition hover:text-[var(--clay)]"
								>
									<span>{world.kicker}</span>
									<span aria-hidden="true">{"->"}</span>
								</Link>
							))}
						</div>
					</aside>

					<div>
						<SectionHeader
							label={page.listing.label}
							title={page.listing.title}
							description={page.listing.description}
						/>
						<div className="grid gap-6">
							{content.blogPosts.map((post) => (
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
							src="/images/artworks/bird-blade-floral-ornament.png"
							alt="Black line art of a bird, curved blade, flowers, and scrollwork."
							fill
							sizes="(min-width: 1024px) 45vw, 100vw"
							className="object-cover"
						/>
					</div>
					<div className="self-center">
						<SectionHeader
							label={page.feature.label}
							title={page.feature.title}
							description={page.feature.description}
						/>
						<div className="grid gap-4 sm:grid-cols-2">
							{page.highlights.map(
								(topic) => (
									<div key={topic} className="parchment-card p-4">
										<p className="font-display text-2xl text-[var(--navy)]">
											{topic}
										</p>
										<p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
											{page.highlightLabel}
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
