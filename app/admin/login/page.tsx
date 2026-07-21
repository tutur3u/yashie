import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { YashieAdminLoginPanel } from "@/components/admin/YashieAdminLoginPanel";
import { getYashieCentralizedLoginHref } from "../login-link";
import { getYashieAdminSessionReadState } from "@/lib/yashie-admin-api";
import { resolveYashieAdminTargetKey } from "@/lib/yashie-config";
import { getYashieContent } from "@/lib/yashie-delivery";
import { isYashieNavTabVisible } from "@/lib/yashie-navigation-access";

export const instant = false;

export const metadata: Metadata = {
	title: "Admin Login",
	description: "Tuturuuu login for the InkedByYashie dashboard.",
};

export default async function AdminLoginPage({
	searchParams,
}: {
	searchParams?: Promise<{ next?: string }>;
}) {
	await connection();

	const params = await searchParams;
	const targetKey = resolveYashieAdminTargetKey(params?.next);
	const [content, loginHref, sessionState] = await Promise.all([
		getYashieContent(),
		getYashieCentralizedLoginHref(targetKey),
		getYashieAdminSessionReadState(),
	]);

	if (
		!isYashieNavTabVisible(content, "login") &&
		sessionState.status === "unauthenticated"
	) {
		notFound();
	}

	return (
		<YashieAdminLoginPanel
			loginHref={loginHref}
		/>
	);
}
