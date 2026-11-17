import React from "react";

const Terms = () => {
	return (
		<section className="px-6 py-12 bg-lu-cream sm:px-10">
			<div className="max-w-3xl mx-auto">
				<p className="text-xs font-semibold tracking-[0.2em] uppercase text-lu-green/80 font-roboto">Legal</p>
				<h1 className="mt-2 text-4xl font-bold text-lu-dark font-display sm:text-5xl">Terms of Use</h1>
				<p className="mt-4 text-lu-ink/80">
					These terms govern your use of the Lindbergh Ultimate website and its pages, forms, and information.
					By accessing or using this site, you agree to these terms.
				</p>
				<h2 className="mt-8 text-xl font-semibold text-lu-dark font-roboto">Informational use</h2>
				<p className="mt-2 text-lu-ink/80">
					Content is provided to share information about Lindbergh Ultimate programs, schedules, registration,
					and community activities. Information may change; we may update, correct, or remove content at any time
					without notice.
				</p>
				<h2 className="mt-8 text-xl font-semibold text-lu-dark font-roboto">Submissions and conduct</h2>
				<p className="mt-2 text-lu-ink/80">
					When you submit forms or messages, provide accurate information and do not misuse the site or attempt
					to disrupt its operation.
				</p>
				<h2 className="mt-8 text-xl font-semibold text-lu-dark font-roboto">External links</h2>
				<p className="mt-2 text-lu-ink/80">
					This site may link to third-party services (such as social media or registration tools). We are not
					responsible for their content or practices.
				</p>
				<h2 className="mt-8 text-xl font-semibold text-lu-dark font-roboto">Contact</h2>
				<p className="mt-2 text-lu-ink/80">
					Questions about these terms can be sent to the program using the contact information provided on this
					website.
				</p>
				<p className="mt-8 text-sm text-lu-ink/60">Last updated: November 2026.</p>
			</div>
		</section>
	);
};

export default Terms;
