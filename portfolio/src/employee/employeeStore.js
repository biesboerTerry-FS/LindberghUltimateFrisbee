/**
 * Demo employee records and localStorage persistence for the self-service portal.
 * No API calls are made — everything lives in this browser.
 */

const SESSION_KEY = "lu-employee-session";
const PROFILE_KEY = "lu-employee-profiles";

const DAY_MS = 24 * 60 * 60 * 1000;

function upcoming(days, time, title, location) {
	return { date: new Date(Date.now() + days * DAY_MS).toISOString(), time, title, location };
}

/** Two seeded demo employees with only the fields the portal is allowed to show. */
export const DEMO_EMPLOYEES = [
	{
		id: "demo-employee-maya",
		name: "Maya Johnson",
		position: "Head Coach, Middle School",
		email: "maya.johnson@lindberghultimate.org",
		phone: "(314) 555-0142",
		address: "4821 Oakview Lane, St. Louis, MO 63119",
		schedule: [
			upcoming(2, "3:30 PM – 5:00 PM", "Middle school practice", "Lindbergh High School field"),
			upcoming(6, "9:00 AM – 11:00 AM", "Saturday clinic", "Lindbergh High School gym"),
			upcoming(13, "4:00 PM – 6:00 PM", "Parent info night", "Lindbergh High School library"),
		],
	},
	{
		id: "demo-employee-devon",
		name: "Devon Price",
		position: "Assistant Coach, Power Lunch",
		email: "devon.price@lindberghultimate.org",
		phone: "(314) 555-0187",
		address: "7312 Forest Ridge Drive, St. Louis, MO 63123",
		schedule: [
			upcoming(1, "11:30 AM – 1:00 PM", "Power Lunch session", "Lindbergh Middle School"),
			upcoming(5, "3:30 PM – 5:00 PM", "Assistant coach practice", "Lindbergh High School field"),
		],
	},
];

function storage() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}

/** Read the currently signed-in demo employee id, if any. */
export function getSessionEmployeeId() {
	const store = storage();
	if (!store) return null;
	try {
		return store.getItem(SESSION_KEY);
	} catch {
		return null;
	}
}

/** Start a demo employee session. */
export function signInDemoEmployee(id = DEMO_EMPLOYEES[0].id) {
	const store = storage();
	if (store) {
		try {
			store.setItem(SESSION_KEY, id);
		} catch {
			// Session still works in memory for this page load.
		}
	}
	return id;
}

/** End the demo employee session. */
export function signOutEmployee() {
	const store = storage();
	if (store) {
		try {
			store.removeItem(SESSION_KEY);
		} catch {
			// Ignore storage errors.
		}
	}
}

function readOverrides() {
	const store = storage();
	if (!store) return {};
	try {
		const parsed = JSON.parse(store.getItem(PROFILE_KEY) || "{}");
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
	} catch {
		return {};
	}
}

/** Return one demo employee with any locally saved profile edits applied. */
export function getEmployee(id) {
	const seed = DEMO_EMPLOYEES.find((employee) => employee.id === id);
	if (!seed) return null;
	return { ...seed, ...(readOverrides()[id] || {}) };
}

/** Save only the employee's own basic info; role and all other fields stay fixed. */
export function saveEmployeeProfile(id, patch) {
	const allowed = ["name", "address", "phone", "email"];
	const safe = allowed.reduce((acc, key) => {
		if (typeof patch?.[key] === "string") acc[key] = patch[key].trim();
		return acc;
	}, {});
	const overrides = readOverrides();
	overrides[id] = { ...(overrides[id] || {}), ...safe };
	const store = storage();
	if (store) {
		try {
			store.setItem(PROFILE_KEY, JSON.stringify(overrides));
		} catch {
			// Ignore storage errors; edits remain in component state.
		}
	}
	return getEmployee(id);
}
