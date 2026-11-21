import { Router } from "express";
import { login, me, changePassword } from "../controllers/authController.js";
import { loginAdminDemo, loginPublicDemo } from "../controllers/demoController.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validateBody } from "../middleware/validate.js";
import { changePasswordSchema, loginSchema } from "../validators/public.js";

const router = Router();

// Tokens are returned from these routes — never let a proxy cache them.
router.use((_req, res, next) => {
	res.set("Cache-Control", "no-store");
	next();
});

router.post("/login", authLimiter, validateBody(loginSchema), login);
router.get("/me", authenticate, me);
router.post(
	"/change-password",
	authenticate,
	validateBody(changePasswordSchema),
	changePassword,
);

// Demo login buttons — one-click access to try authenticated areas.
// Disabled in production unless ENABLE_DEMO_LOGIN is set.
router.post("/demo/admin", authLimiter, loginAdminDemo);
router.post("/demo/public", authLimiter, loginPublicDemo);

export default router;
