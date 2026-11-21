/**
 * Shared data layer for the admin/employee portal features (orders, messages,
 * schedule requests). Demo data lives in localStorage so the portals work
 * without an API/database; authenticated admin actions are also mirrored to
 * the backend on a best-effort basis.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { getStoredToken, listResource, patchJson, postJson } from "../lib/api";

export const ORDERS_KEY = "lu-orders";
export const ORDER_STATUS_KEY = "lu-order-statuses";
export const MESSAGES_KEY = "lu-messages";
export const SCHEDULE_REQUESTS_KEY = "lu-schedule-requests";
export const TIME_OFF_KEY = "lu-timeoff-requests";
export const AVAILABILITY_KEY = "lu-availability";

export const ORDER_STATUSES = ["pending", "in review", "approved", "archived"];

// Stable reference so hooks that depend on the seed never re-run on every render.
const EMPTY_LIST = [];

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDays = (days) => new Date(Date.now() + days * DAY_MS).toISOString();
const event = (key) => `${key}-change`;

/**
 * Seed submissions. These mirror the kinds of records the public forms write
 * to the API (registrations and interest forms) so the Orders view is useful
 * even without a database connection.
 */
export const SEED_ORDERS = [
	{
		id: "demo-order-1001",
		resource: "registrations",
		refId: "demo-reg-1001",
		type: "Registration",
		name: "Avery Mitchell",
		status: "pending",
		submittedAt: isoDays(-1),
		details: {
			"Grade": "7th",
			"School": "Sperreng Middle School",
			"Division": "Mixed",
			"Email": "avery.mitchell@example.com",
			"Parent": "Dana Mitchell",
		},
	},
	{
		id: "demo-order-1002",
		resource: "interest-submissions",
		refId: "demo-interest-1002",
		type: "Interest form",
		name: "Jordan Lee",
		status: "pending",
		submittedAt: isoDays(-2),
		details: {
			"Grade": "8th",
			"School": "Truman Middle School",
			"Divisions": "Girls, Mixed",
			"Interest": "Definitely playing",
			"Email": "jordan.lee@example.com",
		},
	},
	{
		id: "demo-order-1003",
		resource: "registrations",
		refId: "demo-reg-1003",
		type: "Registration",
		name: "Sofia Ramirez",
		status: "in review",
		submittedAt: isoDays(-3),
		details: {
			"Grade": "10th",
			"School": "Lindbergh High School",
			"Division": "Gxrls",
			"Email": "sofia.ramirez@example.com",
			"Payment": "Paid",
		},
	},
	{
		id: "demo-order-1004",
		resource: "registrations",
		refId: "demo-reg-1004",
		type: "Registration",
		name: "Ethan Brooks",
		status: "approved",
		submittedAt: isoDays(-5),
		details: {
			"Grade": "6th",
			"School": "Sperreng Middle School",
			"Division": "Boys",
			"Email": "ethan.brooks@example.com",
			"Payment": "Paid",
		},
	},
	{
		id: "demo-order-1005",
		resource: "interest-submissions",
		refId: "demo-interest-1005",
		type: "Interest form",
		name: "Maya Patel",
		status: "pending",
		submittedAt: isoDays(-6),
		details: {
			"Grade": "9th",
			"School": "Lindbergh High School",
			"Divisions": "Mixed",
			"Interest": "Probably playing",
			"Email": "maya.patel@example.com",
		},
	},
	{
		id: "demo-order-1006",
		resource: "registrations",
		refId: "demo-reg-1006",
		type: "Registration",
		name: "Noah Williams",
		status: "archived",
		submittedAt: isoDays(-12),
		details: {
			"Grade": "11th",
			"School": "Lindbergh High School",
			"Division": "Mixed",
			"Email": "noah.williams@example.com",
			"Note": "Duplicate submission",
		},
	},
];

