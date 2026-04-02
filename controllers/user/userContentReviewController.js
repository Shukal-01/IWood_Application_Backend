import mongoose from "mongoose";
import handleGetWithMsg from "../../helpers/crudHelpers/GetWithMsg.js";
import {
  responseMessages,
  sendError,
  sendSuccess,
} from "../../helpers/other/Req_Res_Search_function.js";
import MovieReviewContentModel from "../../models/productionhouse/movieReviewContent.model.js";
import movieReviewContentReviewModel from "../../models/productionhouse/movieReviewContentReview.model.js";
import reviewContentWishlistModel from "../../models/productionhouse/reviewContentWishlist.model.js";
import { allowedTypes } from "../admin/interaction.controller.js";
import userDifferentRoleManagementController from "./userDifferentRoleManagementController.js";

const handleRateContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { rating, review, userType, currentUserToken, previousReviewId } =
      req.body;

    // Validate input
    if (!contentId || typeof rating !== "number") {
      return sendError(res, 400, "Missing or invalid contentId or rating");
    }

    const content = await MovieReviewContentModel.findById(contentId);
    if (!content) {
      return sendError(res, 404, "Content not found!");
    }

    // Case: Editing a previous review
    if (previousReviewId) {
      const previousReview = await movieReviewContentReviewModel.findById(
        previousReviewId
      );

      if (previousReview) {
        // Only allow editing if the user owns the review (optional: verify identity)
        content.ratingTotal -= previousReview.rating;
        content.ratingTotal += rating;

        previousReview.review = review;
        previousReview.rating = rating;

        await Promise.all([previousReview.save(), content.save()]);
        return sendSuccess(
          res,
          200,
          previousReview,
          "Review updated successfully"
        );
      }
    }

    // Extract user profile ID from token
    const _userTokenData =
      await userDifferentRoleManagementController.getTokenUserData(
        userType,
        currentUserToken
      );

    const profileId = _userTokenData?.userData?._id;
    if (!profileId) {
      return sendError(res, 401, "User not authenticated!");
    }

    // Prevent duplicate reviews
    const existingReview = await movieReviewContentReviewModel.findOne({
      contentId,
      userType,
      userId: profileId,
    });

    if (existingReview) {
      return sendError(res, 409, "You have already reviewed this content!");
    }

    // Create new review
    const newReview = new movieReviewContentReviewModel({
      contentId,
      productionHouseId: content.productionHouseId,
      userId: profileId,
      userType,
      review,
      rating,
    });

    // Update content stats
    content.ratingTotal += rating;
    content.ratedCount += 1;

    await Promise.all([newReview.save(), content.save()]);

    return sendSuccess(res, 200, newReview, "Review submitted successfully");
  } catch (err) {
    console.error("handleRateContent error:", err);
    return res.status(500).json({
      message: "error",
      detail: "Internal server error",
    });
  }
};

const isContentAddedByMe = async (req, res) => {
  const { contentId } = req.params;
  const { userType, currentUserToken } = req.body;

  // Get logged-in user's profile ID from token
  const _userTokenData =
    await userDifferentRoleManagementController.getTokenUserData(
      userType,
      currentUserToken
    );

  const profileId = _userTokenData?.userData?._id;

  if (!profileId) {
    return sendError(res, 200, "User not found!");
  }

  const review = await movieReviewContentReviewModel
    .findOne({
      contentId,
      userType,
      userId: profileId,
    })
    .populate({
      path: "userId",
      select: "name profileImage",
    });

  if (review) {
    return sendSuccess(res, 200, review, "");
  } else {
    return sendError(res, 200, "Content not found!");
  }
};

const handleGetContentReviews = (req, res) => {
  const { contentId } = req.params;
  handleGetWithMsg(
    req,
    res,
    movieReviewContentReviewModel,
    { contentId: contentId },
    {
      path: "userId",
      select: "name profileImage",
    }
  );
};

const searchContent = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return sendSuccess(res, 200, [], "Please provide a search query");
    }

    // Create a case-insensitive regex for the search
    const searchRegex = new RegExp(query, 'i');
    
    // Search for content matching the query in the name field
    // Use lean() for better performance and limit to essential fields
    const results = await MovieReviewContentModel.find({
      name: searchRegex,
      status: "active"
    })
    .select('name bannerImage releaseData ratingTotal ratedCount productionHouseId')
    .populate({
      path: 'productionHouseId',
      select: 'name'
    })
    .limit(20)
    .lean();
    
    return sendSuccess(res, 200, results, "Search results fetched successfully");
  } catch (err) {
    return res.status(500).json({
      message: "error",
      detail: "Internal server error while searching content",
    });
  }
};

export const handleAddToWishlistReviewContent = async (req, res) => {
  try {
    const { userType, userId, reviewContent } = req.params;
    if (
      !allowedTypes.includes(userType) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(reviewContent)
    ) {
      // console.log(userType, userId, reviewContent);
      return sendError(
        res,
        responseMessages.error.common,
        "Invalid parameters"
      );
    }

    // 1) Create the Like record (will throw if duplicate)
    await reviewContentWishlistModel.create({
      userType,
      userId,
      reviewContent,
    });

    // 3) Add this reviewContent to the user's likedPosts array
    //    Use the correct Mongoose model by userType
    const UserModel = mongoose.model(userType);
    await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { reviewContentWishlists: reviewContent } }, // addToSet prevents duplicates
      { new: true }
    );

    return sendSuccess(res, responseMessages.success.common, {
      reviewContent,
    });
  } catch (err) {
    if (err.code === 11000) {
      // duplicate key from Like.create()
      return sendError(
        res,
        responseMessages.error.common,
        "Already Bookmarked"
      );
    }
    console.error("Error in handleBookmarkPost:", err);
    return sendError(
      res,
      responseMessages.error.common,
      "Could not saved post"
    );
  }
};

export const handleRemoveFromWishlistReviewContent = async (req, res) => {
  try {
    const { userType, userId, reviewContent } = req.params;
    // ... validation as before ...

    // 1) Remove the Like document
    const deleteResult = await reviewContentWishlistModel.deleteOne({
      userType,
      userId,
      reviewContent,
    });
    if (deleteResult.deletedCount === 0) {
      return sendError(
        res,
        responseMessages.error.common,
        "Bookmark not found"
      );
    }

    // 3) Pull the reviewContent from the user's likedPostsByMe array
    const UserModel = mongoose.model(userType);
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { reviewContentWishlists: reviewContent } }, // <-- updated field name
      { new: true }
    );

    // 4) Respond with the new counts and optional user data
    return sendSuccess(res, responseMessages.success.common, {
      reviewContent,
      reviewContentWishlists: updatedUser.reviewContentWishlists,
    });
  } catch (err) {
    console.error("Error in handleBookmarkPost:", err);
    return sendError(
      res,
      responseMessages.error.common,
      "Could not bookmark post"
    );
  }
};

const userContentReviewController = {
  handleRateContent,
  handleGetContentReviews,
  isContentAddedByMe,
  handleAddToWishlistReviewContent,
  handleRemoveFromWishlistReviewContent,
  searchContent,
};

export default userContentReviewController;
