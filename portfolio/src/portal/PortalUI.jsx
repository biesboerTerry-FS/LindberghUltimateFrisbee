import React from "react";
import { ORDER_STATUSES } from "./portalStore";

const STATUS_STYLES = {
	pending: "bg-amber-100 text-amber-900 ring-amber-200",
	"in review": "bg-blue-100 text-blue-900 ring-blue-200",
	approved: "bg-emerald-100 text-emerald-900 ring-emerald-200",
	archived: "bg-slate-200 text-slate-700 ring-slate-300",
};

/** Shared pill for the four-step fulfilment workflow. */
export function StatusBadge({ status }) {
	const label = ORDER_STATUSES.includes(status) ? status : status || "pending";
	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ring-1 ring-inset ${
				STATUS_STYLES[label] || STATUS_STYLES.pending
			}`}
		>
			{label}
		</span>
	);
}

/** Accessible select used to advance an item's fulfilment status. */
export function StatusSelect({ value, onChange, label }) {
	return (
		<select
			aria-label={label}
			value={ORDER_STATUSES.includes(value) ? value : "pending"}
			onChange={(event) => onChange(event.target.value)}
			className="rounded-lg border border-lu-ink/20 bg-white px-2 py-1 font-body text-xs font-semibold capitalize text-lu-ink focus:border-lu-green focus:outline-none"
		>
			{ORDER_STATUSES.map((status) => (
				<option key={status} value={status}>
					{status}
				</option>
			))}
		</select>
	);
}

/** Card wrapper used by every portal section. */
export function Panel({ title, subtitle, action, children, className = "" }) {
	return (
		<section className={`rounded-xl border border-lu-green/15 bg-white p-4 ${className}`}>
			{(title || action) && (
				<div className="mb-3 flex flex-wrap items-start justify-between gap-3">
					<div>
						{title && <h3 className="font-roboto font-bold text-lu-dark">{title}</h3>}
						{subtitle && <p className="mt-1 text-xs text-lu-ink/55">{subtitle}</p>}
					</div>
					{action}
				</div>
			)}
			{children}
		</section>
	);
}

/** Consistent empty-state message. */
export function EmptyState({ children }) {
	return <p className="py-6 text-center text-sm text-lu-ink/50">{children}</p>;
}

/** Page heading shared by the admin portal pages. */
export function PageHeading({ title, description, badge }) {
	return (
		<div className="flex flex-wrap items-start justify-between gap-3">
			<div>
				<h1 className="font-display text-2xl font-bold text-lu-dark">{title}</h1>
				{description && <p className="mt-1 text-sm text-lu-ink/60">{description}</p>}
			</div>
			{badge}
		</div>
	);
}

/** Simple field used by the request forms. */
export function Field({ label, children }) {
	return (
		<label className="block">
			<span className="mb-1 block text-xs font-semibold text-lu-ink/70">{label}</span>
			{children}
		</label>
	);
}

export const inputClass =
	"w-full rounded-lg border border-lu-ink/15 bg-lu-cream/50 px-3 py-2 font-body text-sm text-lu-ink focus:border-lu-green focus:bg-white focus:outline-none";
