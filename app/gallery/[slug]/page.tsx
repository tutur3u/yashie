import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	DetailCopyBlock,
	DetailPageShell,
} from "@/app/components/DetailPageShell";
import {
	findGalleryItemBySlug,
	galleryItems,
	getGalleryHref,
	slugify,
} from "@/app/data/portfolio";
import { getYashieContent } from "@/lib/yashie-delivery";
import { canAccessYashieNavTab } from "@/lib/yashie-navigation-access";

type DetailParams = {
	params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

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

	if (!(await canAccessYashieNavTab(content, "gallery"))) {
		notFound();
	}

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
			meta={[item.type]}
			nextHref={nextItem ? getGalleryHref(nextItem) : undefined}
			nextLabel={nextItem ? nextItem.title : undefined}
			title={item.title}
		>
			<DetailCopyBlock label="Object note" title="A closer look">
				<p>
					{item.description}
				</p>
			</DetailCopyBlock>
		</DetailPageShell>
	);
}
