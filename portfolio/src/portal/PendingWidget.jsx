import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../admin/format";
import { EmptyState } from "./PortalUI";

/** Dashboard widget showing the most recent pending orders. */
export default function PendingWidget({ orders = [], to, onOpen }) {
	const pending = orders.filter((order) => order.status === "pending").slice(0, 4);
	const count = orders.filter((order) => order.status === "pending").length;

	return (
		<section aria-label="Pending widget" className="rounded-xl border border-lu-green/15 bg-white p-4">
			<div className="mb-3 flex items-center justify-between gap-3">
				<div>
					<h3 className="font-roboto font-bold text-lu-dark">Pending</h3>
					<p className="text-xs text-lu-ink/55">
						{count} {count === 1 ? "item" : "items"} awaiting review
					</p>
				</div>
				{to ? (
					<Link to={to} className="text-xs font-semibold text-lu-green underline">
						Open Orders
					</Link>
				) : (
					<button
						type="button"
						onClick={onOpen}
						className="text-xs font-semibold text-lu-green underline"
					>
						Open Orders
					</button>
				)}
			</div>
			{!pending.length ? (
				<EmptyState>Nothing pending. Nice work!</EmptyState>
			) : (
				<ul className="divide-y divide-black/5">
					{pending.map((order) => (
						<li key={order.id} className="flex items-center justify-between gap-3 py-2">
							<div className="min-w-0">
								<p className="truncate text-sm font-medium">{order.name}</p>
								<p className="text-xs text-lu-ink/50">
									{order.type} · {formatDate(order.submittedAt)}
								</p>
							</div>
							<span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
								Pending
							</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
