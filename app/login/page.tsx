import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Admin Login | Yashoda U. Itwaru",
	description: "Centralized Tuturuuu admin login for the InkedByYashie portfolio.",
};

export default function LoginPage() {
	redirect("/admin/login?next=library");
}
