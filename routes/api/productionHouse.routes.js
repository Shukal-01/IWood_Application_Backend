import { Router } from "express";
import exportProductionHouseData from "../../controllers/productionHouse/productionHouse.controller.js";
import productionHouseContentRatingController from "../../controllers/productionHouse/productionHouseContentRatingController.js";
import productionHouseTeamController from "../../controllers/productionHouse/productionHouseTeamController.js";

const router = Router();

router.put(
  "/update-production-house-data",
  exportProductionHouseData.updateProductionHouseData
);

// content for rating --------------------- start
router.post(
  "/content-rating/new-upload",
  productionHouseContentRatingController.newUpload
);
router.put(
  "/content-rating/update-upload/:contentId",
  productionHouseContentRatingController.updateUpload
);
// content for rating --------------------- ends

// production house team --------------------- start
router.get(
  "/team/search-influencer",
  productionHouseTeamController.searchInfluencer
);
router.get(
  "/team/casting-categories",
  productionHouseTeamController.getCastingCategories
);
router.post(
  "/team/add-member",
  productionHouseTeamController.addTeamMember
);
router.get(
  "/team/members",
  productionHouseTeamController.getTeamMembers
);
router.get(
  "/team/pending-invitations",
  productionHouseTeamController.getPendingInvitations
);
router.delete(
  "/team/cancel-invitation/:invitationId",
  productionHouseTeamController.cancelInvitation
);
router.delete(
  "/team/remove-member/:memberId",
  productionHouseTeamController.removeTeamMember
);
// production house team --------------------- ends

const productionHouseRoutes = router;
export default productionHouseRoutes;
