import { MobileCarousel } from "@/app/components/MobileCarousel";
import { SmartImage } from "@/app/components/SmartImage";
import { SocialIcon } from "@/app/components/SocialIcon";
import {
	getBlogHref,
	getGalleryHref,
	getProductHref,
	getWorldHref,
	type BlogPost,
	type GalleryItem,
	type Product,
	type WritingWorld,
} from "@/app/data/portfolio";
import { getYashieContent } from "@/lib/yashie-delivery";
import { getVisibleYashieNavTabs } from "@/lib/yashie-navigation-access";
import Link from "next/link";

function SectionRibbon({
	label,
	title,
}: {
	label: string;
	title: string;
}) {
	return (
		<div className="landing-ribbon">
			<h2>{title}</h2>
			<span>{label}</span>
		</div>
	);
}

function QuoteNote({
	quote,
	tone = "light",
}: {
	quote: string;
	tone?: "light" | "small";
}) {
	return (
		<aside className={`quote-note ${tone === "small" ? "quote-note-small" : ""}`}>
			<span aria-hidden="true" className="quote-note-pin" />
			<p>&ldquo;{quote}&rdquo;</p>
		</aside>
	);
}

function WorldNotebookCard({ world }: { world: WritingWorld }) {
	return (
		<Link
			href={getWorldHref(world)}
			className="world-notebook-card"
			aria-label={`Read more about ${world.title}`}
		>
			<span className="world-card-head">
				<span className="world-badge">{world.kicker}</span>
				<span className="world-card-art" aria-hidden="true">
					<SmartImage
						src={world.image}
						alt=""
						fill
						sizes="96px"
						className="object-cover"
						style={{ objectPosition: world.imagePosition ?? "center" }}
					/>
				</span>
			</span>
			<h3>{world.title}</h3>
			<p>{world.description}</p>
			<span className="read-link">Read more {"->"}</span>
		</Link>
	);
}

function GalleryBook({ item }: { item: GalleryItem }) {
	return (
		<Link
			href={getGalleryHref(item)}
			className="gallery-book-card"
			aria-label={`Open gallery item ${item.title}`}
		>
			<span className="gallery-book-cover">
				<SmartImage
					src={item.image}
					alt={item.imageAlt}
					fill
					sizes="(min-width: 1024px) 12vw, 48vw"
					className="object-cover"
					style={{ objectPosition: item.imagePosition ?? "center" }}
				/>
			</span>
			<strong>{item.title}</strong>
			<small>{item.type}</small>
		</Link>
	);
}

function BlogLeaf({ post }: { post: BlogPost }) {
	return (
		<Link
			href={getBlogHref(post)}
			className="blog-leaf-card"
			aria-label={`Read ${post.title}`}
		>
			<span className="blog-leaf-image">
				<SmartImage
					src={post.image}
					alt={post.imageAlt}
					fill
					sizes="(min-width: 1024px) 14vw, 80vw"
					className="object-cover"
					style={{ objectPosition: post.imagePosition ?? "center" }}
				/>
			</span>
			<span className="blog-category">{post.category}</span>
			<h3>{post.title}</h3>
			<p>{post.excerpt}</p>
			<span className="read-link">Read more {"->"}</span>
		</Link>
	);
}

function ShopShelfItem({ product }: { product: Product }) {
	return (
		<Link
			href={getProductHref(product)}
			className="shop-shelf-item"
			aria-label={`Open shop item ${product.title}`}
		>
			<span className="shop-shelf-image">
				<SmartImage
					src={product.image}
					alt={product.imageAlt}
					fill
					sizes="(min-width: 1024px) 13vw, 68vw"
					className="object-cover"
					style={{ objectPosition: product.imagePosition ?? "center" }}
				/>
			</span>
			<span>
				<strong>{product.title}</strong>
				<small>{product.description}</small>
				<em>Shop now {"->"}</em>
			</span>
		</Link>
	);
}

