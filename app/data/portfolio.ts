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
};

export type GalleryItem = {
	title: string;
	type: string;
	description: string;
	image: string;
	imageAlt: string;
	imagePosition?: string;
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
};

export type Product = {
	title: string;
	price: string;
	description: string;
	image: string;
	imageAlt: string;
	imagePosition?: string;
};

export type SocialLink = {
	label: string;
	handle: string;
	href: string;
};

export const navItems: NavItem[] = [
	{ label: "Landing Page", href: "/" },
	{ label: "Gallery", href: "/gallery" },
	{ label: "About", href: "/#about" },
	{ label: "Contact", href: "/contact" },
	{ label: "Shop", href: "/shop" },
	{ label: "Blog", href: "/blog" },
	{ label: "Login", href: "/login" },
];

export const author = {
	name: "Yashoda U. Itwaru",
	brand: "InkedByYashie",
	alias: "@samrajni",
	shortName: "Yashie",
	title: "Writer. Author. Storyteller.",
	tagline:
		"Adult dark fantasy and dark urban fantasy inspired by Hinduism, Indo-Guyanese memory, rebellion, and identity.",
	quote:
		"I don't just write to be read. I write to understand, heal, remember, and leave behind pieces of me.",
	email: "hello@inkedbyyashie.com",
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
		image: "/images/portfolio/blog-collage.png",
		imageAlt: "A parchment writing desk with flowers, books, and a peacock feather.",
	},
	{
		kicker: "Reflections",
		title: "Letters to My Younger Self",
		description:
			"Notes about shame, growth, identity, and the culture that became a home again.",
		detail:
			"Soft, intimate pieces for readers who are still learning how to return to themselves.",
		image: "/images/portfolio/ornamental-panel.png",
		imageAlt: "A peacock and botanical manuscript ornament on parchment.",
	},
	{
		kicker: "Books & Stories",
		title: "Books, Stories & Everything Between",
		description:
			"Fiction, non-fiction, and tales stitched with faith, truth, grief, and devotion.",
		detail:
			"Mock previews of dark fantasy worlds, short stories, and character-centered mythic arcs.",
		image: "/images/portfolio/gallery-book-covers.png",
		imageAlt: "Five ornate dark fantasy book covers without readable text.",
	},
	{
		kicker: "Poetry",
		title: "Poems That Breathe",
		description:
			"Poems about love, longing, nature, softness, and the blade edge of survival.",
		detail:
			"Short lyrical fragments for moments where prose would make too much noise.",
		image: "/images/portfolio/hero-still-life.png",
		imageAlt: "A navy writer's desk with parchment, pen, and peacock details.",
	},
	{
		kicker: "Blog Posts",
		title: "Musings on Life & More",
		description:
			"Reading notes, travel sparks, craft thoughts, and behind-the-page reflections.",
		detail:
			"A living notebook of the ideas that orbit the larger book world.",
		image: "/images/portfolio/blog-collage.png",
		imageAlt: "A collage of warm bookish writing scenes.",
	},
];

export const galleryItems: GalleryItem[] = [
	{
		title: "Ink Stains of a Restless Soul",
		type: "Poetry Collection",
		description:
			"A mock collection of poems about inheritance, ache, survival, and sacred return.",
		image: "/images/portfolio/gallery-book-covers.png",
		imageAlt: "An ornate navy mock book cover with peacock-inspired copper detailing.",
		imagePosition: "left center",
	},
	{
		title: "Rooted in Ruminations",
		type: "Reflection Journal",
		description:
			"A journal-shaped world for cultural memory, self-forgiveness, and difficult growth.",
		image: "/images/portfolio/gallery-book-covers.png",
		imageAlt: "A teal mock journal cover with botanical copper ornaments.",
		imagePosition: "35% center",
	},
	{
		title: "Letters I Never Mailed",
		type: "Personal Writings",
		description:
			"Fragments of unsent truth, grief, tenderness, and conversations with the past.",
		image: "/images/portfolio/gallery-book-covers.png",
		imageAlt: "A blush mock journal cover with antique botanical ornament.",
		imagePosition: "72% center",
	},
	{
		title: "Whispers Between the Lines",
		type: "Short Stories",
		description:
			"Dark urban fantasy vignettes where city streets hold old prayers and older teeth.",
		image: "/images/portfolio/gallery-book-covers.png",
		imageAlt: "A navy mock book cover with copper filigree.",
		imagePosition: "55% center",
	},
	{
		title: "The Art of Becoming Unapologetic",
		type: "Essays",
		description:
			"Essays about refusing erasure and writing toward the self that survived.",
		image: "/images/portfolio/blog-collage.png",
		imageAlt: "A writing desk with blank parchment, flowers, and a fountain pen.",
		imagePosition: "left top",
	},
	{
		title: "Moonlight Memos",
		type: "Poetry & Prose",
		description:
			"Small luminous pieces about longing, softness, grief, and the night sky.",
		image: "/images/portfolio/ornamental-panel.png",
		imageAlt: "A peacock and floral manuscript panel on parchment.",
		imagePosition: "right center",
	},
];

