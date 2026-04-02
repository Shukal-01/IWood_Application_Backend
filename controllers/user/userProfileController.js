import {
  sendSuccess,
  sendErrors,
  responseMessages,
} from "../../helpers/other/Req_Res_Search_function.js";
import handleUpdateNew from "../../helpers/crudHelpers/new/UpdateNew2.js";
import userModel from "../../models/users.model.js";

const updateUserData = async (req, res) => {
  // console.log(req.body);
  try {
    const user = req.user.userData;

    const skipArr = [];
    const extraObj = {};

    const isUpdated = await handleUpdateNew(
      req,
      userModel,
      skipArr,
      extraObj,
      "",
      { _id: user._id }
    );

    if (isUpdated.message === "success") {
      const profileData = await userModel.findById(user._id);
      return sendSuccess(
        res,
        responseMessages.success.common,
        { profileData },
        "Successfully updated"
      );
    } else {
      return sendErrors(res, responseMessages.error.common);
    }
  } catch (error) {
    const statusCode =
      error.statusCode || error.status || responseMessages.error.common;
    return sendErrors(res, statusCode, error.message);
  }
};

const exportUserData = { updateUserData };
export default exportUserData;
