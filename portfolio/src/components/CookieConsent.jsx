import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, hasConsentDecision, onConsentOpen, setConsent } from "../lib/cookieConsent";

// Lightweight, localStorage-backed consent banner with granular optional toggles.
const CookieConsent = () => {
	const [visible, setVisible] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [analytics, setAnalytics] = useState(false);
	const [marketing, setMarketing] = useState(false);

	useEffect(() => {
		const existing = getConsent();
		if (!hasConsentDecision()) {
			setVisible(true);
			setAnalytics(Boolean(existing?.analytics));
			setMarketing(Boolean(existing?.marketing));
		}
		return onConsentOpen(() => {
			const current = getConsent();
			setAnalytics(Boolean(current?.analytics));
			setMarketing(Boolean(current?.marketing));
			setShowDetails(true);
			setVisible(true);
		});
	}, []);

	const save = (nextAnalytics, nextMarketing, decision) => {
		setConsent({ analytics: nextAnalytics, marketing: nextMarketing, decision });
		setVisible(false);
		setShowDetails(false);
	};

	if (!visible) return null;

	const toggleClass =
		"h-4 w-4 rounded border-lu-yellow accent-lu-yellow cursor-pointer";

	return (
		<div
			role="dialog"
			aria-live="polite"
			aria-label="Cookie preferences"
			className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-lu-yellow bg-lu-dark px-5 py-4 font-body text-lu-cream shadow-2xl"
		>
			<div className="mx-auto max-w-6xl">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="text-sm">
						<p className="font-roboto text-base font-bold text-lu-yellow">
							Cookie &amp; storage preferences
						</p>
						<p className="mt-1 max-w-2xl leading-relaxed text-lu-cream/80">
							Essential storage keeps this site working. With your
							permission we also use optional analytics and
							marketing storage. Change this any time from the
							footer.{" "}
							<Link
								to="/privacy"
								className="underline hover:text-lu-yellow"
								onClick={() => setVisible(false)}
							>
								Privacy Policy
							</Link>
						</p>
					</div>
					<div className="flex shrink-0 flex-wrap gap-2">
						<button
							type="button"
							onClick={() => save(false, false, "declined")}
							className="rounded-full border border-lu-cream/40 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
						>
							Reject optional
						</button>
						<button
							type="button"
							onClick={() => setShowDetails((open) => !open)}
							aria-expanded={showDetails}
							className="rounded-full border border-lu-cream/40 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
						>
							{showDetails ? "Hide options" : "Manage"}
						</button>
						<button
							type="button"
							onClick={() => save(true, true, "accepted")}
							className="rounded-full bg-lu-yellow px-4 py-2 text-sm font-bold text-lu-dark transition-opacity hover:opacity-90"
						>
							Accept all
						</button>
					</div>
				</div>

				{showDetails && (
					<div className="mt-4 grid gap-3 rounded-xl border border-lu-yellow/30 bg-white/5 p-4 sm:grid-cols-2">
						<label className="flex items-start justify-between gap-3">
							<span>
								<span className="block text-sm font-semibold">Essential</span>
								<span className="block text-xs text-lu-cream/70">
									Required for sign-in, security and core features.
									Always on.
								</span>
							</span>
							<input
								type="checkbox"
								checked
								disabled
								aria-label="Essential storage always enabled"
								className={toggleClass}
							/>
						</label>
						<label className="flex items-start justify-between gap-3">
							<span>
								<span className="block text-sm font-semibold">Analytics</span>
								<span className="block text-xs text-lu-cream/70">
									Help us understand which pages are useful.
								</span>
							</span>
							<input
								type="checkbox"
								checked={analytics}
								onChange={(event) => setAnalytics(event.target.checked)}
								aria-label="Allow analytics storage"
								className={toggleClass}
							/>
						</label>
						<label className="flex items-start justify-between gap-3">
							<span>
								<span className="block text-sm font-semibold">Marketing</span>
								<span className="block text-xs text-lu-cream/70">
									Remember preferences for event and booster updates.
								</span>
							</span>
							<input
								type="checkbox"
								checked={marketing}
								onChange={(event) => setMarketing(event.target.checked)}
								aria-label="Allow marketing storage"
								className={toggleClass}
							/>
						</label>
					</div>
				)}

				{showDetails && (
					<div className="mt-4 flex justify-end">
						<button
							type="button"
							onClick={() => save(analytics, marketing, "custom")}
							className="rounded-full bg-lu-yellow px-4 py-2 text-sm font-bold text-lu-dark transition-opacity hover:opacity-90"
						>
							Save preferences
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default CookieConsent;
