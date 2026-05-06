import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/app/components/MockForms";
import { PageIntro, SectionHeader } from "@/app/components/PortfolioSections";
import { author, socials } from "@/app/data/portfolio";

export const metadata: Metadata = {
	title: "Contact | Yashoda U. Itwaru",
	description:
		"Mock contact page for Yashoda U. Itwaru, also known as InkedByYashie.",
};

export default function ContactPage() {
	return (
		<main>
			<PageIntro
				title="Let's Connect"
				description="Reach out for respectful conversation, community, writing updates, collaborations, and future reader opportunities."
				image="/images/portfolio/ornamental-panel.png"
			/>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
					<div>
						<SectionHeader
							label="Social shelf"
							title={`Find ${author.shortName}`}
							description={`Most links use the public handle ${author.alias} or the InkedByYashie brand. This is a mock contact experience.`}
						/>
						<div className="grid gap-3">
							{socials.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noreferrer"
									className="social-row parchment-card p-4"
								>
									<span className="social-orb">{social.label.slice(0, 1)}</span>
									<span>
										<span className="block font-display text-2xl text-[var(--navy)]">
											{social.label}
										</span>
										<span className="text-sm text-[var(--ink-soft)]">
											{social.handle}
										</span>
									</span>
								</a>
							))}
						</div>
					</div>

					<div>
						<SectionHeader
							label="Send a note"
							title="A respectful DM, formalized"
							description="The form confirms a mock state only. No message is sent."
						/>
						<ContactForm />
					</div>
				</div>
			</section>

			<section className="bg-[var(--navy)] px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
					<div className="self-center text-[var(--parchment)]">
						<p className="script-label text-[var(--gold)]">Respect first</p>
						<h2 className="font-display text-5xl leading-tight text-[var(--gold)]">
							Open to DMs, so long as everyone is respectful.
						</h2>
						<p className="mt-4 max-w-xl text-base leading-8 text-[var(--parchment-soft)]">
							This page keeps the boundary clear while making the route feel
							like part of the same book-world system.
						</p>
					</div>
					<div className="ornament-frame relative min-h-80 overflow-hidden">
						<Image
							src="/images/portfolio/hero-still-life.png"
							alt="A warm literary desk with parchment, an ink pot, and a peacock feather."
							fill
							sizes="(min-width: 1024px) 45vw, 100vw"
							className="object-cover"
						/>
					</div>
				</div>
			</section>
		</main>
	);
}
