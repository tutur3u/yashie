import type { Metadata } from "next";
import { YashieAdminLoginPanel } from "@/components/admin/YashieAdminLoginPanel";
import { getYashieCentralizedLoginHref } from "../login-link";
import { resolveYashieAdminTargetKey } from "@/lib/yashie-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Admin Login",
	description: "Tuturuuu login for the InkedByYashie dashboard.",
};

export default async function AdminLoginPage({
	searchParams,
}: {
	searchParams?: Promise<{ next?: string }>;
}) {
	const params = await searchParams;
	const targetKey = resolveYashieAdminTargetKey(params?.next);

	return (
		<YashieAdminLoginPanel
			loginHref={await getYashieCentralizedLoginHref(targetKey)}
		/>
	);
}