/** Demo inbox. `role: all` is visible in both portals. */
export const SEED_MESSAGES = [
	{
		id: "demo-message-1",
		role: "admin",
		subject: "Registration review queue is open",
		sender: "Program Director",
		senderEmail: "director@lindberghultimate.org",
		date: isoDays(-0.3),
		body: "Spring registration submissions are ready for review. Please work through the pending items on the Orders page and advance each one to In review, Approved, or Archived as appropriate. Waiver follow-ups can be handled by email.",
		read: false,
	},
	{
		id: "demo-message-2",
		role: "employee",
		subject: "Updated practice schedule for fall",
		sender: "Scheduling Coordinator",
		senderEmail: "scheduling@lindberghultimate.org",
		date: isoDays(-1.2),
		body: "The fall practice calendar has been updated. Please check the Schedule page for the latest event times, and submit a schedule request if any of your assigned sessions conflict with school events.",
		read: false,
	},
	{
		id: "demo-message-3",
		role: "all",
		subject: "Welcome to the staff portal",
		sender: "Lindbergh Ultimate",
		senderEmail: "info@lindberghultimate.org",
		date: isoDays(-4),
		body: "This inbox is the place for program updates. Admin staff can review registrations and interest forms from Orders, and employees can submit schedule/time-off requests and set their availability from Schedule.",
		read: true,
	},
];

export const SEED_EVENTS = [
	{
		id: "demo-event-1",
		title: "Middle school practice",
		date: isoDays(2),
		time: "3:30 PM – 5:00 PM",
		location: "Lindbergh High School field",
	},
	{
		id: "demo-event-2",
		title: "Spring registration clinic",
		date: isoDays(5),
		time: "9:00 AM – 12:00 PM",
		location: "Lindbergh High School gym",
	},
	{
		id: "demo-event-3",
		title: "Parent information night",
		date: isoDays(10),
		time: "6:30 PM – 7:30 PM",
		location: "Lindbergh High School library",
	},
	{
		id: "demo-event-4",
		title: "Spring showcase tournament",
		date: isoDays(17),
		time: "8:00 AM – 4:00 PM",
		location: "Lindbergh High School fields",
	},
];

export const SEED_SCHEDULE_REQUESTS = [
	{
		id: "demo-schedule-1",
		requester: "Maya Johnson",
		type: "Shift swap",
		date: isoDays(3),
		details: "Swap Thursday practice with Devon Price.",
		status: "pending",
		createdAt: isoDays(-1),
	},
	{
		id: "demo-schedule-2",
		requester: "Devon Price",
		type: "Coverage",
		date: isoDays(6),
		details: "Cover the Saturday clinic session.",
		status: "in review",
		createdAt: isoDays(-2),
	},
	{
		id: "demo-schedule-3",
		requester: "Maya Johnson",
		type: "Availability change",
		date: isoDays(9),
		details: "Attend the state coaching conference.",
		status: "approved",
		createdAt: isoDays(-4),
	},
];

export const SEED_TIME_OFF = [
	{
		id: "demo-timeoff-1",
		requester: "Devon Price",
		startDate: isoDays(12),
		endDate: isoDays(14),
		reason: "Family vacation",
		status: "pending",
		createdAt: isoDays(-1),
	},
	{
		id: "demo-timeoff-2",
		requester: "Maya Johnson",
		startDate: isoDays(20),
		endDate: isoDays(21),
		reason: "Conference travel",
		status: "approved",
		createdAt: isoDays(-5),
	},
];

export const SEED_AVAILABILITY = {
	"demo-employee-maya": true,
	"demo-employee-devon": false,
};

function storage() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}

/** Read a collection, seeding this browser the first time it is visited. */
function readCollection(key, seed) {
	const store = storage();
	if (!store) return seed;
	try {
		const raw = store.getItem(key);
		if (!raw) {
			store.setItem(key, JSON.stringify(seed));
			return seed;
		}
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return seed;
		return parsed;
	} catch {
		return seed;
	}
}

function commitCollection(key, value) {
	const store = storage();
	if (store) {
		try {
			store.setItem(key, JSON.stringify(value));
		} catch {
			// Storage disabled: keep the in-memory state for this page load.
		}
	}
	if (typeof window !== "undefined") window.dispatchEvent(new Event(event(key)));
	return value;
}

