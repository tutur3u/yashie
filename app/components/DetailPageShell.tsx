import Link from "next/link";
import type { ReactNode } from "react";
import { SmartImage } from "@/app/components/SmartImage";

type DetailPageShellProps = {
	backHref: string;
	backLabel: string;
	children: ReactNode;
	description: string;
	eyebrow: string;
	image: string;
	imageAlt: string;
	imagePosition?: string;
	meta: string[];
	nextHref?: string;
	nextLabel?: string;
	title: string;
};

export function DetailPageShell({
	backHref,
	backLabel,
	children,
	description,
	eyebrow,
	image,
	imageAlt,
	imagePosition,
	meta,
	nextHref,
	nextLabel,
	title,
}: DetailPageShellProps) {
	return (
		<main>
			<section className="relative overflow-hidden border-b border-[var(--copper)] bg-[var(--navy)] text-[var(--parchment)]">
				<div className="absolute inset-0">
					<SmartImage
						src={image}
						alt=""
						fill
						priority
						sizes="100vw"
						className="object-cover opacity-28"
						style={{ objectPosition: imagePosition ?? "center" }}
					/>
					<div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,25,42,0.96)_0%,rgba(14,38,61,0.82)_52%,rgba(14,38,61,0.42)_100%)]" />
				</div>
				<div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_0.72fr] lg:px-8 lg:py-16">
					<div className="self-center">
						<Link
							href={backHref}
							className="inline-flex border border-[rgba(217,167,91,0.44)] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)] transition hover:bg-[rgba(217,167,91,0.12)]"
						>
							{"<-"} {backLabel}
						</Link>
						<p className="script-label mt-6 text-[var(--gold)]">{eyebrow}</p>
						<h1 className="mt-2 font-display text-5xl leading-none text-[var(--parchment)] sm:text-7xl">
							{title}
						</h1>
						<p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--parchment-soft)]">
							{description}
						</p>
						<div className="mt-7 flex flex-wrap gap-2">
							{meta.map((item) => (
								<span
									key={item}
									className="border border-[rgba(217,167,91,0.42)] bg-[rgba(255,242,232,0.08)] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]"
								>
									{item}
								</span>
							))}
						</div>
					</div>

					<figure className="ornament-frame relative min-h-[22rem] overflow-hidden bg-[var(--parchment)] lg:min-h-[31rem]">
						<SmartImage
							src={image}
							alt={imageAlt}
							fill
							sizes="(min-width: 1024px) 38vw, 100vw"
							className="object-cover"
							style={{ objectPosition: imagePosition ?? "center" }}
						/>
					</figure>
				</div>
			</section>

			{children}

			<section className="bg-[var(--navy)] px-4 py-8 text-[var(--parchment)] sm:px-6 lg:px-8">
				<div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<Link href={backHref} className="button-secondary bg-transparent text-[var(--gold)]">
						{"<-"} {backLabel}
					</Link>
					{nextHref && nextLabel ? (
						<Link href={nextHref} className="button-primary">
							{nextLabel} {"->"}
						</Link>
					) : null}
				</div>
			</section>
		</main>
	);
}

export function DetailCopyBlock({
	children,
	label,
	title,
}: {
	children: ReactNode;
	label: string;
	title: string;
}) {
	return (
		<section className="section-band px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[320px_1fr]">
				<div>
					<p className="script-label">{label}</p>
					<h2 className="font-display text-4xl leading-tight text-[var(--navy)]">
						{title}
					</h2>
				</div>
				<div className="grid gap-5 text-base leading-8 text-[var(--ink)]">
					{children}
				</div>
			</div>
		</section>
	);
}

export function DetailFeatureGrid({
	items,
}: {
	items: { label: string; text: string }[];
}) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			{items.map((item) => (
				<div key={item.label} className="parchment-card p-5">
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--clay)]">
						{item.label}
					</p>
					<p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
						{item.text}
					</p>
				</div>
			))}
		</div>
	);
}

export function DetailLoadingState() {
	return (
		<main>
			<section className="bg-[var(--navy)] px-4 py-16 text-[var(--parchment)] sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_0.72fr]">
					<div className="self-center">
						<div className="h-9 w-40 animate-pulse bg-[rgba(217,167,91,0.22)]" />
						<div className="mt-7 h-16 w-full max-w-2xl animate-pulse bg-[rgba(255,242,232,0.14)]" />
						<div className="mt-4 h-16 w-2/3 animate-pulse bg-[rgba(255,242,232,0.1)]" />
						<div className="mt-7 flex gap-2">
							<div className="h-9 w-24 animate-pulse bg-[rgba(217,167,91,0.16)]" />
							<div className="h-9 w-24 animate-pulse bg-[rgba(217,167,91,0.16)]" />
						</div>
					</div>
					<div className="min-h-[22rem] animate-pulse border border-[rgba(217,167,91,0.42)] bg-[rgba(255,242,232,0.12)] lg:min-h-[31rem]" />
				</div>
			</section>
		</main>
	);
}
