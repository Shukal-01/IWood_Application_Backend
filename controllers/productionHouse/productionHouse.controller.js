import productionHouseModel from "../../models/productionHouse.model.js";
import {
  sendSuccess,
  sendErrors,
  responseMessages,
} from "../../helpers/other/Req_Res_Search_function.js";
import handleUpdateNew from "../../helpers/crudHelpers/new/UpdateNew2.js";

const updateProductionHouseData = async (req, res) => {
  try { 
    const user = req.user.userData;

    const skipArr = ["productionHouseCategories"];
    const extraObj = {};

    const { productionHouseCategories } = req.body;

    if (productionHouseCategories) {
        skipArr.push("productionHouseCategories");
        extraObj["productionHouseCategories"] = JSON.parse(productionHouseCategories);
      }

    const isUpdated = await handleUpdateNew(
      req,
      productionHouseModel,
      skipArr,
      extraObj,
      "",
      { _id: user._id }
    );
    
    if (isUpdated.message === "success") {
      // populate influencerCategories
      const proFileData = await productionHouseModel
        .findById(user._id)
        .populate("productionHouseCategories");
      return sendSuccess(
        res,
        responseMessages.success.common,
        { profileData: proFileData },
        "Successfully updated"
      );
    } else {
      return sendErrors(res, responseMessages.error.common);
    }
  } catch (error) {
    // console.log('catch : ');
    // console.log(error.message);
    
    
    const statusCode =
      error.statusCode || error.status || responseMessages.error.common;
    return sendErrors(res, statusCode, error.message);
  }
};

const exportProductionHouseData = { updateProductionHouseData };
export default exportProductionHouseData;
