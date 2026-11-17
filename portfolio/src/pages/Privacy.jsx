import React from "react";

const Privacy = () => {
	return (
		<section className="px-6 py-12 bg-lu-cream sm:px-10">
			<div className="max-w-3xl mx-auto">
				<p className="text-xs font-semibold tracking-[0.2em] uppercase text-lu-green/80 font-roboto">Legal</p>
				<h1 className="mt-2 text-4xl font-bold text-lu-dark font-display sm:text-5xl">Privacy Policy</h1>
				<p className="mt-4 text-lu-ink/80">
					Lindbergh Ultimate respects your privacy. This policy explains what information may be collected
					through this website and how it is used.
				</p>
				<h2 className="mt-8 text-xl font-semibold text-lu-dark font-roboto">Information we collect</h2>
				<p className="mt-2 text-lu-ink/80">
					We may collect information you choose to submit through site forms, such as interest, registration, or
					contact forms. This can include names, email addresses, phone numbers, and details relevant to program
					participation.
				</p>
				<h2 className="mt-8 text-xl font-semibold text-lu-dark font-roboto">How we use information</h2>
				<p className="mt-2 text-lu-ink/80">
					Information is used to respond to inquiries, communicate with families and participants, organize teams
					and events, and administer program activities.
				</p>
				<h2 className="mt-8 text-xl font-semibold text-lu-dark font-roboto">Sharing</h2>
				<p className="mt-2 text-lu-ink/80">
					We do not sell personal information. Information may be shared with program staff or service providers
					only as needed to operate the program and website.
				</p>
				<h2 className="mt-8 text-xl font-semibold text-lu-dark font-roboto">Contact</h2>
				<p className="mt-2 text-lu-ink/80">
					For privacy questions or requests, contact the program using the email address listed on this website.
				</p>
				<p className="mt-8 text-sm text-lu-ink/60">Last updated: November 2026.</p>
			</div>
		</section>
	);
};

export default Privacy;
