export type NavItem = {
	label: string;
	href: string;
};

export type WritingWorld = {
	kicker: string;
	title: string;
	description: string;
	detail: string;
	image: string;
	imageAlt: string;
	imagePosition?: string;
	slug?: string;
};

export type GalleryItem = {
	title: string;
	type: string;
	description: string;
	image: string;
	imageAlt: string;
	imagePosition?: string;
	slug?: string;
};

export type BlogPost = {
	title: string;
	category: string;
	date: string;
	excerpt: string;
	image: string;
	imageAlt: string;
	imagePosition?: string;
	readTime: string;
	body?: string;
	slug?: string;
};

export type Product = {
	title: string;
	price: string;
	description: string;
	image: string;
	imageAlt: string;
	imagePosition?: string;
	slug?: string;
};

export type SocialPlatform =
	| "instagram"
	| "threads"
	| "bluesky"
	| "goodreads";

export type SocialLink = {
	label: string;
	handle: string;
	href: string;
	platform: SocialPlatform;
};

export const navItems: NavItem[] = [
	{ label: "Landing Page", href: "/" },
	{ label: "Gallery", href: "/gallery" },
	{ label: "About", href: "/#about" },
	{ label: "Contact", href: "/contact" },
	{ label: "Shop", href: "/shop" },
	{ label: "Blog", href: "/blog" },
	{ label: "Login", href: "/admin" },
];

export const author = {
	name: "Yashoda U. Itwaru",
	brand: "InkedByYashie",
	alias: "@inkedbyyashie",
	shortName: "Yashie",
	title: "Writer. Author. Storyteller.",
	tagline:
		"Adult dark fantasy and dark urban fantasy inspired by Hinduism, Indo-Guyanese memory, rebellion, and identity.",
	quote:
		"I don't just write to be read. I write to understand, heal, remember, and leave behind pieces of me.",
	email: "yashodauitwaru.pa@gmail.com",
	location: "Indo-Guyanese Hindu author world",
	values: [
		"Indo-Guyanese Hindu",
		"Genderfluid and DemiAroAce",
		"Adult dark fantasy author",
		"AI ethics in healthcare and creative industries",
		"LGBTQIA+ friendly",
		"Anti-fascism and Pro-Palestine",
	],
};

export const worlds: WritingWorld[] = [
	{
		kicker: "Essays",
		title: "Thoughts in Ink & Life",
		description:
			"Essays on memory, culture, quiet magic, and the rituals that keep a person whole.",
		detail:
			"Personal nonfiction rooted in everyday life, healing, and hard-won tenderness.",
		image: "/images/artworks/music-bird-floral-ornament.jpg",
		imageAlt: "Black line art of music notes, a bird, flowers, and ornamental flourishes.",
	},
	{
		kicker: "Reflections",
		title: "Letters to My Younger Self",
		description:
			"Notes about shame, growth, identity, and the culture that became a home again.",
		detail:
			"Soft, intimate pieces for readers who are still learning how to return to themselves.",
		image: "/images/artworks/lotus-dove-ornament.jpg",
		imageAlt: "Black line art of a dove rising through lotus flowers and curling vines.",
	},
	{
		kicker: "Books & Stories",
		title: "Books, Stories & Everything Between",
		description:
			"Fiction, non-fiction, and tales stitched with faith, truth, grief, and devotion.",
		detail:
			"Previews of dark fantasy worlds, short stories, and character-centered mythic arcs.",
		image: "/images/artworks/anirvrita-samsaya-vadha-collage.png",
		imageAlt: "Three-panel story collage with forest, temple, and urban fantasy scenes.",
		imagePosition: "center",
	},
	{
		kicker: "Poetry",
		title: "Poems That Breathe",
		description:
			"Poems about love, longing, nature, softness, and the blade edge of survival.",
		detail:
			"Short lyrical fragments for moments where prose would make too much noise.",
		image: "/images/artworks/peacock-veena-ornament.jpg",
		imageAlt: "Black line art of a peacock with a veena among lotus ornaments.",
	},
	{
		kicker: "Blog Posts",
		title: "Musings on Life & More",
		description:
			"Reading notes, travel sparks, craft thoughts, and behind-the-page reflections.",
		detail:
			"A living notebook of the ideas that orbit the larger book world.",
		image: "/images/artworks/red-muse-portrait.jpg",
		imageAlt: "Red-toned portrait of a woman framed by flowers and musical details.",
		imagePosition: "center 22%",
	},
];

