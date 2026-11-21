import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatDate } from "../admin/format";
import { ORDER_STATUSES, useOrders } from "./portalStore";
import { EmptyState, PageHeading, Panel, StatusBadge, StatusSelect } from "./PortalUI";

const FILTERS = ["all", ...ORDER_STATUSES];

/**
 * Orders dashboard: every registration/interest submission with its workflow
 * status, name, submitted date, details, and a per-row fulfilment control.
 */
export default function OrdersPage({ role = "admin", data }) {
	const hook = useOrders({ live: role === "admin" && !data });
	const { orders, source, loading, setOrderStatus } = data || hook;
	const [filter, setFilter] = useState("all");
	const [expandedId, setExpandedId] = useState(null);

	const counts = useMemo(() => {
		const result = { all: orders.length };
		for (const status of ORDER_STATUSES) {
			result[status] = orders.filter((order) => order.status === status).length;
		}
		return result;
	}, [orders]);

	const visible = useMemo(
		() => (filter === "all" ? orders : orders.filter((order) => order.status === filter)),
		[filter, orders]
	);

	const handleStatus = (order, status) => {
		setOrderStatus(order, status);
		toast.success(`${order.name} moved to ${status}.`);
	};

	return (
		<div className="flex flex-col gap-4">
			<PageHeading
				title="Orders"
				description="All registrations and interest submissions, with a fulfilment status for each item."
				badge={
					<span className="rounded-full border border-lu-green/20 bg-lu-green/10 px-3 py-1 text-xs font-semibold capitalize text-lu-green">
						{source === "api" ? "Live API data" : loading ? "Loading orders…" : "Demo data"}
					</span>
				}
			/>

			<div className="flex flex-wrap gap-2">
				{FILTERS.map((option) => (
					<button
						key={option}
						type="button"
						onClick={() => setFilter(option)}
						aria-pressed={filter === option}
						className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
							filter === option
								? "bg-lu-green text-white"
								: "border border-lu-green/20 bg-white text-lu-ink/70 hover:border-lu-green/50"
						}`}
					>
						{option} ({counts[option] || 0})
					</button>
				))}
			</div>

			<Panel>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[46rem] border-collapse text-left text-sm">
						<thead>
							<tr className="border-b border-lu-green/15 bg-lu-green/5 text-[10px] uppercase tracking-wider text-lu-ink/55">
								<th className="px-3 py-3 font-roboto font-semibold">Name</th>
								<th className="px-3 py-3 font-roboto font-semibold">Type</th>
								<th className="px-3 py-3 font-roboto font-semibold">Date</th>
								<th className="px-3 py-3 font-roboto font-semibold">Status</th>
								<th className="px-3 py-3 font-roboto font-semibold">Fulfill</th>
								<th className="px-3 py-3 font-roboto font-semibold">Details</th>
							</tr>
						</thead>
						<tbody>
							{!visible.length && (
								<tr>
									<td colSpan={6}>
										<EmptyState>No orders match this filter.</EmptyState>
									</td>
								</tr>
							)}
							{visible.map((order) => (
								<React.Fragment key={order.id}>
									<tr className="border-b border-lu-green/10 last:border-0">
										<td className="px-3 py-3 font-semibold text-lu-dark">{order.name}</td>
										<td className="px-3 py-3 text-lu-ink/70">{order.type}</td>
										<td className="whitespace-nowrap px-3 py-3 text-lu-ink/60">
											{formatDate(order.submittedAt)}
										</td>
										<td className="px-3 py-3">
											<StatusBadge status={order.status} />
										</td>
										<td className="px-3 py-3">
											<StatusSelect
												label={`Status for ${order.name}`}
												value={order.status}
												onChange={(status) => handleStatus(order, status)}
											/>
										</td>
										<td className="px-3 py-3">
											<button
												type="button"
												onClick={() =>
													setExpandedId((current) =>
														current === order.id ? null : order.id
													)
												}
												aria-expanded={expandedId === order.id}
												className="text-xs font-semibold text-lu-green underline hover:text-lu-dark"
											>
												{expandedId === order.id ? "Hide" : "View"}
											</button>
										</td>
									</tr>
									{expandedId === order.id && (
										<tr className="border-b border-lu-green/10 bg-lu-green/5">
											<td colSpan={6} className="px-4 py-3">
												<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-lu-ink/50">
													Submission details
												</p>
												<dl className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
													{Object.entries(order.details || {}).map(([label, value]) => (
														<div key={label} className="flex justify-between gap-3 py-1">
															<dt className="text-lu-ink/55">{label}</dt>
															<dd className="text-right font-medium">{value}</dd>
														</div>
													))}
													{!Object.keys(order.details || {}).length && (
														<dd className="text-lu-ink/55">No additional details.</dd>
													)}
												</dl>
											</td>
										</tr>
									)}
								</React.Fragment>
							))}
						</tbody>
					</table>
				</div>
			</Panel>
		</div>
	);
}
