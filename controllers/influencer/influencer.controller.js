import influencerModel from "../../models/influencer.model.js";
import {
  sendSuccess,
  sendError,
  responseMessages,
} from "../../helpers/other/Req_Res_Search_function.js";
import handleUpdateNew from "../../helpers/crudHelpers/new/UpdateNew2.js";

const updateInfluencerData = async (req, res) => {
  try {
    const user = req.user.userData;

    const skipArr = ["influencerCategories", "influencerSubCategories"];
    const extraObj = {};

    const { influencerCategories, influencerSubCategories } = req.body;
    if (influencerCategories) {
      skipArr.push("influencerCategories");
      extraObj["influencerCategories"] = JSON.parse(influencerCategories);
    }
    
    if (influencerSubCategories) {
      skipArr.push("influencerSubCategories");
      extraObj["influencerSubCategories"] = JSON.parse(influencerSubCategories);
    }

    const isUpdated = await handleUpdateNew(
      req,
      influencerModel,
      skipArr,
      extraObj,
      "",
      { _id: user._id }
    );

    if (isUpdated.message === "success") {
      // populate influencerCategories and influencerSubCategories
      const proFileData = await influencerModel
        .findById(user._id)
        .populate("influencerCategories")
        .populate("influencerSubCategories");
      return sendSuccess(
        res,
        responseMessages.success.common,
        { profileData: proFileData },
        "Successfully updated"
      );
    } else {
      return sendError(res, responseMessages.error.common);
    }
  } catch (error) {
    const statusCode =
      error.statusCode || error.status || responseMessages.error.common;
    return sendError(res, statusCode, error.message);
  }
};

const exportInfluencerData = { updateInfluencerData };
export default exportInfluencerData; 