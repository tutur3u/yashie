import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	DetailCopyBlock,
	DetailFeatureGrid,
	DetailPageShell,
} from "@/app/components/DetailPageShell";
import {
	findGalleryItemBySlug,
	galleryItems,
	getGalleryHref,
	slugify,
} from "@/app/data/portfolio";
import { getYashieContent } from "@/lib/yashie-delivery";

type DetailParams = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return galleryItems.map((item) => ({
		slug: slugify(item.title),
	}));
}

export async function generateMetadata({
	params,
}: DetailParams): Promise<Metadata> {
	const { slug } = await params;
	const content = await getYashieContent();
	const item = findGalleryItemBySlug(slug, content.galleryItems);

	if (!item) {
		return {};
	}

	return {
		title: `${item.title} Gallery`,
		description: item.description,
		openGraph: {
			images: [item.image],
		},
	};
}

export default async function GalleryDetailPage({ params }: DetailParams) {
	const { slug } = await params;
	const content = await getYashieContent();
	const item = findGalleryItemBySlug(slug, content.galleryItems);

	if (!item) {
		notFound();
	}

	const currentIndex = content.galleryItems.findIndex(
		(galleryItem) => galleryItem.title === item.title,
	);
	const nextItem = content.galleryItems[(currentIndex + 1) % content.galleryItems.length];

	return (
		<DetailPageShell
			backHref="/gallery"
			backLabel="Back to gallery"
			description={item.description}
			eyebrow={item.type}
			image={item.image}
			imageAlt={item.imageAlt}
			imagePosition={item.imagePosition}
			meta={[item.type, "Gallery piece", "Concept art"]}
			nextHref={nextItem ? getGalleryHref(nextItem) : undefined}
			nextLabel={nextItem ? nextItem.title : undefined}
			title={item.title}
		>
			<DetailCopyBlock label="Object note" title="A closer look">
				<p>
					{item.description}
				</p>
				<p>
					The piece belongs to the portfolio&apos;s shelf of book-world fragments:
					part story prompt, part visual memory, and part future anchor for
					chapters, collections, or world notes.
				</p>
				<DetailFeatureGrid
					items={[
						{
							label: "Format",
							text: item.type,
						},
						{
							label: "Use",
							text: "A concept surface for covers, scene notes, bookish keepsakes, and portfolio storytelling.",
						},
						{
							label: "Texture",
							text: "A larger image treatment with copper framing, parchment copy, and direct next-piece navigation.",
						},
					]}
				/>
			</DetailCopyBlock>
		</DetailPageShell>
	);
}
