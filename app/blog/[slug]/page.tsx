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
import { getYashieContent } from "@/lib/yashie-delivery";
import { canAccessYashieNavTab } from "@/lib/yashie-navigation-access";

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
	const content = await getYashieContent();
	const post = findBlogPostBySlug(slug, content.blogPosts);

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
	const content = await getYashieContent();

	if (!(await canAccessYashieNavTab(content, "blog"))) {
		notFound();
	}

	const post = findBlogPostBySlug(slug, content.blogPosts);

	if (!post) {
		notFound();
	}

	const currentIndex = content.blogPosts.findIndex((item) => item.title === post.title);
	const nextPost = content.blogPosts[(currentIndex + 1) % content.blogPosts.length];

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
						{post.body ?? post.excerpt}
					</p>
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
