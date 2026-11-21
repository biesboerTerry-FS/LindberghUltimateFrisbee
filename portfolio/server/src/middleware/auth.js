import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { User } from "../models/User.js";
import { PublicUser } from "../models/PublicUser.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Pin the algorithm and scope: a token for another app (or a token with a
// different claim set) must never grant access to the admin API.
const TOKEN_ALGORITHMS = ["HS256"];
const TOKEN_ISSUER = "lindbergh-ultimate-api";
const TOKEN_AUDIENCE = "lindbergh-ultimate-client";

const VERIFY_OPTIONS = {
	algorithms: TOKEN_ALGORITHMS,
	issuer: TOKEN_ISSUER,
	audience: TOKEN_AUDIENCE,
};

function extractToken(req) {
	const header = req.get("authorization") || "";
	if (header.toLowerCase().startsWith("bearer ")) {
		return header.slice(7).trim() || null;
	}
	// Tokens are only read from the Authorization header — never from a query
	// string or cookie, which could leak into logs/referrers.
	return null;
}

function verifyToken(token) {
	try {
		return jwt.verify(token, config.JWT_SECRET, VERIFY_OPTIONS);
	} catch {
		throw ApiError.unauthorized("Invalid or expired token");
	}
}

function getTokenKind(payload) {
	if (payload.kind === "public") return "public";
	if (payload.kind === "admin") return "admin";
	// Legacy tokens (issued before `kind` existed) were staff tokens only.
	return "admin";
}

/**
 * Authenticates staff (`admin` kind) API calls. Rejects public OAuth tokens.
 * Only a signed, unexpired admin JWT is accepted — no shared API key fallback.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
	const token = extractToken(req);

	if (!token) {
		throw ApiError.unauthorized("Authentication required");
	}

	const payload = verifyToken(token);

	if (getTokenKind(payload) !== "admin") {
		throw ApiError.forbidden("Staff access required");
	}
	if (typeof payload.sub !== "string" || !payload.sub) {
		throw ApiError.unauthorized("Invalid token subject");
	}

	const user = await User.findById(payload.sub);
	if (!user || !user.isActive) {
		throw ApiError.unauthorized("User account is not active");
	}

	req.user = user;
	req.user.via = "jwt";
	req.user.kind = "admin";
	return next();
});

/**
 * Authenticates public (visitor) OAuth sessions. Rejects staff tokens so a
 * staff JWT can never be used as a public account (and vice versa).
 */
export const authenticatePublic = asyncHandler(async (req, _res, next) => {
	const token = extractToken(req);

	if (!token) {
		throw ApiError.unauthorized("Authentication required");
	}

	const payload = verifyToken(token);

	if (getTokenKind(payload) !== "public") {
		throw ApiError.forbidden("Public sign-in required");
	}
	if (typeof payload.sub !== "string" || !payload.sub) {
		throw ApiError.unauthorized("Invalid token subject");
	}

	const user = await PublicUser.findById(payload.sub);
	if (!user || !user.isActive) {
		throw ApiError.unauthorized("User account is not active");
	}

	req.user = user;
	req.user.via = "jwt";
	req.user.kind = "public";
	return next();
});

export function authorize(...roles) {
	return (req, _res, next) => {
		if (!req.user) return next(ApiError.unauthorized());
		if (roles.length && !roles.includes(req.user.role)) {
			return next(ApiError.forbidden("You do not have permission to perform this action"));
		}
		return next();
	};
}

export function signToken(user, { kind = "admin" } = {}) {
	return jwt.sign(
		{
			sub: user.id || user._id?.toString?.(),
			role: user.role || (kind === "public" ? "public" : "admin"),
			email: user.email,
			kind,
		},
		config.JWT_SECRET,
		{
			algorithm: "HS256",
			expiresIn: config.JWT_EXPIRES_IN,
			issuer: TOKEN_ISSUER,
			audience: TOKEN_AUDIENCE,
		},
	);
}
