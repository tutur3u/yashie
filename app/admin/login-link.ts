import { headers } from "next/headers";
import {
	buildYashieCentralizedLoginUrl,
	type YashieAdminTargetKey,
} from "@/lib/yashie-config";

function getRequestOrigin(headersList: Headers) {
	const host = headersList.get("x-forwarded-host") ?? headersList.get("host");

	if (!host) {
		return null;
	}

	const protocol =
		headersList.get("x-forwarded-proto") ??
		(host.startsWith("localhost") || host.startsWith("127.0.0.1")
			? "http"
			: "https");

	return `${protocol}://${host}`;
}

function getYashieAdminNextUrl(targetKey: YashieAdminTargetKey) {
	return targetKey === "dashboard" ? "/admin" : `/admin?target=${targetKey}`;
}

export async function getYashieCentralizedLoginHref(
	targetKey: YashieAdminTargetKey,
	options?: { nextUrl?: string },
) {
	const requestOrigin = getRequestOrigin(await headers());

	return buildYashieCentralizedLoginUrl({
		...(requestOrigin ? { appBaseUrl: requestOrigin } : {}),
		nextUrl: options?.nextUrl ?? getYashieAdminNextUrl(targetKey),
	});
}
