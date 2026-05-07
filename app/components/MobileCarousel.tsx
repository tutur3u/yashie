"use client";

import { Children, type ReactNode, useRef, useState } from "react";

type MobileCarouselProps = {
	children: ReactNode;
	desktopClassName: string;
	label: string;
	tone?: "dark" | "light";
};

function ArrowIcon({ direction }: { direction: "previous" | "next" }) {
	return (
		<svg
			aria-hidden="true"
			className="size-4"
			fill="none"
			viewBox="0 0 20 20"
		>
			<path
				d={
					direction === "previous"
						? "M12.5 4.5 7 10l5.5 5.5"
						: "M7.5 4.5 13 10l-5.5 5.5"
				}
				stroke="currentColor"
				strokeLinecap="square"
				strokeLinejoin="miter"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

export function MobileCarousel({
	children,
	desktopClassName,
	label,
	tone = "light",
}: MobileCarouselProps) {
	const slides = Children.toArray(children);
	const trackRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const controlClassName =
		tone === "dark"
			? "border-[rgba(217,167,91,0.72)] bg-[rgba(239,207,178,0.08)] text-[var(--gold)] disabled:border-[rgba(239,207,178,0.16)] disabled:text-[rgba(239,207,178,0.32)]"
			: "border-[rgba(184,112,81,0.55)] bg-[rgba(255,246,239,0.78)] text-[var(--copper-dark)] disabled:border-[rgba(184,112,81,0.2)] disabled:text-[rgba(89,73,90,0.32)]";
	const labelClassName =
		tone === "dark" ? "text-[var(--parchment-soft)]" : "text-[var(--ink-soft)]";

	const scrollToSlide = (index: number) => {
		const nextIndex = Math.min(Math.max(index, 0), slides.length - 1);
		const track = trackRef.current;
		const slide = track?.children.item(nextIndex);

		setActiveIndex((currentIndex) =>
			currentIndex === nextIndex ? currentIndex : nextIndex,
		);

		if (slide instanceof HTMLElement) {
			track?.scrollTo({
				behavior: "smooth",
				left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
			});
		}
	};

	const syncActiveSlide = () => {
		const track = trackRef.current;

		if (!track) {
			return;
		}

		const trackCenter = track.scrollLeft + track.clientWidth / 2;
		let closestIndex = 0;
		let closestDistance = Number.POSITIVE_INFINITY;

		Array.from(track.children).forEach((slide, index) => {
			if (!(slide instanceof HTMLElement)) {
				return;
			}

			const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
			const distance = Math.abs(trackCenter - slideCenter);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		setActiveIndex((currentIndex) =>
			currentIndex === closestIndex ? currentIndex : closestIndex,
		);
	};

	return (
		<div className="mt-5">
			<div className="mb-3 flex items-center justify-between gap-3 md:hidden">
				<p className={`text-xs font-bold uppercase tracking-[0.18em] ${labelClassName}`}>
					{label} {activeIndex + 1} / {slides.length}
				</p>
				<div className="flex gap-2">
					<button
						type="button"
						aria-label={`Previous ${label}`}
						className={`grid size-10 place-items-center border transition enabled:hover:-translate-x-0.5 disabled:cursor-not-allowed ${controlClassName}`}
						disabled={activeIndex === 0}
						onClick={() => scrollToSlide(activeIndex - 1)}
					>
						<ArrowIcon direction="previous" />
					</button>
					<button
						type="button"
						aria-label={`Next ${label}`}
						className={`grid size-10 place-items-center border transition enabled:hover:translate-x-0.5 disabled:cursor-not-allowed ${controlClassName}`}
						disabled={activeIndex === slides.length - 1}
						onClick={() => scrollToSlide(activeIndex + 1)}
					>
						<ArrowIcon direction="next" />
					</button>
				</div>
			</div>
			<div
				ref={trackRef}
				aria-label={`${label} carousel`}
				className={`scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 md:overflow-visible md:pb-0 ${desktopClassName}`}
				onScroll={syncActiveSlide}
				role="region"
			>
				{slides.map((slide, index) => (
					<div
						key={index}
						className="min-w-[86%] snap-center md:min-w-0"
						aria-label={`${index + 1} of ${slides.length}`}
						aria-roledescription="slide"
						role="group"
					>
						{slide}
					</div>
				))}
			</div>
		</div>
	);
}