export const galleryItems: GalleryItem[] = [
	{
		title: "Anirvrita, Samsaya, Vadha",
		type: "Story Triptych",
		description:
			"A three-window look at forest, temple, and city threads inside the wider book universe.",
		image: "/images/artworks/anirvrita-samsaya-vadha-collage.png",
		imageAlt: "A vertical collage labeled Anirvrita, Samsaya, and Vadha.",
	},
	{
		title: "Wolf Throne",
		type: "Dark Fantasy Art",
		description:
			"An armored ruler, two red-eyed wolves, and the brutal hush of a throne room.",
		image: "/images/artworks/wolf-throne-warrior.png",
		imageAlt: "Dark fantasy warrior seated on a throne between two black wolves.",
		imagePosition: "center 16%",
	},
	{
		title: "Violet Trident",
		type: "Character Art",
		description:
			"A smoke-wreathed figure with a golden trident, built for mythic tension and power.",
		image: "/images/artworks/violet-trident-goddess.png",
		imageAlt: "Purple fantasy portrait of a woman holding a golden trident.",
		imagePosition: "center 18%",
	},
	{
		title: "Swordbound",
		type: "Book Scene",
		description:
			"A guarded romantic duel scene with blades, water, and a bright, uneasy horizon.",
		image: "/images/artworks/swordbound-couple-duel.jpg",
		imageAlt: "Illustrated couple holding swords against a golden water background.",
		imagePosition: "center 18%",
	},
	{
		title: "Palace Window",
		type: "Romance Study",
		description:
			"Warm palace light, close posture, and a quieter piece of the emotional arc.",
		image: "/images/artworks/palace-window-embrace.jpg",
		imageAlt: "Painted couple seated together in warm palace window light.",
		imagePosition: "center 20%",
	},
	{
		title: "Firelit Water",
		type: "Romance Study",
		description:
			"A charged embrace in water with lotus leaves and fire filling the distance.",
		image: "/images/artworks/firelit-water-embrace.png",
		imageAlt: "Painted couple embracing in water before a wall of fire.",
		imagePosition: "center 18%",
	},
];

export const blogPosts: BlogPost[] = [
	{
		title: "The Beauty of Becoming You",
		category: "Reflection",
		date: "May 12, 2024",
		excerpt:
			"On finding courage in small choices and choosing yourself without apology.",
		image: "/images/artworks/red-muse-portrait.jpg",
		imageAlt: "Red-toned portrait of a woman against floral and musical ornament.",
		imagePosition: "center 20%",
		readTime: "5 min",
	},
	{
		title: "Writing as Therapy",
		category: "Essay",
		date: "May 5, 2024",
		excerpt:
			"How the page can hold what the heart is not ready to say out loud.",
		image: "/images/artworks/bird-blade-floral-ornament.png",
		imageAlt: "Black line art of a bird, curved blade, flowers, and scrollwork.",
		readTime: "7 min",
	},
	{
		title: "Books That Changed Me",
		category: "Blog",
		date: "Apr 27, 2024",
		excerpt:
			"A reading list of books that rewired thought, craft, and tenderness.",
		image: "/images/artworks/chibi-family-cast.jpg",
		imageAlt: "Warm chibi-style cast scene gathered around a blue peacock mascot.",
		imagePosition: "center 18%",
		readTime: "6 min",
	},
	{
		title: "To the Girl I Used to Be",
		category: "Poetry",
		date: "Apr 20, 2024",
		excerpt:
			"A poem for the self who kept going, even before she had language for it.",
		image: "/images/artworks/lotus-bone-hand-ornament.png",
		imageAlt: "Black line art of a skeletal hand reaching through lotus ornament.",
		readTime: "3 min",
	},
];

