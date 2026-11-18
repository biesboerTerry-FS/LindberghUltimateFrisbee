import { config } from "../config/env.js";
import { User } from "../models/User.js";
import { PublicUser } from "../models/PublicUser.js";
import { signToken } from "../middleware/auth.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Demo login endpoints. These allow visitors to try authenticated sections
 * without needing a real Google/Apple account or the production admin password.
 * Demo accounts are created on first use and are flagged with isDemo=true.
 */

async function findOrCreateDemoAdmin() {
	let user = await User.findOne({ email: config.SEED_DEMO_ADMIN_EMAIL }).select("+passwordHash");
	if (user) {
		user.name = user.name || "Demo Admin";
		user.role = "admin";
		user.isActive = true;
		user.isDemo = true;
		if (!user.passwordHash) user.passwordHash = config.SEED_DEMO_ADMIN_PASSWORD;
		user.lastLoginAt = new Date();
		await user.save();
		return user;
	}

	user = await User.create({
		name: "Demo Admin",
		email: config.SEED_DEMO_ADMIN_EMAIL,
		passwordHash: config.SEED_DEMO_ADMIN_PASSWORD,
		role: "admin",
		isActive: true,
		isDemo: true,
		lastLoginAt: new Date(),
	});
	return user;
}

async function findOrCreateDemoPublic() {
	let user = await PublicUser.findOne({ email: config.SEED_DEMO_PUBLIC_EMAIL });
	if (user) {
		user.name = user.name || "Demo Visitor";
		user.isActive = true;
		user.isDemo = true;
		user.lastLoginAt = new Date();
		await user.save();
		return user;
	}

	user = await PublicUser.create({
		name: "Demo Visitor",
		email: config.SEED_DEMO_PUBLIC_EMAIL,
		isActive: true,
		isDemo: true,
		lastLoginAt: new Date(),
	});
	return user;
}

export const loginAdminDemo = asyncHandler(async (_req, res) => {
	if (config.isProduction && !config.ENABLE_DEMO_LOGIN) {
		throw ApiError.forbidden("Demo login is not available");
	}
	const user = await findOrCreateDemoAdmin();
	const token = signToken(user, { kind: "admin" });
	res.json({ success: true, data: { token, user } });
});

export const loginPublicDemo = asyncHandler(async (_req, res) => {
	if (config.isProduction && !config.ENABLE_DEMO_LOGIN) {
		throw ApiError.forbidden("Demo login is not available");
	}
	const user = await findOrCreateDemoPublic();
	const token = signToken(user, { kind: "public" });
	res.json({ success: true, data: { token, user } });
});
