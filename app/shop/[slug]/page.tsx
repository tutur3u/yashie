import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
	DetailCopyBlock,
	DetailFeatureGrid,
	DetailPageShell,
} from "@/app/components/DetailPageShell";
import {
	findProductBySlug,
	getProductHref,
	products,
	slugify,
} from "@/app/data/portfolio";
import { getYashieContent } from "@/lib/yashie-delivery";

type DetailParams = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return products.map((product) => ({
		slug: slugify(product.title),
	}));
}

export async function generateMetadata({
	params,
}: DetailParams): Promise<Metadata> {
	const { slug } = await params;
	const content = await getYashieContent();
	const product = findProductBySlug(slug, content.products);

	if (!product) {
		return {};
	}

	return {
		title: product.title,
		description: product.description,
		openGraph: {
			images: [product.image],
		},
	};
}

export default async function ProductDetailPage({ params }: DetailParams) {
	const { slug } = await params;
	const content = await getYashieContent();
	const product = findProductBySlug(slug, content.products);

	if (!product) {
		notFound();
	}

	const currentIndex = content.products.findIndex((item) => item.title === product.title);
	const nextProduct = content.products[(currentIndex + 1) % content.products.length];

	return (
		<DetailPageShell
			backHref="/shop"
			backLabel="Back to shop"
			description={product.description}
			eyebrow="Mock shop item"
			image={product.image}
			imageAlt={product.imageAlt}
			imagePosition={product.imagePosition}
			meta={[product.price, "Desk shelf", "Mock product"]}
			nextHref={nextProduct ? getProductHref(nextProduct) : undefined}
			nextLabel={nextProduct ? nextProduct.title : undefined}
			title={product.title}
		>
			<DetailCopyBlock label="Shelf note" title={`${product.price} concept item`}>
				<p>
					{product.description}
				</p>
				<p>
					This detail page gives the item a proper stop in the shop flow, with
					price, mood, image, and next-item movement all available without
					dropping the reader back into the grid.
				</p>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Link href="/contact" className="button-primary">
						Ask about this item
					</Link>
					<Link href="/shop" className="button-secondary">
						Browse shop
					</Link>
				</div>
				<DetailFeatureGrid
					items={[
						{
							label: "Price",
							text: product.price,
						},
						{
							label: "Finish",
							text: "Parchment, copper, navy, and peacock-world visual language.",
						},
						{
							label: "Status",
							text: "Mock storefront item ready for future checkout or preorder wiring.",
						},
					]}
				/>
			</DetailCopyBlock>
		</DetailPageShell>
	);
}