export default async function Home() {
	const content = await getYashieContent();
	const { author, profileFacts, socials, worlds } = content;
	const home = content.pageContent.home;
	const visibleTabs = getVisibleYashieNavTabs(content);
	const showAbout = visibleTabs.has("about");
	const showBlog = visibleTabs.has("blog");
	const showContact = visibleTabs.has("contact");
	const showGallery = visibleTabs.has("gallery");
	const showShop = visibleTabs.has("shop");

	return (
		<main className="landing-page">
			<section className="landing-hero" aria-labelledby="landing-title">
				<SmartImage
					src="/images/portfolio/background.webp"
					alt="Parchment writing desk with peacock notebook, ink, flowers, and brass objects."
					fill
					priority
					sizes="100vw"
					className="object-cover"
				/>
				<div className="landing-hero-content">
					<div className="landing-hero-copy">
						<p className="script-label">{home.intro.title}</p>
						<h1 id="landing-title">{author.name}</h1>
						<p
							className="landing-byline"
							aria-label={home.highlights.join(", ")}
						>
							{home.highlights.map((item, index) => (
								<span key={item} className="contents">
									{index > 0 ? (
										<span className="landing-byline-sparkle" aria-hidden="true">
											&#10022;
										</span>
									) : null}
									<span>{item}</span>
								</span>
							))}
						</p>
						<div className="landing-rule" />
						<p className="landing-intro">{home.intro.description}</p>
						{showBlog || showGallery ? (
							<div className="landing-actions">
								{showBlog ? (
									<Link href="/blog" className="button-primary">
										Read My Writings
									</Link>
								) : null}
								{showGallery ? (
									<Link href="/gallery" className="button-secondary">
										Explore Gallery
									</Link>
								) : null}
							</div>
						) : null}
						<p className="alias-slip">
							also known online as <span>{author.alias}</span>
						</p>
					</div>
					<div className="landing-hero-quote">
						<QuoteNote quote={author.quote} />
					</div>
				</div>
			</section>

			{worlds.length > 0 ? <section id="worlds" className="ink-manuscript-band">
				<div className="landing-container">
					<SectionRibbon title={home.listing.title} label={home.listing.label} />
					<p className="mb-6 max-w-2xl text-sm leading-6 text-[var(--parchment-soft)]">
						{home.listing.description}
					</p>
					<MobileCarousel
						label="World"
						tone="dark"
						desktopClassName="md:grid md:grid-cols-2 md:gap-3 xl:grid-cols-5"
					>
						{worlds.map((world) => (
							<WorldNotebookCard key={world.title} world={world} />
						))}
					</MobileCarousel>
				</div>
			</section> : null}

			{showGallery && content.galleryItems.length > 0 ? (
				<section className="manuscript-section manuscript-section-framed">
					<div className="landing-container">
						<div className="manuscript-paper">
							<div className="section-heading-line">
								<h2>{content.pageContent.gallery.intro.title}</h2>
								<p>{content.pageContent.gallery.intro.description}</p>
							</div>
							<div className="gallery-layout">
								<MobileCarousel
									label="Gallery"
									desktopClassName="md:grid md:grid-cols-3 md:gap-4 xl:grid-cols-6"
								>
									{content.galleryItems.slice(0, 6).map((item) => (
										<GalleryBook key={item.title} item={item} />
									))}
								</MobileCarousel>
								<QuoteNote quote={author.quote} tone="small" />
							</div>
						</div>
					</div>
				</section>
			) : null}

			{showBlog && content.blogPosts.length > 0 ? (
				<section className="manuscript-section manuscript-section-blog">
					<div className="landing-container">
						<div className="blog-ledger">
							<div className="blog-ledger-main">
								<div className="section-heading-line">
									<h2>{content.pageContent.blog.listing.title}</h2>
									<p>{content.pageContent.blog.listing.description}</p>
								</div>
								<MobileCarousel
									label="Post"
									desktopClassName="md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-4"
								>
									{content.blogPosts.map((post) => (
										<BlogLeaf key={post.title} post={post} />
									))}
								</MobileCarousel>
							</div>
							<div className="blog-side-note">
								<QuoteNote quote={content.pageContent.blog.feature.title} tone="small" />
								<div className="vertical-tabs" aria-hidden="true">
									{content.pageContent.blog.highlights.slice(0, 3).map((item) => (
										<span key={item}>{item}</span>
									))}
								</div>
							</div>
						</div>
					</div>
				</section>
			) : null}

			{showShop && content.products.length > 0 ? (
				<section className="shop-manuscript-strip">
					<div className="landing-container">
						<div className="section-heading-line">
							<h2>{content.pageContent.shop.intro.title}</h2>
							<p>{content.pageContent.shop.intro.description}</p>
						</div>
						<div className="shop-shelf">
							{content.products.map((product) => (
								<ShopShelfItem key={product.title} product={product} />
							))}
							<div className="shop-peacock" aria-hidden="true">
								<SmartImage
									src="/images/artworks/blue-peacock-mascot.png"
									alt=""
									fill
									sizes="180px"
									className="object-contain"
								/>
							</div>
						</div>
					</div>
				</section>
			) : null}

			{showAbout ? (
				<section id="about" className="about-ledger">
					<div className="landing-container about-ledger-grid">
						<div>
							<div className="section-heading-line">
								<h2>{home.feature.title}</h2>
								<p>{home.feature.label}</p>
							</div>
							<p className="about-copy">{home.feature.description}</p>
							<div className="fact-tags">
								{profileFacts.slice(0, 5).map((fact) => (
									<span key={fact}>{fact.split(" ")[0]}</span>
								))}
							</div>
						</div>

						{showContact ? (
							<div>
								<div className="section-heading-line">
									<h2>{content.pageContent.contact.listing.title}</h2>
									<p>{content.pageContent.contact.listing.description}</p>
								</div>
								<div className="social-ledger">
									{socials.map((social) => (
										<a
											key={social.label}
											href={social.href}
											target="_blank"
											rel="noreferrer"
										>
											<span className="social-orb">
												<SocialIcon platform={social.platform} />
											</span>
											<strong>{social.label}</strong>
											<small>{social.handle}</small>
										</a>
									))}
									<a href={`mailto:${author.email}`} className="social-ledger-email">
										<span className="social-orb">@</span>
										<strong>Email</strong>
										<small>{author.email}</small>
									</a>
								</div>
							</div>
						) : null}

						<div className="brand-seal">
							<div className="brand-seal-image">
								<SmartImage
									src="/images/artworks/yashie-author-signature.png"
									alt="Maroon Yashoda Itwaru signature mark with a peacock form."
									fill
									sizes="(min-width: 1024px) 18rem, 70vw"
									className="object-contain"
								/>
							</div>
						</div>
					</div>
				</section>
			) : null}
		</main>
	);
}
