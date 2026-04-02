import { Router } from "express";
import superAdminController from "../../controllers/superAdmin/superAdminController.js";
import superAdminAuth from "../../controllers/auth/superAdmin.controller.js";

const router = Router();


// ------------------ subadmins
router.post(
    "/superadmin-create",
    superAdminController.add
);

router.post(
    "/superadmin-login",
    superAdminAuth.handleSuperAdminLogin
);

// ------------------ subadmins

const superAdminRoutes = router;
export default superAdminRoutes;
