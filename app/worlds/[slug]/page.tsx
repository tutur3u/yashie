import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	DetailCopyBlock,
	DetailFeatureGrid,
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
			meta={[world.kicker, "Writing mode", "InkedByYashie archive"]}
			nextHref={nextWorld ? getWorldHref(nextWorld) : undefined}
			nextLabel={nextWorld ? nextWorld.title : undefined}
			title={world.title}
		>
			<DetailCopyBlock label="Room note" title={world.detail}>
				<p>
					This corner of Yashie&apos;s writing world gathers the voice, image,
					and emotional texture behind {world.title.toLowerCase()}. It is built
					for readers who want more than a title card: a sense of what the room
					holds, why it exists, and how it connects back to the larger archive.
				</p>
				<p>
					The tone here is intimate and myth-touched, with attention to memory,
					faith, identity, tenderness, and resistance. The page gives the
					category a permanent home instead of leaving the card as a dead end.
				</p>
				<DetailFeatureGrid
					items={[
						{
							label: "Mood",
							text: "A focused doorway into the emotional lane behind this part of the portfolio.",
						},
						{
							label: "Reader path",
							text: "A stronger route from the home shelf into deeper essays, poems, story notes, or future posts.",
						},
						{
							label: "Visual mark",
							text: "The selected artwork becomes the page anchor instead of only a decorative thumbnail.",
						},
					]}
				/>
			</DetailCopyBlock>
		</DetailPageShell>
	);
}
