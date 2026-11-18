import React from "react";
import { Toaster } from "sonner";

/**
 * App-wide toast host. Styling comes from the --normal-* / --success-* /
 * --error-* CSS variables in index.css, which are themed for light and dark.
 */
export default function AppToaster() {
	return (
		<Toaster
			position="top-right"
			richColors
			closeButton
			expand
			visibleToasts={4}
			toastOptions={{ duration: 4000 }}
		/>
	);
}
