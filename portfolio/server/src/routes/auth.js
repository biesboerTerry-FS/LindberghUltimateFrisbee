import { Router } from "express";
import { login, me, changePassword } from "../controllers/authController.js";
import { loginAdminDemo, loginPublicDemo } from "../controllers/demoController.js";
import { authenticate } from "../middleware/auth.js";
import { publicSubmissionLimiter } from "../middleware/rateLimit.js";
import { validateBody } from "../middleware/validate.js";
import { changePasswordSchema, loginSchema } from "../validators/public.js";

const router = Router();

router.post("/login", publicSubmissionLimiter, validateBody(loginSchema), login);
router.get("/me", authenticate, me);
router.post(
	"/change-password",
	authenticate,
	validateBody(changePasswordSchema),
	changePassword,
);

// Demo login buttons — one-click access to try authenticated areas.
// Disabled in production unless the env guard above is relaxed.
router.post("/demo/admin", publicSubmissionLimiter, loginAdminDemo);
router.post("/demo/public", publicSubmissionLimiter, loginPublicDemo);

export default router;