export const products: Product[] = [
	{
		title: "Signed Copy of My Book",
		price: "$28",
		description: "An autographed edition with a tucked-in thank-you note.",
		image: "/images/artworks/yashie-author-signature.png",
		imageAlt: "Maroon Yashoda Itwaru signature mark with a peacock form.",
		imagePosition: "center",
	},
	{
		title: "Art Prints & Posters",
		price: "$18",
		description: "Botanical and literary prints for shelves, desks, and reading nooks.",
		image: "/images/artworks/griffin-sword-ornament.jpg",
		imageAlt: "Black line art of a griffin wrapped around a vertical sword.",
	},
	{
		title: "Stationery & Notebooks",
		price: "$16",
		description: "Notebooks for writers, dreamers, and annotators.",
		image: "/images/artworks/lotus-blade-ornament.jpg",
		imageAlt: "Black line art of an ornamental blade with lotus flowers.",
	},
	{
		title: "Bookmarks & Accessories",
		price: "$12",
		description: "Peacock feather bookmarks and small desk treasures.",
		image: "/images/artworks/blue-peacock-mascot.png",
		imageAlt: "Cute blue peacock mascot on a transparent background.",
		imagePosition: "center",
	},
	{
		title: "Merch Collection",
		price: "$34",
		description: "A tote and small goods for carrying the book world with you.",
		image: "/images/artworks/chibi-forest-campfire.jpg",
		imageAlt: "Chibi-style forest campsite scene with two figures beside a campfire.",
		imagePosition: "center 15%",
	},
];

export const socials: SocialLink[] = [
	{
		label: "Instagram",
		handle: "@inkedbyyashie",
		href: "https://www.instagram.com/inkedbyyashie",
		platform: "instagram",
	},
	{
		label: "Threads",
		handle: "@inkedbyyashie",
		href: "https://www.threads.com/@inkedbyyashie",
		platform: "threads",
	},
	{
		label: "Bluesky",
		handle: "@inkedbyyashie.bsky.social",
		href: "https://bsky.app/profile/inkedbyyashie.bsky.social",
		platform: "bluesky",
	},
	{
		label: "Goodreads",
		handle: "@inkedbyyashie",
		href: "https://www.goodreads.com",
		platform: "goodreads",
	},
];

export const profileFacts = [
	"Indo-Guyanese Hindu writer inspired by Hinduism and family memory.",
	"Adult dark fantasy and dark urban fantasy author.",
	"Computer science graduate work focused on AI ethics in healthcare and creative industries.",
	"Open to respectful DMs and community conversation.",
	"Writing as a love letter to culture, identity, resistance, and reclamation.",
];

export function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function getWorldHref(world: WritingWorld) {
	return `/worlds/${world.slug ?? slugify(world.title)}`;
}

export function getGalleryHref(item: GalleryItem) {
	return `/gallery/${item.slug ?? slugify(item.title)}`;
}

export function getBlogHref(post: BlogPost) {
	return `/blog/${post.slug ?? slugify(post.title)}`;
}

export function getProductHref(product: Product) {
	return `/shop/${product.slug ?? slugify(product.title)}`;
}

export function findWorldBySlug(slug: string, items: WritingWorld[] = worlds) {
	return items.find((world) => (world.slug ?? slugify(world.title)) === slug);
}

export function findGalleryItemBySlug(slug: string, items: GalleryItem[] = galleryItems) {
	return items.find((item) => (item.slug ?? slugify(item.title)) === slug);
}

export function findBlogPostBySlug(slug: string, posts: BlogPost[] = blogPosts) {
	return posts.find((post) => (post.slug ?? slugify(post.title)) === slug);
}

export function findProductBySlug(slug: string, items: Product[] = products) {
	return items.find((product) => (product.slug ?? slugify(product.title)) === slug);
}
