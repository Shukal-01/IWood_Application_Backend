import {
  sendError,
  sendSuccess,
} from "../../helpers/other/Req_Res_Search_function.js";
import productionHouseModel from "../../models/productionHouse.model.js";

const handleVerifyToken = async (req, res) => {
  try {
    const userId = req.user.userData._id;

    const proFileData = await productionHouseModel
      .findById(userId)
      .populate("productionHouseCategories");
    if (proFileData) {
      // console.log(proFileData)
      return sendSuccess(res, 200, { userData: proFileData }, "");
    } else {
      // console.log("Invalid Request!", proFileData);
      return sendError(res, 200, "Invalid Request!");
    }
  } catch (error) {
    // console.log(error.message);
    return sendError(res, 200, "Something went wrong!");
  }
};

const productionHouseAuthController = {
  handleVerifyToken,
};

export default productionHouseAuthController;
