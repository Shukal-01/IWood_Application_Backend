import { sendError, sendSuccess } from "../../helpers/other/Req_Res_Search_function.js";   
import eventCompanyModel from "../../models/eventCompany.model.js";

const handleVerifyToken = async (req, res) => {
  try {
    const userId = req.user.userData._id;

    const proFileData = await eventCompanyModel.findById(userId).populate("eventCompanyCategories");
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

const eventCompanyAuthController = {
  handleVerifyToken,
};

export default eventCompanyAuthController;
