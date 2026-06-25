import type { SVGProps } from "react";
import type { SocialPlatform } from "@/app/data/portfolio";

type SocialIconProps = SVGProps<SVGSVGElement> & {
	platform: SocialPlatform;
};

export function SocialIcon({ platform, ...props }: SocialIconProps) {
	const sharedProps = {
		"aria-hidden": true,
		fill: "none",
		focusable: false,
		stroke: "currentColor",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		viewBox: "0 0 24 24",
		...props,
	} satisfies SVGProps<SVGSVGElement>;

	switch (platform) {
		case "instagram":
			return (
				<svg {...sharedProps}>
					<rect x="5" y="5" width="14" height="14" rx="4" strokeWidth="2" />
					<circle cx="12" cy="12" r="3.4" strokeWidth="2" />
					<circle cx="16.4" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
				</svg>
			);
		case "threads":
			return (
				<svg {...sharedProps}>
					<path
						d="M16.8 8.1c-.9-2.1-2.7-3.3-5.1-3.3-3.8 0-6.2 2.8-6.2 7.2s2.4 7.2 6.2 7.2c3.4 0 5.7-1.9 5.7-4.5 0-2.3-1.8-3.7-5-3.7-2.2 0-3.5 1-3.5 2.4 0 1.3 1 2.2 2.7 2.2 1.9 0 3.1-1.1 3.1-3.1v-1.3c0-1.7-.8-2.8-2.5-2.8"
						strokeWidth="2"
					/>
					<path d="M16.2 10.7c1.8.4 3 1.5 3.4 3.1" strokeWidth="2" />
				</svg>
			);
		case "bluesky":
			return (
				<svg {...sharedProps} fill="currentColor" stroke="none">
					<path
						d="M12 11.3c-1.2-2.3-3.4-5-5.4-6.4-1.9-1.4-2.6-1.1-3.1-.8-.5.3-.7 1.3-.7 1.9 0 .7.4 5.7.7 6.5.8 2.6 3.6 3.5 6 3.2-3.4.5-6.4 1.8-2.5 6.1 4.3 4.4 5.9-1 6.4-2.4.4 1.4 1.7 6.7 6.4 2.4 3.5-3.5 1-5.6-2.5-6.1 2.4.3 5.2-.6 6-3.2.3-.8.7-5.8.7-6.5 0-.6-.2-1.6-.7-1.9-.6-.3-1.2-.6-3.1.8-2 1.4-4.2 4.1-5.4 6.4Z"
						transform="translate(0 -1.1)"
					/>
				</svg>
			);
		case "goodreads":
			return (
				<svg {...sharedProps}>
					<path
						d="M16.3 7.1v9.3c0 2.5-1.7 4-4.2 4-2.1 0-3.6-1-4.1-2.7"
						strokeWidth="2"
					/>
					<path
						d="M16.2 10.9c0 2.3-1.6 4-3.8 4s-3.8-1.7-3.8-4 1.6-4 3.8-4 3.8 1.7 3.8 4Z"
						strokeWidth="2"
					/>
				</svg>
			);
		case "website":
			return (
				<svg {...sharedProps}>
					<circle cx="12" cy="12" r="8" strokeWidth="2" />
					<path d="M4 12h16" strokeWidth="2" />
					<path d="M12 4c2.1 2.2 3.2 4.8 3.2 8s-1.1 5.8-3.2 8" strokeWidth="2" />
					<path d="M12 4c-2.1 2.2-3.2 4.8-3.2 8s1.1 5.8 3.2 8" strokeWidth="2" />
				</svg>
			);
		case "newsletter":
			return (
				<svg {...sharedProps}>
					<rect x="4" y="6" width="16" height="12" rx="1.8" strokeWidth="2" />
					<path d="m5 7 7 6 7-6" strokeWidth="2" />
					<path d="m5.4 17 4.2-4" strokeWidth="2" />
					<path d="m18.6 17-4.2-4" strokeWidth="2" />
				</svg>
			);
		case "shop":
			return (
				<svg {...sharedProps}>
					<path d="M6.4 9.5 7.5 4.8h9l1.1 4.7" strokeWidth="2" />
					<path d="M5.8 9.5h12.4l-1 9.7H6.8l-1-9.7Z" strokeWidth="2" />
					<path d="M9.2 11.8c.4 1.3 1.4 2.2 2.8 2.2s2.4-.9 2.8-2.2" strokeWidth="2" />
				</svg>
			);
		case "blog":
			return (
				<svg {...sharedProps}>
					<path d="M6 4.8h9.4L18 7.4v11.8H6V4.8Z" strokeWidth="2" />
					<path d="M15 5v3h3" strokeWidth="2" />
					<path d="M8.5 11h7" strokeWidth="2" />
					<path d="M8.5 14h7" strokeWidth="2" />
					<path d="M8.5 17h4" strokeWidth="2" />
				</svg>
			);
		case "other":
			return (
				<svg {...sharedProps}>
					<path d="M10 13.8a4 4 0 0 0 5.7 0l2-2a4 4 0 0 0-5.7-5.7l-.8.8" strokeWidth="2" />
					<path d="M14 10.2a4 4 0 0 0-5.7 0l-2 2A4 4 0 0 0 12 17.9l.8-.8" strokeWidth="2" />
				</svg>
			);
	}
}
