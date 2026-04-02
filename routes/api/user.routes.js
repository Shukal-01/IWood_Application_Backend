import { Router } from "express";
import userDifferentRoleManagementController from "../../controllers/user/userDifferentRoleManagementController.js";
import userDifferentPostingController from "../../controllers/user/userDifferentPostingController.js";
import userPostController from "../../controllers/user/usetPostController.js";
import userGetDataController from "../../controllers/user/userGetDataController.js";
import {
  handleLikePost,
  handleCommentPost,
  handleGetPostComments,
  handleGetPostLikes,
  handleUnlikePost,
  handleGetLikedPostsByUser,
  handleBookmarkPost,
  handleGetPostBookmarks,
  handleRemoveBookmark,
  handleGetBookmarkedPostsByUser,
} from "../../controllers/admin/interaction.controller.js";
import {
  checkFollowingStatus,
  handleFollow,
  handleGetFollowers,
  handleGetFollowing,
  handleUnfollow,
} from "../../controllers/userFollow/userFollow.controller.js";
import { getAllFollowerCounts } from "../../controllers/socialFollowers/socialFollowCount.controller.js";
import { sendSuccess } from "../../helpers/other/Req_Res_Search_function.js";
import userContentReviewController from "../../controllers/user/userContentReviewController.js";
import userReviewContentBannersController from "../../controllers/user/reviewContentBannersController.js";

import userProfileController from "../../controllers/user/userProfileController.js";

import {
  handleDislikeReview,
  handleGetReviewReactions,
  handleLikeReview,
  handleDeleteReview,
} from "../../controllers/admin/reviewController.js";
import influencerTeamController from "../../controllers/influencer/influencerTeamController.js";
import productionHouseTeamController from "../../controllers/productionHouse/productionHouseTeamController.js";
import { sign } from "crypto";
import signR2UrlsMiddleware from "../../middlewares/signR2Urls.js";

const router = Router();
router.get("/get-upload-posts", userDifferentPostingController.getUploadPosts);

// Review content banners
router.get(
  "/reviewcontent/banners",
  userReviewContentBannersController.getBanners
);

// Content search
router.get("/reviewcontent/search", userContentReviewController.searchContent);

// influencer related  ----------------------------------------------------
router.post(
  "/influencer/is-user-influencer",
  userDifferentRoleManagementController.handleCheckIfUserIsInfluencer
);

router.post(
  "/influencer/create-new-influencer",
  userDifferentRoleManagementController.handleCreateInfluencerAccount
);

router.get(
  "/influencer/get-single-influencer/:influencerId",
  userDifferentRoleManagementController.handleGetSingleInfluencerById
);

// influencer related  ----------------------------------------------------

// ----------------------------------------------------
router.post("/like/:userType/:userId/:postId", handleLikePost);
router.get("/likes/:userType/:userId/:postId", handleGetPostLikes);
router.get("/liked-posts/:userType/:userId", handleGetLikedPostsByUser);
router.delete("/dislike/:userType/:userId/:postId", handleUnlikePost);

router.post("/post-bookmark/:userType/:userId/:postId", handleBookmarkPost);
router.get(
  "/get-post-bookmark/:userType/:userId/:postId",
  handleGetPostBookmarks
);
router.get(
  "/bookmark-by-user/:userType/:userId",
  handleGetBookmarkedPostsByUser
);
router.delete(
  "/remove-post-bookmark/:userType/:userId/:postId",
  handleRemoveBookmark
);

router.post("/comment/:userType/:userId/:postId", handleCommentPost);
router.get("/comments/:userType/:userId/:postId", handleGetPostComments);
// ----------------------------------------------------

// production house related  ----------------------------------------------------
router.post(
  "/production_house/is-user-production_house",
  userDifferentRoleManagementController.handleCheckIfUserIsProductionHouse
);

router.post(
  "/production_house/create-new-production_house",
  userDifferentRoleManagementController.handleCreateProductionHouseAccount
);

router.get(
  "/production_house/get-single-production-house/:productionId",
  signR2UrlsMiddleware,
  userDifferentRoleManagementController.handleGetSingleProductionHouseById
);
// production house related  ----------------------------------------------------

// production house crew related  ----------------------------------------------------
router.post(
  "/production_house_crew/is-user-production_house_crew",
  userDifferentRoleManagementController.handleCheckIfUserIsProductionHouseCrew
);

router.post(
  "/production_house_crew/create-new-production_house_crew",
  userDifferentRoleManagementController.handleCreateProductionHouseCrewAccount
);

// router.get(
//   "/production_house/get-single-production-house/:productionId",
//   userDifferentRoleManagementController.handleGetSingleProductionHouseById
// );
// production house crew related  ----------------------------------------------------
// store related  ----------------------------------------------------
router.post(
  "/store/is-user-store",
  userDifferentRoleManagementController.handleCheckIfUserIsStore
);

router.post(
  "/store/create-new-store",
  userDifferentRoleManagementController.handleCreateStoreAccount
);
// store related  ----------------------------------------------------
// event related  ----------------------------------------------------
router.post(
  "/event_company/is-user-event_company",
  userDifferentRoleManagementController.handleCheckIfUserIsEventCompany
);

router.post(
  "/event_company/create-new-event_company",
  userDifferentRoleManagementController.handleCreateEventCompanyAccount
);
// event related  ----------------------------------------------------

// --------------------------------------------- start
// -- posting : reels , shorts, etc ...

router.post(
  "/posting/upload",
  // upload.single("video"),
  userDifferentPostingController.handleUpload
);

// -- posting : reels , shorts, etc ...
// --------------------------------------------- ends

