import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
	DetailCopyBlock,
	DetailPageShell,
} from "@/app/components/DetailPageShell";
import {
	findProductBySlug,
	getProductHref,
	products,
	slugify,
} from "@/app/data/portfolio";
import { getYashieContent } from "@/lib/yashie-delivery";
import { canAccessYashieNavTab } from "@/lib/yashie-navigation-access";

type DetailParams = {
	params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

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

	if (!(await canAccessYashieNavTab(content, "shop"))) {
		notFound();
	}

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
			eyebrow="Shop item"
			image={product.image}
			imageAlt={product.imageAlt}
			imagePosition={product.imagePosition}
			meta={[product.price]}
			nextHref={nextProduct ? getProductHref(nextProduct) : undefined}
			nextLabel={nextProduct ? nextProduct.title : undefined}
			title={product.title}
		>
			<DetailCopyBlock label="Shelf note" title={product.title}>
				<p>
					{product.description}
				</p>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Link href="/contact" className="button-primary">
						Ask about this item
					</Link>
					<Link href="/shop" className="button-secondary">
						Browse shop
					</Link>
				</div>
			</DetailCopyBlock>
		</DetailPageShell>
	);
}
