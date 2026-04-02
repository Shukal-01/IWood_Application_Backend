import { Router } from "express";
import rateLimit from "express-rate-limit";
import adminMiddleware from "../../middlewares/admin.middleware.js";
import adminAuthController from "../../controllers/auth/admin.controller.js";
import userAuthController from "../../controllers/auth/userAuthController.js";
import userMiddleware from "../../middlewares/userMiddleware.js";
import influencerMiddleware from "../../middlewares/influencerMiddleware.js";
import influencerAuthController from "../../controllers/auth/influencerAuthController.js";
import productionHouseMiddleware from "../../middlewares/productionHouseMiddleware.js";
import productionHouseAuthController from "../../controllers/auth/productionHouseAuthController.js";
import storeMiddleware from "../../middlewares/storeMiddleware.js";
import storeAuthController from "../../controllers/auth/storeAuthController.js";
import eventCompanyMiddleware from "../../middlewares/eventCompanyMiddleware.js";
import eventCompanyAuthController from "../../controllers/auth/eventCompanyAuthController.js";
import productionHouseCrewMiddleware from "../../middlewares/productionHouseCrewMiddleware.js";
import productionHouseCrewAuthController from "../../controllers/auth/productionHouseCrewAuthController.js";

// Define rate limiting for a specific route
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per 1 minute
  message: "Too many requests from this IP, please try again later.",
});

const router = Router();

// ------------ admin --
// ===================== admin -----------------
router.post(
  "/verify-token",
  adminMiddleware.authenticateToken,
  adminAuthController.handleVerifyToken
);
router.post("/admin/login", limiter, adminAuthController.handleAdminLogin);
router.post(
  "/admin/forget-password",
  limiter,
  adminAuthController.handleAdminPassword
);
router.post(
  "/admin/forget_password_verify",
  limiter,
  adminAuthController.handleAdminPasswordVerify
);
router.post(
  "/admin/forget-password-update",
  adminMiddleware.authenticateToken,
  adminAuthController.handleAdminPasswordUpdate
);
// ===================== admin -----------------
// ------------ admin --

// user side authentication --------- start
router.post("/user/send-otp", userAuthController.handleSendLoginOtp);
router.post("/user/verify-otp", userAuthController.handleVerifyOtp);
router.post(
  "/user/verify-token",
  userMiddleware.authenticateToken,
  userAuthController.handleVerifyToken
);

// user side authentication --------- ends

// influencer side authentication --------- start
router.post(
  "/influencer/verify-token",
  influencerMiddleware.authenticateToken,
  influencerAuthController.handleVerifyToken
);
// influencer side authentication --------- ends

// production house side authentication --------- start
router.post(
  "/production_house/verify-token",
  productionHouseMiddleware.authenticateToken,
  productionHouseAuthController.handleVerifyToken
);
// production house side authentication --------- ends

// production house crew side authentication --------- start
router.post(
  "/production_house_crew/verify-token",
  productionHouseCrewMiddleware.authenticateToken,
  productionHouseCrewAuthController.handleVerifyToken
);
// production house crew side authentication --------- ends

// store side authentication --------- start
router.post(
  "/store/verify-token",
  storeMiddleware.authenticateToken,
  storeAuthController.handleVerifyToken
);
// store side authentication --------- ends

// event company side authentication --------- start
router.post(
  "/event_company/verify-token",
  eventCompanyMiddleware.authenticateToken,
  eventCompanyAuthController.handleVerifyToken
);
// event company side authentication --------- ends

const authRoutes = router;

export default authRoutes;
