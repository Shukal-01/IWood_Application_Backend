import InfluencerModel from "../../models/influencer.model.js";
import ProductionHouseTeamModel from "../../models/productionHouseTeam.model.js";
import movieCastingCategoriesModel from "../../models/productionhouse/movieCastingCategories.model.js";
import {
  sendSuccess,
  sendError,
  responseMessages,
} from "../../helpers/other/Req_Res_Search_function.js";
import mongoose from "mongoose";

// Make sure influencer model is registered
const Influencer = mongoose.model("influencers");

const productionHouseTeamController = {
  searchInfluencer: async (req, res) => {
    try {
      const { searchQuery } = req.query;
      const productionHouseId = req.user.userData._id;

      if (!searchQuery) {
        return sendError(
          res,
          responseMessages.error.common,
          "Search query is required"
        );
      }

      // Search for influencers by name or username
      const influencers = await InfluencerModel.find({
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { username: { $regex: searchQuery, $options: "i" } },
        ],
      })
        .select("_id name username profileImage")
        .limit(10);

      // Check if influencer is already a team member or has a pending invitation
      const teamMembers = await ProductionHouseTeamModel.find({
        productionHouseId,
        influencerId: { $in: influencers.map((inf) => inf._id) },
      }).select("influencerId status");

      // Create a map for easier lookup
      const teamMemberMap = {};
      teamMembers.forEach((member) => {
        teamMemberMap[member.influencerId.toString()] = member.status;
      });

      const result = influencers.map((influencer) => {
        const status = teamMemberMap[influencer._id.toString()];
        return {
          id: influencer._id,
          name: influencer.name,
          username: influencer.username,
          profileImage: influencer.profileImage,
          isTeamMember: status === "accepted",
          hasPendingInvitation: status === "pending",
        };
      });

      return sendSuccess(
        res,
        responseMessages.success.common,
        result,
        "Influencers fetched successfully"
      );
    } catch (error) {
      console.error("Error searching influencers:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to search influencers"
      );
    }
  },

  getCastingCategories: async (req, res) => {
    try {
      // Fetch all active casting categories
      const categories = await movieCastingCategoriesModel
        .find({ status: "1" })
        .select("_id name")
        .sort("importance");

      return sendSuccess(
        res,
        responseMessages.success.common,
        categories,
        "Casting categories fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching casting categories:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to fetch casting categories"
      );
    }
  },

  addTeamMember: async (req, res) => {
    try {
      const { influencerId, roleIds } = req.body;
      const productionHouseId = req.user.userData._id;

      if (
        !influencerId ||
        !roleIds ||
        !Array.isArray(roleIds) ||
        roleIds.length === 0
      ) {
        return sendError(
          res,
          responseMessages.error.common,
          "Influencer ID and at least one role are required"
        );
      }

      // Validate role IDs
      const validRoles = await movieCastingCategoriesModel.find({
        _id: { $in: roleIds },
        status: "1",
      });

      if (validRoles.length !== roleIds.length) {
        return sendError(
          res,
          responseMessages.error.common,
          "One or more selected roles are invalid"
        );
      }

      // Check if influencer exists
      const influencer = await InfluencerModel.findById(influencerId);
      if (!influencer) {
        return sendError(
          res,
          responseMessages.error.notFound,
          "Influencer not found"
        );
      }

      // Check if already a team member or has pending invitation
      const existingMember = await ProductionHouseTeamModel.findOne({
        productionHouseId,
        influencerId,
      });

      if (existingMember) {
        if (existingMember.status === "accepted") {
          return sendError(
            res,
            responseMessages.error.common,
            "Influencer is already a team member"
          );
        } else if (existingMember.status === "pending") {
          // Update roles if pending
          existingMember.roles = roleIds;
          await existingMember.save();

          return sendSuccess(
            res,
            responseMessages.success.common,
            existingMember,
            "Invitation updated successfully"
          );
        } else {
          // If previously rejected, update to pending
          existingMember.status = "pending";
          existingMember.roles = roleIds;
          await existingMember.save();

          return sendSuccess(
            res,
            responseMessages.success.create,
            existingMember,
            "Invitation sent successfully"
          );
        }
      }

      // Create new team member with pending status
      const newTeamMember = new ProductionHouseTeamModel({
        productionHouseId,
        influencerId,
        roles: roleIds,
        status: "pending", // Default is pending until influencer accepts
      });

      await newTeamMember.save();

      return sendSuccess(
        res,
        responseMessages.success.create,
        newTeamMember,
        "Invitation sent successfully"
      );
    } catch (error) {
      console.error("Error adding team member:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to send invitation"
      );
    }
  },

  getTeamMembers: async (req, res) => {
    try {
      const productionHouseId = req.user.userData._id;

      // Fetch only accepted team members
      const teamMembers = await ProductionHouseTeamModel.find({
        productionHouseId,
        status: "accepted",
      }).populate("roles", "name");

      // Fetch influencer data separately to avoid model registration issues
      const teamMemberIds = teamMembers.map((member) => member.influencerId);
      const influencers = await InfluencerModel.find({
        _id: { $in: teamMemberIds },
      }).select("_id name username profileImage");

      // Create a map for easier lookup
      const influencerMap = {};
      influencers.forEach((influencer) => {
        influencerMap[influencer._id.toString()] = influencer;
      });

      // Format the response
      const formattedTeamMembers = teamMembers
        .map((member) => {
          const influencer = influencerMap[member.influencerId.toString()];
          if (!influencer) return null;

          return {
            id: member._id,
            influencerId: influencer._id,
            name: influencer.name,
            username: influencer.username,
            profileImage: influencer.profileImage,
            roles: member.roles.map((role) => ({
              id: role._id,
              name: role.name,
            })),
            createdAt: member.createdAt,
          };
        })
        .filter((member) => member !== null);

      return sendSuccess(
        res,
        responseMessages.success.common,
        formattedTeamMembers,
        "Team members fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching team members:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to fetch team members"
      );
    }
  },

  getPendingInvitations: async (req, res) => {
    try {
      const productionHouseId = req.user.userData._id;

      // Fetch pending invitations
      const pendingInvitations = await ProductionHouseTeamModel.find({
        productionHouseId,
        status: "pending",
      }).populate("roles", "name");

      // Fetch influencer data separately to avoid model registration issues
      const invitationInfluencerIds = pendingInvitations.map(
        (invitation) => invitation.influencerId
      );
      const influencers = await InfluencerModel.find({
        _id: { $in: invitationInfluencerIds },
      }).select("_id name username profileImage");

      // Create a map for easier lookup
      const influencerMap = {};
      influencers.forEach((influencer) => {
        influencerMap[influencer._id.toString()] = influencer;
      });

      // Format the response
      const formattedInvitations = pendingInvitations
        .map((invitation) => {
          const influencer = influencerMap[invitation.influencerId.toString()];
          if (!influencer) return null;

          return {
            id: invitation._id,
            influencerId: influencer._id,
            name: influencer.name,
            username: influencer.username,
            profileImage: influencer.profileImage,
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

  cancelInvitation: async (req, res) => {
    try {
      const { invitationId } = req.params;
      const productionHouseId = req.user.userData._id;

      // Find and verify the invitation belongs to this production house
      const invitation = await ProductionHouseTeamModel.findOne({
        _id: invitationId,
        productionHouseId,
        status: "pending",
      });

      if (!invitation) {
        return sendError(
          res,
          responseMessages.error.notFound,
          "Invitation not found or already processed"
        );
      }

      // Delete the invitation
      await ProductionHouseTeamModel.findByIdAndDelete(invitationId);

      return sendSuccess(
        res,
        responseMessages.success.common,
        { id: invitationId },
        "Invitation cancelled successfully"
      );
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to cancel invitation"
      );
    }
  },

  removeTeamMember: async (req, res) => {
    try {
      const { memberId } = req.params;
      const productionHouseId = req.user.userData._id;

      // Find and verify the team member belongs to this production house
      const teamMember = await ProductionHouseTeamModel.findOne({
        _id: memberId,
        productionHouseId,
        status: "accepted",
      });

      if (!teamMember) {
        return sendError(
          res,
          responseMessages.error.notFound,
          "Team member not found"
        );
      }

      // Delete the team member
      await ProductionHouseTeamModel.findByIdAndDelete(memberId);

      return sendSuccess(
        res,
        responseMessages.success.common,
        { id: memberId },
        "Team member removed successfully"
      );
    } catch (error) {
      console.error("Error removing team member:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to remove team member"
      );
    }
  },

  // Method to get public team members for any production house
  getPublicTeamMembers: async (req, res) => {
    try {
      const { productionHouseId } = req.params;
      
      if (!productionHouseId || !mongoose.Types.ObjectId.isValid(productionHouseId)) {
        return sendError(
          res, 
          responseMessages.error.common, 
          "Valid production house ID is required"
        );
      }

      // Fetch only accepted team members
      const teamMembers = await ProductionHouseTeamModel.find({
        productionHouseId,
        status: "accepted",
      }).populate("roles", "name");

      // Fetch influencer data separately
      const teamMemberIds = teamMembers.map((member) => member.influencerId);
      const influencers = await InfluencerModel.find({
        _id: { $in: teamMemberIds },
      }).select("_id name username profileImage");

      // Create a map for easier lookup
      const influencerMap = {};
      influencers.forEach((influencer) => {
        influencerMap[influencer._id.toString()] = influencer;
      });

      // Format the response
      const formattedTeamMembers = teamMembers
        .map((member) => {
          const influencer = influencerMap[member.influencerId.toString()];
          if (!influencer) return null;

          return {
            id: member._id,
            influencerId: influencer._id,
            name: influencer.name,
            username: influencer.username,
            profileImage: influencer.profileImage,
            roles: member.roles.map((role) => ({
              id: role._id,
              name: role.name,
            })),
          };
        })
        .filter((member) => member !== null);

      return sendSuccess(
        res,
        responseMessages.success.common,
        formattedTeamMembers,
        "Public team members fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching public team members:", error);
      return sendError(
        res,
        responseMessages.error.serverError,
        "Failed to fetch team members"
      );
    }
  },
};

export default productionHouseTeamController;
