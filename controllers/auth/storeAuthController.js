import { sendError, sendSuccess } from "../../helpers/other/Req_Res_Search_function.js";   
import storeModel from "../../models/store.model.js";

const handleVerifyToken = async (req, res) => {
  try {
    const userId = req.user.userData._id;

    const proFileData = await storeModel.findById(userId).populate("storeCategories");
    if (proFileData) {
      return sendSuccess(res, 200, { userData: proFileData }, "");
    } else {
      return sendError(res, 200, "Invalid Request!");
    }
  } catch (error) {
    // console.log(error.message);

    return sendError(res, 200, "Something went wrong!");
  }
};

const storeAuthController = {
  handleVerifyToken,
};

export default storeAuthController;