function readValue(key, fallback) {
	const store = storage();
	if (!store) return fallback;
	try {
		const raw = store.getItem(key);
		if (raw === null) {
			store.setItem(key, JSON.stringify(fallback));
			return fallback;
		}
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}

function commitValue(key, value) {
	const store = storage();
	if (store) {
		try {
			store.setItem(key, JSON.stringify(value));
		} catch {
			// Storage disabled: keep the in-memory state for this page load.
		}
	}
	if (typeof window !== "undefined") window.dispatchEvent(new Event(event(key)));
	return value;
}

function useCollection(key, seed) {
	const [items, setItems] = useState(() => readCollection(key, seed));

	useEffect(() => {
		const sync = () => setItems(readCollection(key, seed));
		// readCollection seeded storage on first render; an immediate sync
		// could overwrite a same-tick change from another hook instance.
		window.addEventListener(event(key), sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(event(key), sync);
			window.removeEventListener("storage", sync);
		};
	}, [key, seed]);

	const update = useCallback(
		(updater) => {
			const current = readCollection(key, seed);
			const next = typeof updater === "function" ? updater(current) : updater;
			const result = commitCollection(key, next);
			setItems(result);
			return result;
		},
		[key, seed]
	);

	return [items, update];
}

function useValue(key, fallback) {
	const [value, setValue] = useState(() => readValue(key, fallback));

	useEffect(() => {
		const sync = () => setValue(readValue(key, fallback));
		// No sync() here: readValue already seeded storage during the initial
		// state read. Calling sync immediately would let a second hook's stale
		// initial value overwrite a change made in the same tick.
		window.addEventListener(event(key), sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(event(key), sync);
			window.removeEventListener("storage", sync);
		};
	}, [key, fallback]);

	const update = useCallback(
		(next) => {
			const result = commitValue(key, next);
			setValue(result);
			return result;
		},
		[key]
	);

	return [value, update];
}

function createId(prefix) {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Mirror admin-only changes to the API; localStorage remains authoritative. */
function bestEffort(path, method, body) {
	if (!getStoredToken()) return;
	const send = method === "PATCH" ? patchJson : postJson;
	try {
		Promise.resolve(send(path, body, { token: getStoredToken() })).catch(() => {
			// Offline/API unavailable: the localStorage change already persisted.
		});
	} catch {
		// Ignore synchronous errors.
	}
}

/** Map a database status to the four-step fulfilment workflow. */
export function normalizeStatus(value) {
	const status = String(value || "").toLowerCase().replace(/[\s-]+/g, "_");
	if (["pending", "submitted", "new"].includes(status)) return "pending";
	if (["in_review", "under_review", "contacted", "review"].includes(status)) return "in review";
	if (["approved", "converted"].includes(status)) return "approved";
	if (["archived", "withdrawn", "denied", "declined"].includes(status)) return "archived";
	return ORDER_STATUSES.includes(value) ? value : "pending";
}

function statusKey(order) {
	return `${order.resource}:${order.refId || order.id}`;
}

function apiOrder(record, resource) {
	const isRegistration = resource === "registrations";
	const name = isRegistration ? record.athleteName : record.studentName;
	const details = isRegistration
		? {
				Grade: record.grade,
				School: record.school,
				Division: record.division,
				Email: record.schoolEmail,
				Parent: record.parentName,
			}
		: {
				Grade: record.grade,
				School: record.school,
				Divisions: Array.isArray(record.divisions) ? record.divisions.join(", ") : record.divisions,
				Interest: record.interestLevel,
				Email: record.studentEmail,
			};
	return {
		id: `${resource}:${record._id || record.id}`,
		resource,
		refId: record._id || record.id,
		type: isRegistration ? "Registration" : "Interest form",
		name: name || displayFallback(record),
		rawStatus: record.status,
		status: normalizeStatus(record.status),
		submittedAt: record.submittedAt || record.createdAt,
		details: Object.fromEntries(Object.entries(details).filter(([, value]) => value)),
	};
}

function displayFallback(record) {
	return record?.name || record?.email || "Untitled submission";
}

/**
 * Orders view data. Admin sessions attempt to load live registrations and
 * interest forms; any failure falls back to the seeded demo submissions.
 */
export function useOrders({ live = false } = {}) {
	const [demoOrders] = useState(() => SEED_ORDERS);
	const [overrides, setOverrides] = useCollection(ORDER_STATUS_KEY, EMPTY_LIST);
	const [liveOrders, setLiveOrders] = useState(null);
	const [loading, setLoading] = useState(live);
	const [reloadKey, setReloadKey] = useState(0);

	useEffect(() => {
		if (!live) return undefined;
		let cancelled = false;
		Promise.all([
			listResource("registrations", { limit: 100 }),
			listResource("interest-submissions", { limit: 100 }),
		])
			.then(([registrations, interest]) => {
				if (cancelled) return;
				setLoading(false);
				const records = [
					...(registrations?.data || []).map((record) => apiOrder(record, "registrations")),
					...(interest?.data || []).map((record) =>
						apiOrder(record, "interest-submissions")
					),
				];
				if (records.length) setLiveOrders(records);
			})
			.catch(() => {
				if (!cancelled) {
					setLiveOrders(null);
					setLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [live, reloadKey]);

	const source = liveOrders ? "api" : "demo";
	const orders = useMemo(() => {
		const base = liveOrders || demoOrders;
		return base
			.map((order) => {
				const override = overrides.find((entry) => entry.key === statusKey(order));
				return {
					...order,
					status: override?.status || order.status || normalizeStatus(order.rawStatus),
				};
			})
			.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
	}, [demoOrders, liveOrders, overrides]);

	const setOrderStatus = useCallback(
		(order, status) => {
			if (!ORDER_STATUSES.includes(status)) return;
			const key = statusKey(order);
			setOverrides((current) => [
				...current.filter((entry) => entry.key !== key),
				{ key, status, updatedAt: new Date().toISOString() },
			]);
			bestEffort(`/admin/${order.resource}/${order.refId}/status`, "PATCH", { status });
		},
		[setOverrides]
	);

	const pending = useMemo(() => orders.filter((order) => order.status === "pending"), [orders]);

	const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

	return { orders, pending, source, loading, refresh, setOrderStatus };
}

/** Messages inbox for a role, with persisted read/unread state. */
export function useMessages(role, { sync = false } = {}) {
	const [messages, setMessages] = useCollection(MESSAGES_KEY, SEED_MESSAGES);

	const visible = useMemo(
		() =>
			messages
				.filter((message) => message.role === role || message.role === "all")
				.sort((a, b) => new Date(b.date) - new Date(a.date)),
		[messages, role]
	);

	const setRead = useCallback(
		(id, read) => {
			setMessages((current) =>
				current.map((message) => (message.id === id ? { ...message, read } : message))
			);
			if (sync) bestEffort(`/admin/portal/messages/${id}`, "PATCH", { read });
		},
		[setMessages, sync]
	);

	const unreadCount = visible.filter((message) => !message.read).length;

	return { messages: visible, unreadCount, markRead: (id) => setRead(id, true), markUnread: (id) => setRead(id, false) };
}

/** Schedule events, requests, time off, and availability for a role. */
export function useSchedule({ sync = false } = {}) {
	const [requests, setRequests] = useCollection(SCHEDULE_REQUESTS_KEY, SEED_SCHEDULE_REQUESTS);
	const [timeOff, setTimeOff] = useCollection(TIME_OFF_KEY, SEED_TIME_OFF);
	const [availability, setAvailability] = useValue(AVAILABILITY_KEY, SEED_AVAILABILITY);

	const addRequest = useCallback(
		(request) => {
			const record = {
				id: createId("schedule-request"),
				status: "pending",
				createdAt: new Date().toISOString(),
				...request,
			};
			setRequests((current) => [record, ...current]);
			if (sync) bestEffort("/admin/portal/schedule/requests", "POST", record);
			return record;
		},
		[setRequests, sync]
	);

	const addTimeOff = useCallback(
		(request) => {
			const record = {
				id: createId("timeoff-request"),
				status: "pending",
				createdAt: new Date().toISOString(),
				...request,
			};
			setTimeOff((current) => [record, ...current]);
			if (sync) bestEffort("/admin/portal/schedule/time-off", "POST", record);
			return record;
		},
		[setTimeOff, sync]
	);

	const setRequestStatus = useCallback(
		(id, status) => {
			if (!ORDER_STATUSES.includes(status)) return;
			setRequests((current) =>
				current.map((request) => (request.id === id ? { ...request, status } : request))
			);
			if (sync) bestEffort(`/admin/portal/schedule/requests/${id}`, "PATCH", { status });
		},
		[setRequests, sync]
	);

	const setTimeOffStatus = useCallback(
		(id, status) => {
			if (!ORDER_STATUSES.includes(status)) return;
			setTimeOff((current) =>
				current.map((request) => (request.id === id ? { ...request, status } : request))
			);
			if (sync) bestEffort(`/admin/portal/schedule/time-off/${id}`, "PATCH", { status });
		},
		[setTimeOff, sync]
	);

	const setAvailable = useCallback(
		(employeeId, available) => {
			const current = readValue(AVAILABILITY_KEY, SEED_AVAILABILITY);
			setAvailability({ ...current, [employeeId]: Boolean(available) });
			if (sync) bestEffort("/admin/portal/availability", "PATCH", { employeeId, available });
		},
		[setAvailability, sync]
	);

	return {
		events: SEED_EVENTS,
		requests,
		timeOff,
		availability,
		addRequest,
		addTimeOff,
		setRequestStatus,
		setTimeOffStatus,
		setAvailable,
	};
}
