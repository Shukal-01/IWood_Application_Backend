import signR2UrlsController from "../../helpers/cloudflareUtils/signR2Urls.js";
import {
  sendError,
  sendSuccess,
} from "../../helpers/other/Req_Res_Search_function.js";
import reviewContentBannersModel from "../../models/reviewContentDisplay/reviewContentBanners.model.js";

// Get active review content banners with populated internal content data
const getBanners = async (req, res) => {
  try {
    const banners = await reviewContentBannersModel
      .find({ status: "active" })
      .populate({
        path: "internalContentId",
        select: "name contentType ratingTotal ratedCount posterImage",
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!banners || banners.length === 0) {
      return sendSuccess(res, 200, [], "No banners found");
    }

    // Sign bannerImage field URLs from R2
    await signR2UrlsController.signUrlsInPayload(banners, ["bannerImage"]);

    return sendSuccess(res, 200, banners, "Banners fetched successfully");
  } catch (error) {
    console.error("Error fetching review content banners:", error);
    return sendError(res, 500, "Internal server error while fetching banners");
  }
};

const userReviewContentBannersController = {
  getBanners,
};

export default userReviewContentBannersController;
