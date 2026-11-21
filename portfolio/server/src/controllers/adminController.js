import { InterestSubmission, Parent, Player, Registration } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { approveRegistration, splitName } from "../services/registrationService.js";
import { getDashboardStats } from "../services/statsService.js";

export const approveRegistrationHandler = asyncHandler(async (req, res) => {
	const result = await approveRegistration(req.params.id);
	res.json({ success: true, data: result });
});

export const dashboard = asyncHandler(async (_req, res) => {
	const stats = await getDashboardStats();
	res.json({ success: true, data: stats });
});

// Map the portal's four fulfilment steps onto the statuses stored by the
// registration and interest form models.
const WORKFLOW_TO_MODEL = {
	pending: "submitted",
	"in review": "under_review",
	approved: "approved",
	archived: "archived",
};

/** PATCH /admin/:resource/:id/status — advance a submission's workflow. */
export const updateResourceStatusHandler = asyncHandler(async (req, res) => {
	const { resource, id } = req.params;
	const status = String(req.body?.status || "").trim().toLowerCase();
	const stored = WORKFLOW_TO_MODEL[status];
	if (!stored) throw ApiError.badRequest("Invalid workflow status");

	const model =
		resource === "registrations"
			? Registration
			: resource === "interest-submissions"
				? InterestSubmission
				: null;
	if (!model) throw ApiError.notFound("Resource does not support status updates");

	const nextStatus = resource === "interest-submissions" && status === "pending" ? "new" : stored;
	const document = await model.findByIdAndUpdate(
		id,
		{ status: nextStatus },
		{ new: true, runValidators: true },
	);
	if (!document) throw ApiError.notFound("Record not found");

	res.json({
		success: true,
		data: { id: document.id, resource, status, storedStatus: document.status },
	});
});

export const convertInterestHandler = asyncHandler(async (req, res) => {
	const submission = await InterestSubmission.findById(req.params.id);
	if (!submission) throw ApiError.notFound("Interest submission not found");
	if (submission.convertedPlayer) {
		const player = await Player.findById(submission.convertedPlayer);
		res.json({ success: true, data: { submission, player } });
		return;
	}

	const { firstName, lastName } = splitName(submission.studentName);
	let player = await Player.findOne({ schoolEmail: submission.studentEmail, firstName, lastName });

	if (!player) {
		player = await Player.create({
			firstName,
			lastName,
			grade: submission.grade,
			gradeOther: submission.gradeOther,
			school: submission.school,
			schoolOther: submission.schoolOther,
			division: submission.divisions?.[0],
			divisionOther: submission.divisionOther,
			phone: submission.studentPhone,
			schoolEmail: submission.studentEmail,
			status: "prospect",
		});
	}

	if (submission.parentEmail) {
		let parent = await Parent.findOne({ email: submission.parentEmail });
		if (!parent) {
			parent = await Parent.create({
				firstName: "Parent",
				lastName,
				email: submission.parentEmail,
				phone: submission.parentPhone,
				players: [player._id],
				emailOptIn: true,
			});
		} else {
			parent.players.addToSet(player._id);
			await parent.save();
		}
		player.parents.addToSet(parent._id);
		await player.save();
	}

	submission.convertedPlayer = player._id;
	submission.convertedAt = new Date();
	submission.status = "converted";
	await submission.save();

	res.json({ success: true, data: { submission, player } });
});