// --------------------------------------------- ends
router.get("/post/get-all", userPostController.handleGetAllPosts);
router.get(
  "/posts/get-all-with-user-data",
  userPostController.handleGetAllPostsWithUserData
);
router.get(
  "/posts/get-all-reel-posts-with-user-data",
  userPostController.handleGetAllReelPosts
);
router.get("/posts/:userType/:userId", userPostController.handleGetPostsByUser);
router.get(
  "/user-follow-status/:viewerType/:viewerId/:targetType/:targetId",
  checkFollowingStatus
);

// GET /api/users/search?userType=influencer&username=john doe
router.get("/search", userGetDataController.handleSearchUsers);

router.get(
  "/search_production_house_crews",
  userGetDataController.handleSearchProductionHouseCrews
);

router.get(
  "/influencer/get-categories",
  userGetDataController.handleGetInfluencerCategories
);

router.get(
  "/influencer/get-subcategories/:categoryId",
  userGetDataController.handleGetInfluencerSubCategories
);

router.get(
  "/production-house/get-categories",
  userGetDataController.handleGetProductionHoueCategories
);

// ---- content review section -------------------------------------
router.get(
  "/production-house/get-content/for-banner",
  userGetDataController.handleGetReviewContents
);
router.get(
  "/production-house/get-content/by-id/:contentId",
  userGetDataController.handleGetReviewContentById
);
router.get(
  "/production-house/get-content/:productionHouseId",
  userGetDataController.handleGetProductionHousesContentByProductionHouseId
);
router.get("/moviereview/getall", userGetDataController.handleGetMovieGenres);
router.get(
  "/production-house-content-type/getall",
  userGetDataController.handleGetProductionHouseContentTypes
);
router.post(
  "/production-house-content/add-review/:contentId",
  userContentReviewController.handleRateContent
);
router.post(
  "/production-house-content/is-added-by-me/:contentId",
  userContentReviewController.isContentAddedByMe
);
router.get(
  "/production-house-content/get-reviews/:contentId",
  userContentReviewController.handleGetContentReviews
);
router.post(
  "/production-house-content/add-to-wishlist/:userType/:userId/:reviewContent",
  userContentReviewController.handleAddToWishlistReviewContent
);
router.delete(
  "/production-house-content/remote-from-wishlist/:userType/:userId/:reviewContent",
  userContentReviewController.handleRemoveFromWishlistReviewContent
);

// ---- content review section -------------------------------------
router.get(
  "/influencer/influencer-by-influencer-category/:categoryId",
  userGetDataController.handleGetInfluencersByInfluencerCategory
);
router.get(
  "/store/get-categories",
  userGetDataController.handleGetStoreCategories
);
router.get(
  "/event-company/get-categories",
  userGetDataController.handleGetEventCompanyCategories
);
router.get(
  "/production-house/production-house-by-production-house-category/:categoryId",
  userGetDataController.handleGetProductionHousesByProductionHouseCategoryId
);
router.get(
  "/production-house-crew/get-categories",
  userGetDataController.handleGetProductionHoueCrewCategories
);
router.get(
  "/movie-casting-categories/get-all",
  userGetDataController.handleGetMoviewCastingCategories
);

// follow routes-----------
router.post("/user-follow", handleFollow);
router.post("/user-unfollow", handleUnfollow);
router.get("/following/:userType/:userId", handleGetFollowing);
router.get("/followers/:userType/:userId", handleGetFollowers);

// Social Media Followers------
router.get("/social-media-followers/:userType/:userId", async (req, res) => {
  const { userType, userId } = req.params;
  try {
    const stats = await getAllFollowerCounts(userType, userId);
    return sendSuccess(res, 200, stats, "Fetched successfully");
  } catch (err) {
    // console.error(
    //   `Error fetching social-media-followers for ${userType}/${userId}:`,
    //   err
    // );
    return res.status(500).json({ error: err.message });
  }
});

// Like a review
router.post("/reviews/:reviewId/like/:userType/:userId", handleLikeReview);

// Dislike a review
router.post(
  "/reviews/:reviewId/dislike/:userType/:userId",
  handleDislikeReview
);

// Delete a review
router.delete(
  "/reviews/:reviewId/delete/:userType/:userId",
  handleDeleteReview
);

// Get like/dislike counts and current user's reaction
router.get("/reviews/reactions", handleGetReviewReactions);
// --------------------------------------------- ends

// User profile update route
router.post("/update-user-data", userProfileController.updateUserData);

// Team management public routes
router.get(
  "/influencer/team-memberships/:influencerId",
  influencerTeamController.getPublicTeamMemberships
);

router.get(
  "/production-house/team-members/:productionHouseId",
  productionHouseTeamController.getPublicTeamMembers
);

const userRoutes = router;

export default userRoutes;

// if(default app == influencer){

//     if ( influencer token exist ){
//         verify {
//             return influencer dashboard;
//         }
//     }

//     localStorage.influencerAuthToken = '';  // remove token
//     localStorage.defaultApp = 'user';
//         return to user home screen with an popup error;

// }else{
//     is this user an influencer? => await api will be called and if user is an influencer token will be provided;
//    (  is this user an influencer?){

//     //    token must be given by this api

//     localStorage.influencerAuthToken = token;
//     localStorage.defaultApp = 'influencer';

//     app restart kardo ;

//    }else ( detail == 'not_an_influencer') {
//     return  -> influencer registration screen

//     isSuccessfulRegistration
//     (isSuccessfulRegistration) {

//         navigate to influencer Splash

//     }else{
//         show popup error
//     }

//    }else{
//     return to user home screen with an popup error
//    }
// }
