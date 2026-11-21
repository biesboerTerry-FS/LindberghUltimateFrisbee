/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { formatDate } from "./format";

/** localStorage key that holds the demo-mode bulletin board. */
export const BULLETINS_KEY = "lu-bulletins";

const CHANGE_EVENT = "lu-bulletins-change";
const DISMISSED_KEY = "lu-bulletin-dismissed";
export const BULLETIN_TYPES = ["info", "warning", "promotion"];

const TYPE_STYLES = {
	info: "bg-blue-100 text-blue-800",
	warning: "bg-lu-yellow/40 text-lu-dark",
	promotion: "bg-lu-green/15 text-lu-green",
};

const EMPTY_FORM = { title: "", body: "", type: "info", active: true };

function storage() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}

function createId() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
	return `bulletin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(value) {
	if (!value || typeof value !== "object" || typeof value.title !== "string" || !value.title.trim()) {
		return null;
	}
	return {
		id: String(value.id || createId()),
		title: value.title.trim(),
		body: typeof value.body === "string" ? value.body.trim() : "",
		type: BULLETIN_TYPES.includes(value.type) ? value.type : "info",
		active: value.active !== false,
		createdAt: value.createdAt || new Date().toISOString(),
		updatedAt: value.updatedAt || null,
	};
}

function byNewest(a, b) {
	return new Date(b.createdAt) - new Date(a.createdAt);
}

/** Read and sanitize all bulletins from this browser's localStorage. */
export function readBulletins() {
	const store = storage();
	if (!store) return [];
	try {
		const raw = store.getItem(BULLETINS_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(parsed)) return [];
		return parsed.map(normalize).filter(Boolean).sort(byNewest);
	} catch {
		return [];
	}
}

function commit(next) {
	const store = storage();
	const sorted = next.map(normalize).filter(Boolean).sort(byNewest);
	if (store) {
		try {
			store.setItem(BULLETINS_KEY, JSON.stringify(sorted));
		} catch {
			// Storage disabled: keep the in-memory state for this session.
		}
	}
	if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
	return sorted;
}

/** Return the active bulletins, newest first. */
export function getActiveBulletins() {
	return readBulletins().filter((bulletin) => bulletin.active);
}

/** Subscribe a component to bulletin changes in this tab and in other tabs. */
function useBulletins() {
	const [bulletins, setBulletins] = useState(() => readBulletins());

	useEffect(() => {
		const sync = () => setBulletins(readBulletins());
		sync();
		window.addEventListener(CHANGE_EVENT, sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(CHANGE_EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, []);

	return bulletins;
}

function dismissedValue() {
	const store = storage();
	if (!store) return "";
	try {
		return store.getItem(DISMISSED_KEY) || "";
	} catch {
		return "";
	}
}

function dismissalKey(bulletin) {
	return `${bulletin.id}:${bulletin.updatedAt || bulletin.createdAt}`;
}

/** Small colored badge for a bulletin's type. */
function TypeBadge({ type }) {
	const tone = TYPE_STYLES[type] || TYPE_STYLES.info;
	return (
		<span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone}`}>
			{type}
		</span>
	);
}

/**
 * Dismissible dashboard/layout widget showing the newest active bulletin.
 * Dismissal lasts for the browser session only.
 */
export function LatestBulletin() {
	useBulletins(); // Re-render when bulletins change in this or another tab.
	const latest = getActiveBulletins()[0] || null;
	const [dismissed, setDismissed] = useState(dismissedValue);

	if (!latest || dismissed === dismissalKey(latest)) return null;

	const close = () => {
		const key = dismissalKey(latest);
		const store = storage();
		if (store) {
			try {
				store.setItem(DISMISSED_KEY, key);
			} catch {
				// Session-only dismissal still works via component state.
			}
		}
		setDismissed(key);
	};

	return (
		<aside
			aria-label="Latest bulletin"
			className="mb-4 rounded-xl border border-lu-yellow/60 bg-lu-yellow/10 p-4"
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-lu-ink/50">
							Latest bulletin
						</p>
						<TypeBadge type={latest.type} />
					</div>
					<p className="font-roboto mt-1 font-bold text-lu-dark">{latest.title}</p>
					{latest.body && <p className="mt-1 line-clamp-2 text-sm text-lu-ink/70">{latest.body}</p>}
					<p className="mt-1 text-xs text-lu-ink/45">Posted {formatDate(latest.createdAt, true)}</p>
				</div>
				<div className="flex items-center gap-3">
					<Link to="/admin/announcements" className="text-xs font-semibold text-lu-green underline">
						Manage bulletins
					</Link>
					<button
						type="button"
						onClick={close}
						aria-label="Dismiss bulletin"
						title="Dismiss for this session"
						className="rounded-full border border-lu-ink/15 px-2.5 py-1 text-lg leading-none text-lu-ink/50 transition-colors hover:bg-white hover:text-lu-ink"
					>
						×
					</button>
				</div>
			</div>
		</aside>
	);
}

