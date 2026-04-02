import ProductionHouseTeamModel from "../../models/productionHouseTeam.model.js";
import ProductionHouseModel from "../../models/productionHouse.model.js";
import movieCastingCategoriesModel from "../../models/productionhouse/movieCastingCategories.model.js";
import {
  sendSuccess,
  sendError,
  responseMessages,
} from "../../helpers/other/Req_Res_Search_function.js";
import mongoose from "mongoose";

const influencerTeamController = {
  getTeamMemberships: async (req, res) => {
    try {
      const influencerId = req.user.userData._id;

      // Fetch team memberships where status is "accepted"
      const teamMemberships = await ProductionHouseTeamModel.find({
        influencerId,
        status: "accepted",
      }).populate("roles", "name");

      // Fetch production houses
      const productionHouseIds = teamMemberships.map(
        (membership) => membership.productionHouseId
      );

      const productionHouses = await ProductionHouseModel.find({
        _id: { $in: productionHouseIds },
      }).select("_id name profileImage bio");

      // Create a map for easier lookup
      const productionHouseMap = {};
      productionHouses.forEach((ph) => {
        productionHouseMap[ph._id.toString()] = ph;
      });

      // Format the response
      const formattedMemberships = teamMemberships
        .map((membership) => {
          const productionHouse =
            productionHouseMap[membership.productionHouseId.toString()];
          if (!productionHouse) return null;

          return {
            id: membership._id,
            productionHouseId: productionHouse._id,
            name: productionHouse.name,
            profileImage: productionHouse.profileImage,
            bio: productionHouse.bio,
            roles: membership.roles.map((role) => ({
              id: role._id,
              name: role.name,
            })),
            joinedAt: membership.updatedAt, // When the status was set to "accepted"
          };
        })
        .filter((membership) => membership !== null);

      return sendSuccess(
        res,
        responseMessages.success.common,
        formattedMemberships,
        "Team memberships fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching team memberships:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to fetch team memberships"
      );
    }
  },

  // Method to get public team memberships for any influencer
  getPublicTeamMemberships: async (req, res) => {
    try {
      const { influencerId } = req.params;

      if (!influencerId || !mongoose.Types.ObjectId.isValid(influencerId)) {
        return sendError(
          res, 
          responseMessages.error.common, 
          "Valid influencer ID is required"
        );
      }

      // Fetch team memberships where status is "accepted"
      const teamMemberships = await ProductionHouseTeamModel.find({
        influencerId,
        status: "accepted",
      }).populate("roles", "name");

      // Fetch production houses
      const productionHouseIds = teamMemberships.map(
        (membership) => membership.productionHouseId
      );

      const productionHouses = await ProductionHouseModel.find({
        _id: { $in: productionHouseIds },
      }).select("_id name profileImage");

      // Create a map for easier lookup
      const productionHouseMap = {};
      productionHouses.forEach((ph) => {
        productionHouseMap[ph._id.toString()] = ph;
      });

      // Format the response
      const formattedMemberships = teamMemberships
        .map((membership) => {
          const productionHouse = 
            productionHouseMap[membership.productionHouseId.toString()];
          if (!productionHouse) return null;

          return {
            id: membership._id,
            productionHouseId: productionHouse._id,
            name: productionHouse.name,
            profileImage: productionHouse.profileImage,
            roles: membership.roles.map((role) => ({
              id: role._id,
              name: role.name,
            })),
          };
        })
        .filter((membership) => membership !== null);

      return sendSuccess(
        res,
        responseMessages.success.common,
        formattedMemberships,
        "Public team memberships fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching public team memberships:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to fetch team memberships"
      );
    }
  },

  getPendingInvitations: async (req, res) => {
    try {
      const influencerId = req.user.userData._id;

      // Fetch pending invitations
      const pendingInvitations = await ProductionHouseTeamModel.find({
        influencerId,
        status: "pending",
      }).populate("roles", "name");

      // Fetch production houses
      const productionHouseIds = pendingInvitations.map(
        (invitation) => invitation.productionHouseId
      );

      const productionHouses = await ProductionHouseModel.find({
        _id: { $in: productionHouseIds },
      }).select("_id name profileImage bio");

      // Create a map for easier lookup
      const productionHouseMap = {};
      productionHouses.forEach((ph) => {
        productionHouseMap[ph._id.toString()] = ph;
      });

      // Format the response
      const formattedInvitations = pendingInvitations
        .map((invitation) => {
          const productionHouse =
            productionHouseMap[invitation.productionHouseId.toString()];
          if (!productionHouse) return null;

          return {
            id: invitation._id,
            productionHouseId: productionHouse._id,
            name: productionHouse.name,
            profileImage: productionHouse.profileImage,
            bio: productionHouse.bio,
            roles: invitation.roles.map((role) => ({
              id: role._id,
              name: role.name,
            })),
            createdAt: invitation.createdAt,
          };
        })
        .filter((invitation) => invitation !== null);

      return sendSuccess(
        res,
        responseMessages.success.common,
        formattedInvitations,
        "Pending invitations fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to fetch pending invitations"
      );
    }
  },

  getPendingInvitationsCount: async (req, res) => {
    try {
      const influencerId = req.user.userData._id;

      // Count pending invitations
      const count = await ProductionHouseTeamModel.countDocuments({
        influencerId,
        status: "pending",
      });

      return sendSuccess(
        res,
        responseMessages.success.common,
        { count },
        "Pending invitations count fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching pending invitations count:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to fetch pending invitations count"
      );
    }
  },

  acceptInvitation: async (req, res) => {
    try {
      const { invitationId } = req.params;
      const influencerId = req.user.userData._id;

      // Find and verify the invitation belongs to this influencer
      const invitation = await ProductionHouseTeamModel.findOne({
        _id: invitationId,
        influencerId,
        status: "pending",
      });

      if (!invitation) {
        return sendError(
          res,
          responseMessages.error.notFound,
          "Invitation not found or already processed"
        );
      }

      // Update the invitation status to "accepted"
      invitation.status = "accepted";
      await invitation.save();

      return sendSuccess(
        res,
        responseMessages.success.common,
        { id: invitationId },
        "Invitation accepted successfully"
      );
    } catch (error) {
      console.error("Error accepting invitation:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to accept invitation"
      );
    }
  },

  rejectInvitation: async (req, res) => {
    try {
      const { invitationId } = req.params;
      const influencerId = req.user.userData._id;

      // Find and verify the invitation belongs to this influencer
      const invitation = await ProductionHouseTeamModel.findOne({
        _id: invitationId,
        influencerId,
        status: "pending",
      });

      if (!invitation) {
        return sendError(
          res,
          responseMessages.error.notFound,
          "Invitation not found or already processed"
        );
      }

      // Update the invitation status to "rejected"
      invitation.status = "rejected";
      await invitation.save();

      return sendSuccess(
        res,
        responseMessages.success.common,
        { id: invitationId },
        "Invitation rejected successfully"
      );
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to reject invitation"
      );
    }
  },

  leaveTeam: async (req, res) => {
    try {
      const { teamId } = req.params;
      const influencerId = req.user.userData._id;

      // Find and verify the team membership belongs to this influencer
      const teamMembership = await ProductionHouseTeamModel.findOne({
        _id: teamId,
        influencerId,
        status: "accepted",
      });

      if (!teamMembership) {
        return sendError(
          res,
          responseMessages.error.notFound,
          "Team membership not found"
        );
      }

      // Delete the team membership
      await ProductionHouseTeamModel.findByIdAndDelete(teamId);

      return sendSuccess(
        res,
        responseMessages.success.common,
        { id: teamId },
        "Successfully left the team"
      );
    } catch (error) {
      console.error("Error leaving team:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to leave team"
      );
    }
  },
};

export default influencerTeamController; 