import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMe, storeToken } from "../../lib/api";

function parseHash() {
	const hash = window.location.hash.replace(/^#/, "");
	return new URLSearchParams(hash);
}

/**
 * Shared OAuth callback. Public sign-in has been removed from the site, so
 * only the ADMIN audience is handled here. Any non-admin callback returns
 * to the home page.
 */
export default function AuthCallback() {
	const navigate = useNavigate();
	const [error, setError] = useState("");
	const hasRun = useRef(false);

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		(async () => {
			const params = parseHash();
			const token = params.get("token");
			const audience = params.get("audience");
			const returnTo = params.get("returnTo") || "/admin";
			const hashError = params.get("error");

			if (audience !== "admin") {
				// Public auth UI was removed; nothing to process for this audience.
				window.location.hash = "";
				navigate("/", { replace: true });
				return;
			}

			if (hashError) {
				// Stay on the callback page briefly, then return to admin login
				// with the error in the query string.
				window.location.hash = "";
				navigate(`/admin/login?error=${encodeURIComponent(hashError)}`, { replace: true });
				return;
			}

			if (!token) {
				setError("Sign-in failed. No token was returned. Please try again.");
				return;
			}

			try {
				storeToken(token);
				// Let the admin provider validate on next mount; if this throws
				// synchronously the fallback below still lands on /admin, where
				// RequireAuth will send the user to /admin/login.
				try {
					await fetchMe(token);
				} catch {
					// Invalid staff token — /admin will bounce to login.
				}
				window.location.hash = "";
				navigate(returnTo || "/admin", { replace: true });
			} catch {
				setError("Sign-in failed. Please try again.");
			}
		})();
	}, [navigate]);

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-lu-green px-6 py-16 font-body text-lu-cream">
				<div className="w-full max-w-md rounded-2xl border border-lu-yellow/50 bg-white/10 p-6 text-center">
					<h1 className="font-display text-2xl font-bold uppercase text-lu-yellow">Sign-in failed</h1>
					<p className="mt-3 text-sm">{error}</p>
					<p className="mt-5">
						<a href="/admin/login" className="text-sm text-lu-yellow underline hover:text-white">
							Back to admin login
						</a>
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-lu-green px-6 py-16 font-body text-lu-cream">
			<p>Finishing admin sign-in…</p>
		</div>
	);
}
