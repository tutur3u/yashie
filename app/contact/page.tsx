import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ContactForm } from "@/app/components/MockForms";
import { PageIntro, SectionHeader } from "@/app/components/PortfolioSections";
import { SocialIcon } from "@/app/components/SocialIcon";
import { getYashieContent } from "@/lib/yashie-delivery";
import { canAccessYashieNavTab } from "@/lib/yashie-navigation-access";

export const metadata: Metadata = {
	title: "Contact | Yashoda U. Itwaru",
	description:
		"Mock contact page for Yashoda U. Itwaru, also known as InkedByYashie.",
};

export default async function ContactPage() {
	const content = await getYashieContent();
	const { author, socials } = content;

	if (!(await canAccessYashieNavTab(content, "contact"))) {
		notFound();
	}

	return (
		<main>
			<PageIntro
				title="Contact"
				description="Reach out for respectful conversation, community, writing updates, collaborations, and future reader opportunities."
				image="/images/artworks/lotus-dove-ornament.jpg"
			/>

			<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
					<div className="min-w-0">
						<SectionHeader
							label="Social shelf"
							title={`Find ${author.shortName}`}
							description={`Most links use the public handle ${author.alias} or the InkedByYashie brand. This is a mock contact experience.`}
						/>
						<div className="parchment-card mb-5 min-w-0 p-5">
							<p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--clay)]">
								Preferred note
							</p>
							<a
								href={`mailto:${author.email}`}
								className="mt-2 block max-w-full overflow-x-auto whitespace-nowrap font-display text-2xl leading-tight text-[var(--navy)] transition hover:text-[var(--clay)] sm:text-3xl"
							>
								{author.email}
							</a>
							<p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
								Best for collaboration requests, reader notes, interview
								inquiries, and respectful community messages.
							</p>
						</div>
						<div className="grid gap-3">
							{socials.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noreferrer"
									className="social-row parchment-card p-4"
								>
									<span className="social-orb">
										<SocialIcon platform={social.platform} />
									</span>
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
						<div className="mt-5 grid gap-3 sm:grid-cols-3">
							{[
								{
									topic: "Writing",
									description: "Essays, interviews, and reader letters.",
								},
								{
									topic: "Collaborations",
									description: "Panels, launches, and creative projects.",
								},
								{
									topic: "Community",
									description: "Respectful DMs and book-world updates.",
								},
							].map((item) => (
								<div key={item.topic} className="parchment-card p-4">
									<p className="font-display text-2xl text-[var(--navy)]">
										{item.topic}
									</p>
									<p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
										{item.description}
									</p>
								</div>
							))}
						</div>
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
							src="/images/artworks/yashie-author-signature.png"
							alt="Maroon Yashoda Itwaru signature mark with a peacock form."
							fill
							sizes="(min-width: 1024px) 45vw, 100vw"
							className="object-contain p-8"
						/>
					</div>
				</div>
			</section>
		</main>
	);
}
