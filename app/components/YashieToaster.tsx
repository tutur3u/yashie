"use client";

import { Toaster } from "sonner";

export function YashieToaster() {
	return (
		<Toaster
			closeButton
			position="bottom-right"
			richColors
			toastOptions={{ duration: 3200 }}
		/>
	);
}
