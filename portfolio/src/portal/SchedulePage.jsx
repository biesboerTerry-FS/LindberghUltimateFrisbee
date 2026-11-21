import React, { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "../admin/format";
import { useSchedule } from "./portalStore";
import { DEMO_EMPLOYEES } from "../employee/employeeStore";
import {
	EmptyState,
	Field,
	PageHeading,
	Panel,
	StatusBadge,
	StatusSelect,
	inputClass,
} from "./PortalUI";

const TODAY = new Date().toISOString().slice(0, 10);
const REQUEST_TYPES = ["Shift swap", "Coverage", "Availability change", "Other"];

const emptyRequest = () => ({ type: REQUEST_TYPES[0], date: TODAY, details: "" });
const emptyTimeOff = () => ({ startDate: TODAY, endDate: TODAY, reason: "" });

/** Schedule overview, requests, time off, and availability for both portals. */
export default function SchedulePage({ role = "admin", employee, data }) {
	const hook = useSchedule({ sync: role === "admin" && !data });
	const {
		events,
		requests,
		timeOff,
		availability,
		addRequest,
		addTimeOff,
		setRequestStatus,
		setTimeOffStatus,
		setAvailable,
	} = data || hook;

	const isAdmin = role === "admin";
	const [showRequestForm, setShowRequestForm] = useState(false);
	const [requestForm, setRequestForm] = useState(emptyRequest);
	const [showTimeOffForm, setShowTimeOffForm] = useState(false);
	const [timeOffForm, setTimeOffForm] = useState(emptyTimeOff);

	const submitRequest = (event) => {
		event.preventDefault();
		if (!requestForm.details.trim()) {
			toast.error("Please describe the request.");
			return;
		}
		addRequest({
			requester: employee?.name || "Administrator",
			type: requestForm.type,
			date: new Date(`${requestForm.date}T12:00:00`).toISOString(),
			details: requestForm.details.trim(),
		});
		setRequestForm(emptyRequest());
		setShowRequestForm(false);
		toast.success("Schedule request submitted.");
	};

	const submitTimeOff = (event) => {
		event.preventDefault();
		if (!timeOffForm.reason.trim()) {
			toast.error("Please add a reason.");
			return;
		}
		addTimeOff({
			requester: employee?.name || "Administrator",
			startDate: new Date(`${timeOffForm.startDate}T12:00:00`).toISOString(),
			endDate: new Date(`${timeOffForm.endDate}T12:00:00`).toISOString(),
			reason: timeOffForm.reason.trim(),
		});
		setTimeOffForm(emptyTimeOff());
		setShowTimeOffForm(false);
		toast.success("Time off request submitted.");
	};

	return (
		<div className="flex flex-col gap-4">
			<PageHeading
				title="Schedule"
				description="Upcoming events, schedule and time off requests, and staff availability."
			/>

			<Panel title="Upcoming events" subtitle="Program events on the calendar.">
				{!events.length ? (
					<EmptyState>No upcoming events.</EmptyState>
				) : (
					<ul className="grid gap-2 sm:grid-cols-2">
						{events.map((item) => (
							<li key={item.id} className="rounded-lg border border-lu-green/15 bg-lu-cream/40 p-3">
								<p className="font-semibold text-lu-dark">{item.title}</p>
								<p className="mt-1 text-xs text-lu-ink/60">
									{formatDate(item.date)} · {item.time}
								</p>
								<p className="text-xs text-lu-ink/45">{item.location}</p>
							</li>
						))}
					</ul>
				)}
			</Panel>

			<Panel
				title="Schedule requests"
				subtitle={isAdmin ? "All staff schedule requests." : "Submit and track your schedule requests."}
				action={
					!isAdmin && (
						<button
							type="button"
							onClick={() => setShowRequestForm((current) => !current)}
							className="rounded-lg bg-lu-green px-3 py-2 text-xs font-semibold text-white hover:bg-lu-dark"
						>
							{showRequestForm ? "Cancel" : "New request"}
						</button>
					)
				}
			>
				{showRequestForm && !isAdmin && (
					<form onSubmit={submitRequest} className="mb-4 grid gap-3 rounded-lg border border-lu-green/15 bg-lu-cream/40 p-3 sm:grid-cols-2">
						<Field label="Request type">
							<select
								value={requestForm.type}
								onChange={(event) => setRequestForm({ ...requestForm, type: event.target.value })}
								className={inputClass}
							>
								{REQUEST_TYPES.map((type) => (
									<option key={type}>{type}</option>
								))}
							</select>
						</Field>
						<Field label="Date">
							<input
								type="date"
								required
								value={requestForm.date}
								onChange={(event) => setRequestForm({ ...requestForm, date: event.target.value })}
								className={inputClass}
							/>
						</Field>
						<div className="sm:col-span-2">
							<Field label="Details">
								<textarea
									rows={2}
									value={requestForm.details}
									onChange={(event) => setRequestForm({ ...requestForm, details: event.target.value })}
									placeholder="What needs to change?"
									className={inputClass}
								/>
							</Field>
						</div>
						<div className="sm:col-span-2">
							<button
								type="submit"
								className="rounded-full bg-lu-green px-4 py-2 text-sm font-bold text-white hover:bg-lu-dark"
							>
								Submit request
							</button>
						</div>
					</form>
				)}
				{!requests.length ? (
					<EmptyState>No schedule requests yet.</EmptyState>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[36rem] border-collapse text-left text-sm">
							<thead>
								<tr className="border-b border-lu-green/15 bg-lu-green/5 text-[10px] uppercase tracking-wider text-lu-ink/55">
									<th className="px-3 py-2 font-roboto font-semibold">Requester</th>
									<th className="px-3 py-2 font-roboto font-semibold">Type / details</th>
									<th className="px-3 py-2 font-roboto font-semibold">Date</th>
									<th className="px-3 py-2 font-roboto font-semibold">Status</th>
								</tr>
							</thead>
							<tbody>
								{requests.map((request) => (
									<tr key={request.id} className="border-b border-lu-green/10 last:border-0">
										<td className="px-3 py-2 font-medium">{request.requester}</td>
										<td className="px-3 py-2">
											<p>{request.type}</p>
											<p className="text-xs text-lu-ink/55">{request.details}</p>
										</td>
										<td className="whitespace-nowrap px-3 py-2 text-lu-ink/60">
											{formatDate(request.date)}
										</td>
										<td className="px-3 py-2">
											{isAdmin ? (
												<StatusSelect
													label={`Status for ${request.type} request from ${request.requester}`}
													value={request.status}
													onChange={(status) => {
														setRequestStatus(request.id, status);
														toast.success(`Request moved to ${status}.`);
													}}
												/>
											) : (
												<StatusBadge status={request.status} />
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Panel>

			<Panel
				title="Time off requests"
				subtitle={isAdmin ? "All staff time off requests." : "Request time away from scheduled sessions."}
				action={
					!isAdmin && (
						<button
							type="button"
							onClick={() => setShowTimeOffForm((current) => !current)}
							className="rounded-lg bg-lu-green px-3 py-2 text-xs font-semibold text-white hover:bg-lu-dark"
						>
							{showTimeOffForm ? "Cancel" : "New request"}
						</button>
					)
				}
			>
				{showTimeOffForm && !isAdmin && (
					<form onSubmit={submitTimeOff} className="mb-4 grid gap-3 rounded-lg border border-lu-green/15 bg-lu-cream/40 p-3 sm:grid-cols-2">
						<Field label="Start date">
							<input
								type="date"
								required
								value={timeOffForm.startDate}
								onChange={(event) => setTimeOffForm({ ...timeOffForm, startDate: event.target.value })}
								className={inputClass}
							/>
						</Field>
						<Field label="End date">
							<input
								type="date"
								required
								value={timeOffForm.endDate}
								onChange={(event) => setTimeOffForm({ ...timeOffForm, endDate: event.target.value })}
								className={inputClass}
							/>
						</Field>
						<div className="sm:col-span-2">
							<Field label="Reason">
								<input
									type="text"
									value={timeOffForm.reason}
									onChange={(event) => setTimeOffForm({ ...timeOffForm, reason: event.target.value })}
									placeholder="e.g. Family event"
									className={inputClass}
								/>
							</Field>
						</div>
						<div className="sm:col-span-2">
							<button
								type="submit"
								className="rounded-full bg-lu-green px-4 py-2 text-sm font-bold text-white hover:bg-lu-dark"
							>
								Submit request
							</button>
						</div>
					</form>
				)}
				{!timeOff.length ? (
					<EmptyState>No time off requests yet.</EmptyState>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[36rem] border-collapse text-left text-sm">
							<thead>
								<tr className="border-b border-lu-green/15 bg-lu-green/5 text-[10px] uppercase tracking-wider text-lu-ink/55">
									<th className="px-3 py-2 font-roboto font-semibold">Requester</th>
									<th className="px-3 py-2 font-roboto font-semibold">Dates</th>
									<th className="px-3 py-2 font-roboto font-semibold">Reason</th>
									<th className="px-3 py-2 font-roboto font-semibold">Status</th>
								</tr>
							</thead>
							<tbody>
								{timeOff.map((request) => (
									<tr key={request.id} className="border-b border-lu-green/10 last:border-0">
										<td className="px-3 py-2 font-medium">{request.requester}</td>
										<td className="whitespace-nowrap px-3 py-2 text-lu-ink/60">
											{formatDate(request.startDate)} – {formatDate(request.endDate)}
										</td>
										<td className="px-3 py-2">{request.reason}</td>
										<td className="px-3 py-2">
											{isAdmin ? (
												<StatusSelect
													label={`Status for time off request from ${request.requester}`}
													value={request.status}
													onChange={(status) => {
														setTimeOffStatus(request.id, status);
														toast.success(`Time off request moved to ${status}.`);
													}}
												/>
											) : (
												<StatusBadge status={request.status} />
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Panel>

			<Panel title="Availability" subtitle="Availability is saved in this browser and visible to administrators.">
				{!isAdmin && employee ? (
					<label className="flex items-center gap-3 rounded-lg border border-lu-green/15 bg-lu-cream/40 p-3">
						<input
							type="checkbox"
							checked={Boolean(availability[employee.id])}
							onChange={(event) => {
								setAvailable(employee.id, event.target.checked);
								toast.success(
									event.target.checked ? "You are marked available." : "You are marked unavailable."
								);
							}}
							className="h-5 w-5 accent-lu-green"
							aria-label="My availability"
						/>
						<span className="text-sm font-semibold">
							I am available for scheduled sessions
						</span>
					</label>
				) : (
					<ul className="grid gap-2 sm:grid-cols-2">
						{DEMO_EMPLOYEES.map((person) => (
							<li
								key={person.id}
								className="flex items-center justify-between gap-3 rounded-lg border border-lu-green/15 bg-lu-cream/40 p-3"
							>
								<span className="text-sm font-medium">{person.name}</span>
								<span
									className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
										availability[person.id]
											? "bg-emerald-100 text-emerald-900"
											: "bg-slate-200 text-slate-700"
									}`}
								>
									{availability[person.id] ? "Available" : "Unavailable"}
								</span>
							</li>
						))}
					</ul>
				)}
			</Panel>
		</div>
	);
}
