import {
  sendError,
  sendSuccess,
} from "../../helpers/other/Req_Res_Search_function.js";
import productionHouseCrewModel from "../../models/productionhouse/productionHouseCrew.model.js";

const handleVerifyToken = async (req, res) => {
  try {
    const userId = req.user.userData._id;

    const proFileData = await productionHouseCrewModel
      .findById(userId)
      .populate("productionhousecrewcategories");
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

const productionHouseCrewAuthController = {
  handleVerifyToken,
};

export default productionHouseCrewAuthController;
