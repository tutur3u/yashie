import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	DetailCopyBlock,
	DetailPageShell,
} from "@/app/components/DetailPageShell";
import {
	findWorldBySlug,
	getWorldHref,
	slugify,
	worlds,
} from "@/app/data/portfolio";
import { getYashieContent } from "@/lib/yashie-delivery";

type DetailParams = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return worlds.map((world) => ({
		slug: slugify(world.title),
	}));
}

export async function generateMetadata({
	params,
}: DetailParams): Promise<Metadata> {
	const { slug } = await params;
	const content = await getYashieContent();
	const world = findWorldBySlug(slug, content.worlds);

	if (!world) {
		return {};
	}

	return {
		title: world.title,
		description: world.description,
		openGraph: {
			images: [world.image],
		},
	};
}

export default async function WorldDetailPage({ params }: DetailParams) {
	const { slug } = await params;
	const content = await getYashieContent();
	const world = findWorldBySlug(slug, content.worlds);

	if (!world) {
		notFound();
	}

	const currentIndex = content.worlds.findIndex((item) => item.title === world.title);
	const nextWorld = content.worlds[(currentIndex + 1) % content.worlds.length];

	return (
		<DetailPageShell
			backHref="/#worlds"
			backLabel="Back to worlds"
			description={world.description}
			eyebrow={world.kicker}
			image={world.image}
			imageAlt={world.imageAlt}
			imagePosition={world.imagePosition}
			meta={[world.kicker]}
			nextHref={nextWorld ? getWorldHref(nextWorld) : undefined}
			nextLabel={nextWorld ? nextWorld.title : undefined}
			title={world.title}
		>
			<DetailCopyBlock label="Room note" title={world.detail}>
				<p>
					{world.description}
				</p>
			</DetailCopyBlock>
		</DetailPageShell>
	);
}
