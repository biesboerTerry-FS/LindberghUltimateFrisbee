import React from "react";
import { Link } from "react-router-dom";

const links = [
	{ to: "/", label: "Home" },
	{ to: "/high-school", label: "High School" },
	{ to: "/middle-school", label: "Middle School" },
	{ to: "/booster-club", label: "Booster Club" },
	{ to: "/calendar", label: "Calendar" },
	{ to: "/registration", label: "Registration" },
	{ to: "/interest-form", label: "Interest Form" },
	{ to: "/families", label: "Families" },
	{ to: "/sportsyou", label: "SportsYou" },
	{ to: "/usa-ultimate", label: "USA Ultimate" },
	{ to: "/play-opportunities", label: "Play Opportunities" },
	{ to: "/media", label: "Media" },
	{ to: "/power-lunch", label: "Power Lunch" },
	{ to: "/coaching-apprenticeship", label: "Coaching Apprenticeship" },
	{ to: "/fundraiser", label: "Fundraiser" },
];

const Sitemap = () => {
	return (
		<section className="px-6 py-12 bg-lu-cream sm:px-10">
			<div className="max-w-3xl mx-auto">
				<p className="text-xs font-semibold tracking-[0.2em] uppercase text-lu-green/80 font-roboto">Site map</p>
				<h1 className="mt-2 text-4xl font-bold text-lu-dark font-display sm:text-5xl">Pages</h1>
				<p className="mt-4 text-lu-ink/80">Browse the main pages of the Lindbergh Ultimate website.</p>
				<ul className="mt-8 grid gap-3 sm:grid-cols-2">
					{links.map((item) => (
						<li key={item.to}>
							<Link
								to={item.to}
								className="block rounded-xl border border-lu-green/15 bg-white px-4 py-3 text-lu-dark font-medium shadow-sm transition hover:border-lu-green/40 hover:text-lu-green"
							>
								{item.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};

export default Sitemap;