export const blogPosts: BlogPost[] = [
	{
		title: "The Beauty of Becoming You",
		category: "Reflection",
		date: "May 12, 2024",
		excerpt:
			"On finding courage in small choices and choosing yourself without apology.",
		image: "/images/portfolio/blog-collage.png",
		imageAlt: "An open journal with pressed flowers and peacock feather details.",
		imagePosition: "left top",
		readTime: "5 min",
	},
	{
		title: "Writing as Therapy",
		category: "Essay",
		date: "May 5, 2024",
		excerpt:
			"How the page can hold what the heart is not ready to say out loud.",
		image: "/images/portfolio/blog-collage.png",
		imageAlt: "A blank parchment page and fountain pen on a dark ornate desk.",
		imagePosition: "left bottom",
		readTime: "7 min",
	},
	{
		title: "Books That Changed Me",
		category: "Blog",
		date: "Apr 27, 2024",
		excerpt:
			"A mock reading list of books that rewired thought, craft, and tenderness.",
		image: "/images/portfolio/blog-collage.png",
		imageAlt: "A stack of ornate books with warm lamplight.",
		imagePosition: "right top",
		readTime: "6 min",
	},
	{
		title: "To the Girl I Used to Be",
		category: "Poetry",
		date: "Apr 20, 2024",
		excerpt:
			"A poem for the self who kept going, even before she had language for it.",
		image: "/images/portfolio/blog-collage.png",
		imageAlt: "A teacup, peacock feather, and parchment in warm light.",
		imagePosition: "right bottom",
		readTime: "3 min",
	},
];

export const products: Product[] = [
	{
		title: "Signed Copy of My Book",
		price: "$28",
		description: "A mock autographed edition with a tucked-in thank-you note.",
		image: "/images/portfolio/shop-flatlay.png",
		imageAlt: "A navy clothbound mock book with peacock ornamentation.",
		imagePosition: "left top",
	},
	{
		title: "Art Prints & Posters",
		price: "$18",
		description: "Botanical and literary prints for shelves, desks, and reading nooks.",
		image: "/images/portfolio/shop-flatlay.png",
		imageAlt: "A botanical peacock-inspired art print on cream paper.",
		imagePosition: "45% 15%",
	},
	{
		title: "Stationery & Notebooks",
		price: "$16",
		description: "Mock notebooks for writers, dreamers, and annotators.",
		image: "/images/portfolio/shop-flatlay.png",
		imageAlt: "A navy notebook with copper botanical decoration.",
		imagePosition: "18% 83%",
	},
	{
		title: "Bookmarks & Accessories",
		price: "$12",
		description: "Peacock feather bookmarks and small desk treasures.",
		image: "/images/portfolio/shop-flatlay.png",
		imageAlt: "A peacock feather bookmark with a navy tassel.",
		imagePosition: "50% 72%",
	},
	{
		title: "Merch Collection",
		price: "$34",
		description: "A mock tote and small goods for carrying the book world with you.",
		image: "/images/portfolio/shop-flatlay.png",
		imageAlt: "A cream tote bag with peacock and floral ornamentation.",
		imagePosition: "right center",
	},
];

export const socials: SocialLink[] = [
	{ label: "Instagram", handle: "@samrajni", href: "https://www.instagram.com/samrajni" },
	{ label: "Threads", handle: "@inkedbyyashie", href: "https://www.threads.com/@inkedbyyashie" },
	{ label: "Bluesky", handle: "@inkedbyyashie.bsky.social", href: "https://bsky.app/profile/inkedbyyashie.bsky.social" },
	{ label: "Linktree", handle: "inkedbyyashie", href: "https://linktr.ee/inkedbyyashie" },
	{ label: "YouTube", handle: "@samrajni", href: "https://www.youtube.com/@samrajni" },
	{ label: "Goodreads", handle: "@samrajni", href: "https://www.goodreads.com" },
];

export const profileFacts = [
	"Indo-Guyanese Hindu writer inspired by Hinduism and family memory.",
	"Adult dark fantasy and dark urban fantasy author.",
	"Computer science graduate work focused on AI ethics in healthcare and creative industries.",
	"Open to respectful DMs and community conversation.",
	"Writing as a love letter to culture, identity, resistance, and reclamation.",
];
