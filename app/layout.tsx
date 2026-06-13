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

export const metadata: Metadata = {
	title: {
		default: "Yashoda U. Itwaru | InkedByYashie",
		template: "%s | InkedByYashie",
	},
	description:
		"Personal portfolio for Yashoda U. Itwaru, also known as Yashie, an adult dark fantasy and dark urban fantasy author.",
	metadataBase: new URL("https://inkedbyyashie.com"),
	openGraph: {
		title: "Yashoda U. Itwaru | InkedByYashie",
		description:
			"Adult dark fantasy, dark urban fantasy, essays, poetry, and cultural reflections.",
		images: ["/images/artworks/firelit-water-embrace.png"],
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