/**
 * Bulletin board manager: post, edit, toggle, and delete announcements.
 * All changes are stored in this browser only (localStorage).
 */
export default function Announcements() {
	const bulletins = useBulletins();
	const [form, setForm] = useState(EMPTY_FORM);
	const [editingId, setEditingId] = useState(null);
	const [showForm, setShowForm] = useState(false);

	const openCreate = () => {
		setEditingId(null);
		setForm({ ...EMPTY_FORM });
		setShowForm(true);
	};

	const openEdit = (bulletin) => {
		setEditingId(bulletin.id);
		setForm({
			title: bulletin.title,
			body: bulletin.body,
			type: bulletin.type,
			active: bulletin.active,
		});
		setShowForm(true);
	};

	const closeForm = () => {
		setShowForm(false);
		setEditingId(null);
		setForm({ ...EMPTY_FORM });
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const title = form.title.trim();
		if (!title) {
			toast.error("A title is required.");
			return;
		}

		const now = new Date().toISOString();
		let next;
		if (editingId) {
			next = bulletins.map((bulletin) =>
				bulletin.id === editingId
					? {
							...bulletin,
							title,
							body: form.body.trim(),
							type: form.type,
							active: form.active,
							updatedAt: now,
						}
					: bulletin
			);
		} else {
			next = [
				{
					id: createId(),
					title,
					body: form.body.trim(),
					type: form.type,
					active: form.active,
					createdAt: now,
					updatedAt: null,
				},
				...bulletins,
			];
		}

		commit(next);
		toast.success(editingId ? "Bulletin updated." : "Bulletin posted.");
		closeForm();
	};

	const handleToggle = (bulletin) => {
		const next = bulletins.map((item) =>
			item.id === bulletin.id ? { ...item, active: !item.active, updatedAt: new Date().toISOString() } : item
		);
		commit(next);
		toast.success(bulletin.active ? "Bulletin deactivated." : "Bulletin activated.");
	};

	const handleDelete = (bulletin) => {
		if (!window.confirm(`Delete “${bulletin.title}”? This cannot be undone.`)) return;
		commit(bulletins.filter((item) => item.id !== bulletin.id));
		toast.success("Bulletin deleted.");
	};

	return (
		<div className="flex flex-col gap-4">
			<section className="flex flex-col gap-3 rounded-xl border border-lu-green/15 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="font-display text-xl font-bold text-lu-dark">Announcements</h2>
					<p className="mt-1 text-sm text-lu-ink/60">
						Post bulletins for the admin panel. Active bulletins appear in the “Latest bulletin” widget.
					</p>
					<p className="mt-1 text-xs text-lu-ink/45">
						Stored in this browser only (localStorage key <code>{BULLETINS_KEY}</code>). Clearing site data
						removes them.
					</p>
				</div>
				<button
					type="button"
					onClick={openCreate}
					className="shrink-0 rounded-lg bg-lu-green px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-lu-dark"
				>
					New bulletin
				</button>
			</section>

			{showForm && (
				<section className="rounded-xl border border-lu-green/15 bg-white p-4">
					<h3 className="font-roboto mb-4 font-bold">{editingId ? "Edit bulletin" : "New bulletin"}</h3>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div>
							<label htmlFor="bulletin-title" className="mb-1 block text-sm font-semibold">
								Title
							</label>
							<input
								id="bulletin-title"
								type="text"
								required
								value={form.title}
								onChange={(event) => setForm({ ...form, title: event.target.value })}
								placeholder="e.g. Registration opens Monday"
								className="w-full rounded-lg border border-lu-ink/15 bg-lu-cream/50 px-3 py-2 font-body text-sm text-lu-ink placeholder-lu-ink/45 focus:border-lu-green focus:bg-white focus:outline-none"
							/>
						</div>
						<div>
							<label htmlFor="bulletin-body" className="mb-1 block text-sm font-semibold">
								Body
							</label>
							<textarea
								id="bulletin-body"
								rows={4}
								value={form.body}
								onChange={(event) => setForm({ ...form, body: event.target.value })}
								placeholder="Add the details families and coaches need to know…"
								className="w-full rounded-lg border border-lu-ink/15 bg-lu-cream/50 px-3 py-2 font-body text-sm text-lu-ink placeholder-lu-ink/45 focus:border-lu-green focus:bg-white focus:outline-none"
							/>
						</div>
						<div className="flex flex-wrap gap-6">
							<div>
								<label htmlFor="bulletin-type" className="mb-1 block text-sm font-semibold">
									Type
								</label>
								<select
									id="bulletin-type"
									value={form.type}
									onChange={(event) => setForm({ ...form, type: event.target.value })}
									className="rounded-lg border border-lu-ink/15 bg-white px-3 py-2 font-body text-sm text-lu-ink"
								>
									{BULLETIN_TYPES.map((type) => (
										<option key={type} value={type}>
											{type[0].toUpperCase() + type.slice(1)}
										</option>
									))}
								</select>
							</div>
							<label htmlFor="bulletin-active" className="flex items-end gap-2 pb-2 text-sm font-semibold">
								<input
									id="bulletin-active"
									type="checkbox"
									checked={form.active}
									onChange={(event) => setForm({ ...form, active: event.target.checked })}
									className="h-4 w-4 accent-lu-green"
								/>
								Active
							</label>
						</div>
						<div className="flex gap-2">
							<button
								type="submit"
								className="rounded-full bg-lu-green px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-lu-dark"
							>
								Save bulletin
							</button>
							<button
								type="button"
								onClick={closeForm}
								className="rounded-full border border-lu-ink/15 px-4 py-2 text-sm font-semibold hover:bg-lu-green/5"
							>
								Cancel
							</button>
						</div>
					</form>
				</section>
			)}

			<section className="overflow-hidden rounded-xl border border-lu-green/15 bg-white">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[40rem] border-collapse text-left text-sm">
						<thead>
							<tr className="border-b border-lu-green/15 bg-lu-green/5 text-[10px] uppercase tracking-wider text-lu-ink/50">
								<th className="px-4 py-3 font-roboto font-semibold">Title</th>
								<th className="px-4 py-3 font-roboto font-semibold">Type</th>
								<th className="px-4 py-3 font-roboto font-semibold">Active</th>
								<th className="px-4 py-3 font-roboto font-semibold">Date</th>
								<th className="px-4 py-3 font-roboto font-semibold">Actions</th>
							</tr>
						</thead>
						<tbody>
							{!bulletins.length && (
								<tr>
									<td colSpan={5} className="px-4 py-10 text-center text-lu-ink/50">
										No bulletins yet. Use “New bulletin” to post one.
									</td>
								</tr>
							)}
							{bulletins.map((bulletin) => (
								<tr key={bulletin.id} className="border-b border-lu-green/10 last:border-0">
									<td className="px-4 py-3 align-top">
										<p className="font-semibold text-lu-dark">{bulletin.title}</p>
										{bulletin.body && (
											<p className="mt-0.5 max-w-md truncate text-xs text-lu-ink/55" title={bulletin.body}>
												{bulletin.body}
											</p>
										)}
									</td>
									<td className="px-4 py-3 align-top">
										<TypeBadge type={bulletin.type} />
									</td>
									<td className="px-4 py-3 align-top">
										<input
											type="checkbox"
											checked={bulletin.active}
											onChange={() => handleToggle(bulletin)}
											aria-label={`Active: ${bulletin.title}`}
											className="h-4 w-4 accent-lu-green"
										/>
									</td>
									<td className="whitespace-nowrap px-4 py-3 align-top text-lu-ink/60">
										{formatDate(bulletin.createdAt, true)}
									</td>
									<td className="px-4 py-3 align-top">
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => openEdit(bulletin)}
												className="text-sm font-semibold text-lu-green underline hover:text-lu-dark"
											>
												Edit
											</button>
											<button
												type="button"
												onClick={() => handleDelete(bulletin)}
												className="text-sm font-semibold text-red-700 underline hover:text-red-900"
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
