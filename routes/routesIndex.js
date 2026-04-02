import express from "express";
import authRoutes from "./auth/auth.routes.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import adminRoutes from "./api/admin.routes.js";
import superAdminRoutes from "./api/superAdmin.routes.js";
import webRoutes from "./api/web.routes.js";
import userMiddleware from "../middlewares/userMiddleware.js";
import userRoutes from "./api/user.routes.js";
import cloudflareR2Routes from "../helpers/cloudflareUtils/r2Routes.js";
import influencerMiddleware from "../middlewares/influencerMiddleware.js";
import influencerRoutes from "./api/influencer.routes.js";
import productionHouseMiddleware from "../middlewares/productionHouseMiddleware.js";
import productionHouseRoutes from "./api/productionHouse.routes.js";
import { cacheMiddleware } from "../middlewares/cacheMiddleware.js";
import rateLimitMiddleware from "../middlewares/rateLimitMiddleware.js";

const app = express.Router();

// Apply rate limiting to all routes
app.use(rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
}));

// Authentication routes - no caching needed
app.use("/auth", authRoutes);
app.use("/auth/*", authRoutes);

// Web routes - public data can be cached
app.use("/web", cacheMiddleware(300), webRoutes); // Cache for 5 minutes

// R2 file routes - apply stricter rate limits
app.use("/files", rateLimitMiddleware({
  windowMs: 60 * 1000,
  max: 50
}), cloudflareR2Routes);

// Admin routes - no caching for security
app.use("/superadmin", superAdminRoutes);
app.use("/superadmin/*", superAdminRoutes);

app.use("/admin", adminMiddleware.authenticateToken, adminRoutes);
app.use("/admin/*", adminMiddleware.authenticateToken, adminRoutes);

// User routes - apply caching for read operations
app.use("/user", userMiddleware.authenticateToken, userRoutes);
app.use("/user/*", userMiddleware.authenticateToken, userRoutes);

// Influencer routes
app.use("/influencer", influencerMiddleware.authenticateToken, influencerRoutes);
app.use("/influencer/*", influencerMiddleware.authenticateToken, influencerRoutes);

// Production house routes
app.use("/production-house", productionHouseMiddleware.authenticateToken, productionHouseRoutes);
app.use("/production-house/*", productionHouseMiddleware.authenticateToken, productionHouseRoutes);

// 404 handler
app.use("/", (req, res) => {
  return res.status(404).json({ message: "error", detail: "page not found" });
});

const routeIndex = app;

export default routeIndex;
