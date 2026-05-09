import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/app/components/MockForms";

export const metadata: Metadata = {
	title: "Login | Yashoda U. Itwaru",
	description:
		"Decorative mock login page for the InkedByYashie portfolio concept.",
};

export default function LoginPage() {
	return (
		<main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-4 py-14 sm:px-6 lg:px-8">
			<Image
				src="/images/artworks/violet-trident-goddess.png"
				alt=""
				fill
				sizes="100vw"
				className="object-cover object-center"
				priority
			/>
			<div className="absolute inset-0 bg-[rgba(246,221,205,0.78)]" />
			<div className="relative mx-auto max-w-7xl">
				<LoginForm />
				<p className="mx-auto mt-5 max-w-md text-center text-sm leading-6 text-[var(--ink-soft)]">
					This route has no backend authentication. It is a polished placeholder
					for a future reader archive or private shelf.
				</p>
			</div>
		</main>
	);
}
