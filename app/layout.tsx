import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { YashieToaster } from "@/app/components/YashieToaster";
import { getYashieContent } from "@/lib/yashie-delivery";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const siteTitle = "Yashoda U. Itwaru | InkedByYashie";
const siteDescription =
	"Writer, author, and storyteller sharing essays, poetry, personal reflections, books, dark fantasy, and cultural memory.";
const ogImage = {
	url: "/images/portfolio/background-og.jpg",
	width: 1200,
	height: 630,
	alt: "InkedByYashie writing desk with a book, ink, peacock feather, and manuscript textures.",
};

export const metadata: Metadata = {
	title: {
		default: siteTitle,
		template: "%s | InkedByYashie",
	},
	metadataBase: new URL("https://inkedbyyashie.com"),
	description: siteDescription,
	applicationName: "InkedByYashie",
	authors: [{ name: "Yashoda U. Itwaru" }],
	creator: "Yashoda U. Itwaru",
	publisher: "InkedByYashie",
	keywords: [
		"Yashoda U. Itwaru",
		"InkedByYashie",
		"Yashie",
		"writer",
		"author",
		"storyteller",
		"dark fantasy",
		"poetry",
		"essays",
	],
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		siteName: "InkedByYashie",
		title: siteTitle,
		description: siteDescription,
		images: [ogImage],
	},
	twitter: {
		card: "summary_large_image",
		title: siteTitle,
		description: siteDescription,
		images: [ogImage],
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const content = await getYashieContent();

	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full">
				<SiteHeader author={content.author} navItems={content.navItems} />
				{children}
				<SiteFooter
					author={content.author}
					navItems={content.navItems}
					socials={content.socials}
				/>
				<YashieToaster />
				<Analytics />
			</body>
		</html>
	);
}
