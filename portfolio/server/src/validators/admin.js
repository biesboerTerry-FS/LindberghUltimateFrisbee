import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const userFields = {
	name: z.string().trim().min(1).max(160),
	email: z.string().trim().toLowerCase().email().max(254),
	role: z.enum(["admin", "editor", "coach"]).optional(),
	coach: objectId.optional(),
	isActive: z.boolean().optional(),
};

export const adminUserCreateSchema = z
	.object({
		...userFields,
		password: z.string().min(8).max(128),
	})
	.strict();

export const adminUserUpdateSchema = z
	.object({
		...userFields,
		name: userFields.name.optional(),
		email: userFields.email.optional(),
		password: z.string().min(8).max(128).optional(),
	})
	.strict()
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required",
	});
