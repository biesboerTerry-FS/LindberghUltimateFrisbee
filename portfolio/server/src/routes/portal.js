import { randomUUID } from "node:crypto";
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Optional backend mirror for the demo portal features. The browser keeps the
 * authoritative copy in localStorage; these authenticated endpoints give
 * admin sessions a server-side record of messages and scheduling changes.
 * State is in-process (serverless instances may restart), so it is never used
 * as the only source of truth by the UI.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDays = (days) => new Date(Date.now() + days * DAY_MS).toISOString();
const WORKFLOW_STATUSES = new Set(["pending", "in review", "approved", "archived"]);

const state = {
	messages: [
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
	],
	scheduleRequests: [
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
	],
	timeOffRequests: [
		{
			id: "demo-timeoff-1",
			requester: "Devon Price",
			startDate: isoDays(12),
			endDate: isoDays(14),
			reason: "Family vacation",
			status: "pending",
			createdAt: isoDays(-1),
		},
	],
	availability: {
		"demo-employee-maya": true,
		"demo-employee-devon": false,
	},
};

function patchById(collection, id, patch) {
	const index = collection.findIndex((item) => item.id === id);
	if (index === -1) throw ApiError.notFound("Record not found");
	collection[index] = { ...collection[index], ...patch };
	return collection[index];
}

function validateStatus(status) {
	if (!WORKFLOW_STATUSES.has(status)) throw ApiError.badRequest("Invalid workflow status");
	return status;
}

const router = Router();
router.use(authenticate);

router.get("/messages", (req, res) => {
	const role = String(req.query.role || "admin");
	res.json({
		success: true,
		data: state.messages.filter((message) => message.role === role || message.role === "all"),
	});
});

router.patch("/messages/:id", (req, res) => {
	const read = req.body?.read;
	if (typeof read !== "boolean") throw ApiError.badRequest("read must be a boolean");
	res.json({ success: true, data: patchById(state.messages, req.params.id, { read }) });
});

router.get("/schedule", (_req, res) => {
	res.json({
		success: true,
		data: {
			requests: state.scheduleRequests,
			timeOff: state.timeOffRequests,
			availability: state.availability,
		},
	});
});

router.post("/schedule/requests", (req, res) => {
	const { requester, type, date, details } = req.body || {};
	if (!requester || !type || !date) throw ApiError.badRequest("requester, type and date are required");
	const record = {
		id: `schedule-request-${randomUUID()}`,
		requester: String(requester),
		type: String(type),
		date: String(date),
		details: String(details || ""),
		status: "pending",
		createdAt: new Date().toISOString(),
	};
	state.scheduleRequests.unshift(record);
	res.status(201).json({ success: true, data: record });
});

router.patch("/schedule/requests/:id", (req, res) => {
	const status = validateStatus(req.body?.status);
	res.json({ success: true, data: patchById(state.scheduleRequests, req.params.id, { status }) });
});

router.post("/schedule/time-off", (req, res) => {
	const { requester, startDate, endDate, reason } = req.body || {};
	if (!requester || !startDate || !endDate) {
		throw ApiError.badRequest("requester, startDate and endDate are required");
	}
	const record = {
		id: `timeoff-request-${randomUUID()}`,
		requester: String(requester),
		startDate: String(startDate),
		endDate: String(endDate),
		reason: String(reason || ""),
		status: "pending",
		createdAt: new Date().toISOString(),
	};
	state.timeOffRequests.unshift(record);
	res.status(201).json({ success: true, data: record });
});

router.patch("/schedule/time-off/:id", (req, res) => {
	const status = validateStatus(req.body?.status);
	res.json({ success: true, data: patchById(state.timeOffRequests, req.params.id, { status }) });
});

router.patch("/availability", (req, res) => {
	const { employeeId, available } = req.body || {};
	if (!employeeId || typeof available !== "boolean") {
		throw ApiError.badRequest("employeeId and available are required");
	}
	state.availability[String(employeeId)] = available;
	res.json({ success: true, data: state.availability });
});

export default router;
