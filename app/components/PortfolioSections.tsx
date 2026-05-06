import Image from "next/image";
import Link from "next/link";
import type {
	BlogPost,
	GalleryItem,
	Product,
	WritingWorld,
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
	image = "/images/portfolio/ornamental-panel.png",
}: {
	title: string;
	description: string;
	image?: string;
}) {
	return (
		<section className="section-band border-b border-[rgba(184,112,81,0.4)]">
			<div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
				<div className="self-center">
					<p className="script-label">InkedByYashie</p>
					<h1 className="font-display text-5xl leading-none text-[var(--navy)] sm:text-6xl">
						{title}
					</h1>
					<p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">
						{description}
					</p>
				</div>
				<div className="ornament-frame relative min-h-56 overflow-hidden">
					<Image
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
		<article className="parchment-card group flex min-h-full flex-col overflow-hidden p-4">
			<div className="relative mb-4 h-28 overflow-hidden border border-[rgba(184,112,81,0.45)]">
				<Image
					src={world.image}
					alt={world.imageAlt}
					fill
					sizes="(min-width: 1024px) 20vw, 80vw"
					className="object-cover opacity-85 transition duration-500 group-hover:scale-105"
				/>
			</div>
			<p className="w-fit bg-[var(--navy-muted)] px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white">
				{world.kicker}
			</p>
			<h3 className="mt-3 font-display text-2xl leading-7 text-[var(--navy)]">
				{world.title}
			</h3>
			<p className="mt-3 flex-1 text-sm leading-6 text-[var(--ink-soft)]">
				{world.description}
			</p>
			<p className="mt-4 text-sm font-semibold text-[var(--clay)]">
				Read more {"->"}
			</p>
		</article>
	);
}

export function GalleryCard({ item }: { item: GalleryItem }) {
	return (
		<article className="group grid min-h-full gap-3">
			<div className="book-cover relative aspect-[3/4] overflow-hidden border border-[var(--copper)] bg-[var(--navy)] shadow-[0_18px_25px_rgba(14,38,61,0.22)]">
				<Image
					src={item.image}
					alt={item.imageAlt}
					fill
					sizes="(min-width: 1024px) 15vw, 45vw"
					className="object-cover transition duration-500 group-hover:scale-105"
					style={{ objectPosition: item.imagePosition ?? "center" }}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,34,55,0.84)] via-transparent to-transparent" />
				<div className="absolute inset-x-0 bottom-0 p-4 text-white">
					<h3 className="font-display text-2xl leading-6">{item.title}</h3>
					<p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
						{item.type}
					</p>
				</div>
			</div>
			<p className="text-sm leading-6 text-[var(--ink-soft)]">{item.description}</p>
		</article>
	);
}

export function BlogCard({ post }: { post: BlogPost }) {
	return (
		<article className="parchment-card group grid overflow-hidden sm:grid-cols-[0.85fr_1fr]">
			<div className="relative min-h-48 overflow-hidden border-b border-[rgba(184,112,81,0.45)] sm:border-b-0 sm:border-r">
				<Image
					src={post.image}
					alt={post.imageAlt}
					fill
					sizes="(min-width: 1024px) 22vw, 100vw"
					className="object-cover transition duration-500 group-hover:scale-105"
					style={{ objectPosition: post.imagePosition ?? "center" }}
				/>
			</div>
			<div className="p-5">
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
				<Link href="/blog" className="mt-4 inline-block text-sm font-semibold text-[var(--clay)]">
					Read mock post {"->"}
				</Link>
			</div>
		</article>
	);
}

export function ProductCard({ product }: { product: Product }) {
	return (
		<article className="parchment-card group overflow-hidden">
			<div className="relative aspect-[4/3] overflow-hidden border-b border-[rgba(184,112,81,0.45)]">
				<Image
					src={product.image}
					alt={product.imageAlt}
					fill
					sizes="(min-width: 1024px) 20vw, 90vw"
					className="object-cover transition duration-500 group-hover:scale-105"
					style={{ objectPosition: product.imagePosition ?? "center" }}
				/>
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
				<button className="mt-5 text-sm font-semibold text-[var(--clay)]">
					Shop mock item {"->"}
				</button>
			</div>
		</article>
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
