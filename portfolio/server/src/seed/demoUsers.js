import { config } from "../config/env.js";
import { User } from "../models/User.js";
import { PublicUser } from "../models/PublicUser.js";

/**
 * Create or refresh the demo accounts used by the "Try demo" login buttons.
 * Demo accounts are ordinary users with isDemo=true so the UI can show a banner.
 */
export async function seedDemoUsers() {
	const admin = await User.findOne({ email: config.SEED_DEMO_ADMIN_EMAIL }).select("+passwordHash");
	if (admin) {
		admin.name = admin.name || "Demo Admin";
		admin.role = "admin";
		admin.isActive = true;
		admin.isDemo = true;
		admin.passwordHash = config.SEED_DEMO_ADMIN_PASSWORD;
		await admin.save();
	} else {
		await User.create({
			name: "Demo Admin",
			email: config.SEED_DEMO_ADMIN_EMAIL,
			passwordHash: config.SEED_DEMO_ADMIN_PASSWORD,
			role: "admin",
			isActive: true,
			isDemo: true,
		});
	}

	const publicUser = await PublicUser.findOne({ email: config.SEED_DEMO_PUBLIC_EMAIL });
	if (publicUser) {
		publicUser.name = publicUser.name || "Demo Visitor";
		publicUser.isActive = true;
		publicUser.isDemo = true;
		await publicUser.save();
	} else {
		await PublicUser.create({
			name: "Demo Visitor",
			email: config.SEED_DEMO_PUBLIC_EMAIL,
			isActive: true,
			isDemo: true,
		});
	}

	console.log(`[seed] demo users ready: ${config.SEED_DEMO_ADMIN_EMAIL}, ${config.SEED_DEMO_PUBLIC_EMAIL}`);
}
