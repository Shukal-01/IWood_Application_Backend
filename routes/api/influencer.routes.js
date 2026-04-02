import { Router } from "express";
import exportInfluencerData from "../../controllers/influencer/influencer.controller.js";
import influencerTeamController from "../../controllers/influencer/influencerTeamController.js";

const router = Router();

router.put("/update-influencer-data", exportInfluencerData.updateInfluencerData);

// Influencer team management routes
router.get(
  "/team/memberships",
  influencerTeamController.getTeamMemberships
);
router.get(
  "/team/pending-invitations",
  influencerTeamController.getPendingInvitations
);
router.get(
  "/team/pending-invitations-count",
  influencerTeamController.getPendingInvitationsCount
);
router.post(
  "/team/accept-invitation/:invitationId",
  influencerTeamController.acceptInvitation
);
router.post(
  "/team/reject-invitation/:invitationId",
  influencerTeamController.rejectInvitation
);
router.delete(
  "/team/leave/:teamId",
  influencerTeamController.leaveTeam
);

const influencerRoutes = router;
export default influencerRoutes;