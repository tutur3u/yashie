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
	{ label: "Home", href: "/" },
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
		image: "/images/portfolio/items/world-essays.jpg",
		imageAlt: "An open parchment journal with ink blooms, marigold petals, and a peacock feather.",
	},
	{
		kicker: "Reflections",
		title: "Letters to My Younger Self",
		description:
			"Notes about shame, growth, identity, and the culture that became a home again.",
		detail:
			"Soft, intimate pieces for readers who are still learning how to return to themselves.",
		image: "/images/portfolio/items/world-reflections.jpg",
		imageAlt: "A sealed blush envelope, mirror shard, wax seal, and peacock eye motifs.",
	},
	{
		kicker: "Books & Stories",
		title: "Books, Stories & Everything Between",
		description:
			"Fiction, non-fiction, and tales stitched with faith, truth, grief, and devotion.",
		detail:
			"Mock previews of dark fantasy worlds, short stories, and character-centered mythic arcs.",
		image: "/images/portfolio/items/world-stories.jpg",
		imageAlt: "A stack of clothbound fantasy books with teal smoke and copper filigree.",
	},
	{
		kicker: "Poetry",
		title: "Poems That Breathe",
		description:
			"Poems about love, longing, nature, softness, and the blade edge of survival.",
		detail:
			"Short lyrical fragments for moments where prose would make too much noise.",
		image: "/images/portfolio/items/world-poetry.jpg",
		imageAlt: "Moonlit paper leaves, a quill, lotus petals, and a peacock feather.",
	},
	{
		kicker: "Blog Posts",
		title: "Musings on Life & More",
		description:
			"Reading notes, travel sparks, craft thoughts, and behind-the-page reflections.",
		detail:
			"A living notebook of the ideas that orbit the larger book world.",
		image: "/images/portfolio/items/world-blog.jpg",
		imageAlt: "A travel-worn notebook, chai, compass, flowers, and peacock feather shadows.",
	},
];

export const galleryItems: GalleryItem[] = [
	{
		title: "Ink Stains of a Restless Soul",
		type: "Poetry Collection",
		description:
			"A mock collection of poems about inheritance, ache, survival, and sacred return.",
		image: "/images/portfolio/items/gallery-ink-stains.jpg",
		imageAlt: "An ornate navy mock book cover with peacock-inspired copper detailing.",
	},
	{
		title: "Rooted in Ruminations",
		type: "Reflection Journal",
		description:
			"A journal-shaped world for cultural memory, self-forgiveness, and difficult growth.",
		image: "/images/portfolio/items/gallery-rooted.jpg",
		imageAlt: "A teal mock journal cover with botanical copper ornaments.",
	},
	{
		title: "Letters I Never Mailed",
		type: "Personal Writings",
		description:
			"Fragments of unsent truth, grief, tenderness, and conversations with the past.",
		image: "/images/portfolio/items/gallery-letters.jpg",
		imageAlt: "A blush mock journal cover with antique botanical ornament.",
	},
	{
		title: "Whispers Between the Lines",
		type: "Short Stories",
		description:
			"Dark urban fantasy vignettes where city streets hold old prayers and older teeth.",
		image: "/images/portfolio/items/gallery-whispers.jpg",
		imageAlt: "A navy mock book cover with copper filigree.",
	},
	{
		title: "The Art of Becoming Unapologetic",
		type: "Essays",
		description:
			"Essays about refusing erasure and writing toward the self that survived.",
		image: "/images/portfolio/items/gallery-unapologetic.jpg",
		imageAlt: "A bold navy mock essay cover with copper sunburst botanical ornament.",
	},
	{
		title: "Moonlight Memos",
		type: "Poetry & Prose",
		description:
			"Small luminous pieces about longing, softness, grief, and the night sky.",
		image: "/images/portfolio/items/gallery-moonlight.jpg",
		imageAlt: "A midnight blue mock poetry cover with moon phases, lotus flowers, and peacock arcs.",
	},
];

export const blogPosts: BlogPost[] = [
	{
		title: "The Beauty of Becoming You",
		category: "Reflection",
		date: "May 12, 2024",
		excerpt:
			"On finding courage in small choices and choosing yourself without apology.",
		image: "/images/portfolio/items/blog-becoming.jpg",
		imageAlt: "A brass mirror reflecting a lotus, with marigold petals and a peacock feather.",
		readTime: "5 min",
	},
	{
		title: "Writing as Therapy",
		category: "Essay",
		date: "May 5, 2024",
		excerpt:
			"How the page can hold what the heart is not ready to say out loud.",
		image: "/images/portfolio/items/blog-therapy.jpg",
		imageAlt: "A fountain pen beside handmade blank paper, ink rings, flowers, and a copper paperweight.",
		readTime: "7 min",
	},
	{
		title: "Books That Changed Me",
		category: "Blog",
		date: "Apr 27, 2024",
		excerpt:
			"A mock reading list of books that rewired thought, craft, and tenderness.",
		image: "/images/portfolio/items/blog-books.jpg",
		imageAlt: "A tower of ornate clothbound books, a glowing open book, and copper dust.",
		readTime: "6 min",
	},
	{
		title: "To the Girl I Used to Be",
		category: "Poetry",
		date: "Apr 20, 2024",
		excerpt:
			"A poem for the self who kept going, even before she had language for it.",
		image: "/images/portfolio/items/blog-girl.jpg",
		imageAlt: "An open keepsake box with a folded blank letter, moon charm, ribbon, and peacock feather.",
		readTime: "3 min",
	},
];

export const products: Product[] = [
	{
		title: "Signed Copy of My Book",
		price: "$28",
		description: "A mock autographed edition with a tucked-in thank-you note.",
		image: "/images/portfolio/items/shop-signed-book.jpg",
		imageAlt: "A navy clothbound mock book with peacock ornamentation.",
	},
	{
		title: "Art Prints & Posters",
		price: "$18",
		description: "Botanical and literary prints for shelves, desks, and reading nooks.",
		image: "/images/portfolio/items/shop-prints.jpg",
		imageAlt: "Deckled-edge botanical art prints with peacock, lotus, and copper vine motifs.",
	},
	{
		title: "Stationery & Notebooks",
		price: "$16",
		description: "Mock notebooks for writers, dreamers, and annotators.",
		image: "/images/portfolio/items/shop-stationery.jpg",
		imageAlt: "Two ornate notebooks, blank cards, wax seal stickers, and a peacock feather pen.",
	},
	{
		title: "Bookmarks & Accessories",
		price: "$12",
		description: "Peacock feather bookmarks and small desk treasures.",
		image: "/images/portfolio/items/shop-bookmarks.jpg",
		imageAlt: "Peacock feather bookmarks, tassels, copper charms, and lotus pins.",
	},
	{
		title: "Merch Collection",
		price: "$34",
		description: "A mock tote and small goods for carrying the book world with you.",
		image: "/images/portfolio/items/shop-merch.jpg",
		imageAlt: "A cream tote, folded navy scarf, enamel pin, sticker sheet, and small notebook.",
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
