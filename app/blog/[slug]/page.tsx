import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	DetailCopyBlock,
	DetailFeatureGrid,
	DetailPageShell,
} from "@/app/components/DetailPageShell";
import {
	blogPosts,
	findBlogPostBySlug,
	getBlogHref,
	slugify,
} from "@/app/data/portfolio";

type DetailParams = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return blogPosts.map((post) => ({
		slug: slugify(post.title),
	}));
}

export async function generateMetadata({
	params,
}: DetailParams): Promise<Metadata> {
	const { slug } = await params;
	const post = findBlogPostBySlug(slug);

	if (!post) {
		return {};
	}

	return {
		title: post.title,
		description: post.excerpt,
		openGraph: {
			images: [post.image],
		},
	};
}

export default async function BlogPostPage({ params }: DetailParams) {
	const { slug } = await params;
	const post = findBlogPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const currentIndex = blogPosts.findIndex((item) => item.title === post.title);
	const nextPost = blogPosts[(currentIndex + 1) % blogPosts.length];

	return (
		<DetailPageShell
			backHref="/blog"
			backLabel="Back to blog"
			description={post.excerpt}
			eyebrow={post.category}
			image={post.image}
			imageAlt={post.imageAlt}
			imagePosition={post.imagePosition}
			meta={[post.category, post.date, post.readTime]}
			nextHref={nextPost ? getBlogHref(nextPost) : undefined}
			nextLabel={nextPost ? nextPost.title : undefined}
			title={post.title}
		>
			<DetailCopyBlock label="Journal entry" title="The post">
				<article className="grid gap-5">
					<p>
						{post.excerpt} This mock entry gives the title its own readable
						space, with a stronger editorial rhythm than the listing card can
						offer.
					</p>
					<p>
						The writing lane is personal and reflective: a place for craft,
						memory, books, poetry, culture, and the private weather behind a
						larger fantasy world.
					</p>
					<blockquote className="border-l-4 border-[var(--copper)] bg-[rgba(255,246,239,0.58)] px-5 py-4 font-display text-3xl leading-10 text-[var(--navy)]">
						Words become a room when a reader is invited to stay.
					</blockquote>
					<DetailFeatureGrid
						items={[
							{
								label: "Category",
								text: post.category,
							},
							{
								label: "Reading time",
								text: post.readTime,
							},
							{
								label: "Published",
								text: post.date,
							},
						]}
					/>
				</article>
			</DetailCopyBlock>
		</DetailPageShell>
	);
}
