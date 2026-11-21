import { ApiError } from "../utils/ApiError.js";

/**
 * Validates and replaces req.body using a Zod schema.
 */
export function validateBody(schema) {
	return (req, _res, next) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			const details = result.error.issues.map((issue) => ({
				field: issue.path.join(".") || "(body)",
				message: issue.message,
			}));
			return next(ApiError.unprocessable("Validation failed", details));
		}
		req.body = result.data;
		return next();
	};
}

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Basic structural guard for JSON mutation bodies. Rejects arrays, empty or
 * non-object bodies, prototype-pollution keys and oversized fields/objects
 * before they reach a controller. `allowEmpty` is for action routes that act
 * on a URL id and intentionally take no body (e.g. approve/convert).
 */
export function requireObjectBody({ allowEmpty = false, maxFields = 100, maxStringLength = 100_000 } = {}) {
	return (req, _res, next) => {
		const body = req.body;

		if (body === undefined || body === null) {
			if (!allowEmpty) {
				return next(ApiError.badRequest("A JSON request body is required"));
			}
			req.body = {};
			return next();
		}

		if (typeof body !== "object" || Array.isArray(body)) {
			return next(ApiError.badRequest("Request body must be a JSON object"));
		}

		const keys = Object.keys(body);
		if (!allowEmpty && keys.length === 0) {
			return next(ApiError.badRequest("Request body cannot be empty"));
		}
		if (keys.length > maxFields) {
			return next(ApiError.badRequest(`Request body cannot have more than ${maxFields} fields`));
		}

		for (const key of keys) {
			if (DANGEROUS_KEYS.has(key)) {
				return next(ApiError.badRequest(`Invalid field: ${key}`));
			}
			const value = body[key];
			if (typeof value === "string" && value.length > maxStringLength) {
				return next(ApiError.badRequest(`Field "${key}" is too long`));
			}
		}

		req.body = body;
		return next();
	};
}
