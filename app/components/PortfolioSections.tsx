import Link from "next/link";
import type {
	BlogPost,
	GalleryItem,
	Product,
	WritingWorld,
} from "@/app/data/portfolio";
import { SmartImage } from "@/app/components/SmartImage";
import {
	getBlogHref,
	getGalleryHref,
	getProductHref,
	getWorldHref,
} from "@/app/data/portfolio";

type SectionHeaderProps = {
	label?: string;
	title: string;
	description?: string;
	align?: "left" | "center";
};

export function SectionHeader({
	label,
	title,
	description,
	align = "left",
}: SectionHeaderProps) {
	return (
		<div
			className={`mb-6 ${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}
		>
			{label ? <p className="script-label">{label}</p> : null}
			<h2 className="font-display text-4xl leading-tight text-[var(--navy)] sm:text-5xl">
				{title}
			</h2>
			{description ? (
				<p className="mt-3 text-base leading-7 text-[var(--ink-soft)]">
					{description}
				</p>
			) : null}
		</div>
	);
}

export function PageIntro({
	title,
	description,
	image = "/images/artworks/bird-blade-floral-ornament.png",
}: {
	title: string;
	description: string;
	image?: string;
}) {
	return (
		<section className="section-band border-b border-[rgba(184,112,81,0.4)]">
			<div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
				<div className="self-center">
					<p className="script-label">InkedByYashie</p>
					<h1 className="font-display text-5xl leading-none text-[var(--navy)] sm:text-6xl">
						{title}
					</h1>
					<p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">
						{description}
					</p>
				</div>
				<div className="ornament-frame relative min-h-72 overflow-hidden lg:min-h-96">
					<SmartImage
						src={image}
						alt=""
						fill
						sizes="(min-width: 1024px) 40vw, 100vw"
						className="object-cover"
						priority
					/>
				</div>
			</div>
		</section>
	);
}

export function WorldCard({ world }: { world: WritingWorld }) {
	return (
		<Link
			href={getWorldHref(world)}
			className="parchment-card group flex min-h-full flex-col overflow-hidden p-3 transition duration-200 hover:-translate-y-1 hover:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--navy)]"
			aria-label={`Read more about ${world.title}`}
		>
			<div className="relative mb-4 h-44 overflow-hidden border border-[rgba(184,112,81,0.45)]">
				<SmartImage
					src={world.image}
					alt={world.imageAlt}
					fill
					sizes="(min-width: 1024px) 20vw, 80vw"
					loading="eager"
					className="object-cover transition duration-700 group-hover:scale-110"
					style={{ objectPosition: world.imagePosition ?? "center" }}
				/>
				<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,25,42,0)_45%,rgba(7,25,42,0.42)_100%)]" />
			</div>
			<p className="w-fit border border-[rgba(217,167,91,0.55)] bg-[var(--navy-muted)] px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white">
				{world.kicker}
			</p>
			<h3 className="mt-3 font-display text-3xl leading-8 text-[var(--navy)]">
				{world.title}
			</h3>
			<p className="mt-3 flex-1 text-sm leading-6 text-[var(--ink-soft)]">
				{world.description}
			</p>
			<p className="mt-4 text-sm font-semibold text-[var(--clay)]">
				Read more {"->"}
			</p>
		</Link>
	);
}

export function GalleryCard({ item }: { item: GalleryItem }) {
	return (
		<Link
			href={getGalleryHref(item)}
			className="group grid min-h-full gap-3 transition duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--parchment)]"
			aria-label={`Open gallery item ${item.title}`}
		>
			<div className="book-cover relative aspect-[3/4] overflow-hidden border border-[var(--copper)] bg-[var(--navy)] shadow-[0_24px_38px_rgba(14,38,61,0.28)]">
				<SmartImage
					src={item.image}
					alt={item.imageAlt}
					fill
					sizes="(min-width: 1024px) 15vw, 45vw"
					loading="eager"
					className="object-cover transition duration-700 group-hover:scale-110"
					style={{ objectPosition: item.imagePosition ?? "center" }}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,34,55,0.88)] via-[rgba(11,34,55,0.08)] to-transparent" />
				<div className="absolute inset-3 border border-[rgba(217,167,91,0.52)]" />
				<div className="absolute inset-x-0 bottom-0 p-4 text-white">
					<h3 className="font-display text-2xl leading-6">{item.title}</h3>
					<p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
						{item.type}
					</p>
				</div>
			</div>
			<p className="text-sm leading-6 text-[var(--ink-soft)]">{item.description}</p>
		</Link>
	);
}

export function BlogCard({ post }: { post: BlogPost }) {
	return (
		<Link
			href={getBlogHref(post)}
			className="parchment-card group grid overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--parchment)] sm:grid-cols-[0.95fr_1fr]"
			aria-label={`Read post ${post.title}`}
		>
			<div className="relative min-h-64 overflow-hidden border-b border-[rgba(184,112,81,0.45)] sm:border-b-0 sm:border-r">
				<SmartImage
					src={post.image}
					alt={post.imageAlt}
					fill
					sizes="(min-width: 1024px) 22vw, 100vw"
					loading="eager"
					className="object-cover transition duration-700 group-hover:scale-110"
					style={{ objectPosition: post.imagePosition ?? "center" }}
				/>
				<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,242,232,0)_55%,rgba(14,38,61,0.35)_100%)]" />
			</div>
			<div className="p-6">
				<div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em]">
					<span className="bg-[var(--gold)] px-2 py-1 text-[var(--navy)]">
						{post.category}
					</span>
					<span className="text-[var(--clay)]">{post.date}</span>
					<span className="text-[var(--ink-soft)]">{post.readTime}</span>
				</div>
				<h3 className="mt-3 font-display text-3xl leading-8 text-[var(--navy)]">
					{post.title}
				</h3>
				<p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
					{post.excerpt}
				</p>
				<p className="mt-4 inline-block text-sm font-semibold text-[var(--clay)]">
					Read post {"->"}
				</p>
			</div>
		</Link>
	);
}

export function ProductCard({ product }: { product: Product }) {
	return (
		<Link
			href={getProductHref(product)}
			className="parchment-card group block overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--parchment)]"
			aria-label={`Open shop item ${product.title}`}
		>
			<div className="relative aspect-[5/4] overflow-hidden border-b border-[rgba(184,112,81,0.45)]">
				<SmartImage
					src={product.image}
					alt={product.imageAlt}
					fill
					sizes="(min-width: 1024px) 20vw, 90vw"
					loading="eager"
					className="object-cover transition duration-700 group-hover:scale-110"
					style={{ objectPosition: product.imagePosition ?? "center" }}
				/>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,242,232,0.18),transparent_42%)]" />
			</div>
			<div className="p-5">
				<div className="flex items-start justify-between gap-4">
					<h3 className="font-display text-2xl leading-7 text-[var(--navy)]">
						{product.title}
					</h3>
					<span className="font-display text-2xl text-[var(--clay)]">
						{product.price}
					</span>
				</div>
				<p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
					{product.description}
				</p>
				<p className="mt-5 text-sm font-semibold text-[var(--clay)]">
					View item {"->"}
				</p>
			</div>
		</Link>
	);
}

export function QuotePanel({ quote }: { quote: string }) {
	return (
		<aside className="parchment-card relative overflow-hidden p-8 text-center">
			<div className="absolute -right-10 -top-10 size-40 rounded-full border border-[rgba(184,112,81,0.4)]" />
			<p className="font-display text-3xl italic leading-10 text-[var(--navy)]">
				&ldquo;{quote}&rdquo;
			</p>
			<div className="mx-auto mt-6 h-px w-24 bg-[var(--copper)]" />
		</aside>
	);
}
