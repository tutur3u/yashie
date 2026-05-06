"use client";

import { useState } from "react";

function SubmitMessage({ message }: { message: string }) {
	if (!message) {
		return null;
	}

	return (
		<p className="mt-3 text-sm font-medium text-[var(--copper-dark)]">
			{message}
		</p>
	);
}

export function NewsletterForm() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");

	return (
		<form
			className="flex w-full flex-col gap-3 sm:flex-row"
			onSubmit={(event) => {
				event.preventDefault();
				setMessage(
					email
						? "You are on the mock letter list."
						: "Add an email address to join the mock letter list.",
				);
			}}
		>
			<div className="flex-1">
				<label className="sr-only" htmlFor="newsletter-email">
					Email address
				</label>
				<input
					id="newsletter-email"
					type="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					placeholder="Your email address"
					className="h-12 w-full border border-[var(--copper)] bg-[var(--parchment)] px-4 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[rgba(217,167,91,0.25)]"
				/>
				<SubmitMessage message={message} />
			</div>
			<button className="h-12 border border-[var(--copper-dark)] bg-[var(--clay)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--copper-dark)]">
				Subscribe
			</button>
		</form>
	);
}

export function ContactForm() {
	const [message, setMessage] = useState("");

	return (
		<form
			className="parchment-card grid gap-4 p-5"
			onSubmit={(event) => {
				event.preventDefault();
				setMessage("Mock message sealed. No email was sent.");
			}}
		>
			<div className="grid gap-2">
				<label className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--clay)]" htmlFor="contact-name">
					Name
				</label>
				<input id="contact-name" className="form-field" placeholder="Your name" />
			</div>
			<div className="grid gap-2">
				<label className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--clay)]" htmlFor="contact-email">
					Email
				</label>
				<input
					id="contact-email"
					type="email"
					className="form-field"
					placeholder="you@example.com"
				/>
			</div>
			<div className="grid gap-2">
				<label className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--clay)]" htmlFor="contact-message">
					Message
				</label>
				<textarea
					id="contact-message"
					className="form-field min-h-36 resize-y py-3"
					placeholder="Tell Yashie what you are reaching out about."
				/>
			</div>
			<button className="button-primary w-full sm:w-fit">Send Mock Message</button>
			<SubmitMessage message={message} />
		</form>
	);
}

export function LoginForm() {
	const [message, setMessage] = useState("");

	return (
		<form
			className="parchment-card mx-auto grid max-w-md gap-4 p-6"
			onSubmit={(event) => {
				event.preventDefault();
				setMessage("Mock login accepted. The archive remains decorative.");
			}}
		>
			<div className="text-center">
				<p className="script-label">Private shelf</p>
				<h1 className="font-display text-4xl text-[var(--navy)]">
					Reader Login
				</h1>
				<p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
					A frontend-only login concept for future member shelves, preorder
					notes, and saved reading lists.
				</p>
			</div>
			<div className="grid gap-2">
				<label className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--clay)]" htmlFor="login-email">
					Email
				</label>
				<input
					id="login-email"
					type="email"
					className="form-field"
					placeholder="reader@example.com"
				/>
			</div>
			<div className="grid gap-2">
				<label className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--clay)]" htmlFor="login-password">
					Password
				</label>
				<input
					id="login-password"
					type="password"
					className="form-field"
					placeholder="********"
				/>
			</div>
			<button className="button-primary w-full">Enter the Mock Archive</button>
			<SubmitMessage message={message} />
		</form>
	);
}
