import {
  sendError,
  sendSuccess,
} from "../../helpers/other/Req_Res_Search_function.js";
import {
  storeOTP,
  validateOTP,
} from "../../helpers/rememberOtp/LoginOtpsHander.js";
import SendOtp from "../../helpers/sendOtp/fast2smsOtp.js";
import generateOTP from "../../helpers/sendOtp/otpGenerator.js";
import userMiddleware from "../../middlewares/userMiddleware.js";
import userModel from "../../models/users.model.js";

const handleSendLoginOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const otp = generateOTP();
    const response = await SendOtp(mobileNumber, otp);
    // const response = "success";
    // console.log(otp);

    if (response === "success") {
      await storeOTP(mobileNumber, otp);
      return sendSuccess(res, 200, {}, "");
    }

    return sendError(res, 200, "Something went wrong!");
  } catch (error) {
    // console.log(error.message);

    return sendError(res, 200, "Something went wrong!");
  }
};

const handleVerifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    const isValiidated = await validateOTP(mobileNumber, otp);

    if (isValiidated) {
      let thisUser;

      const isExist = await userModel.findOne({ mobileNumber: mobileNumber });
      if (isExist) {
        thisUser = isExist;
      } else {
        const newUser = await userModel.create({ mobileNumber: mobileNumber });
        thisUser = newUser;
      }

      if (!thisUser) {
        return sendError(res, 200, "Something went wrong! Please try again.");
      }

      const token = await userMiddleware.generateAccessToken(thisUser);
      return sendSuccess(res, 200, { token: token }, "");
    } else {
      return sendError(res, 200, "Invalid Otp!");
    }
  } catch (error) {
    // console.log(error.message);

    return sendError(res, 200, "Something went wrong! Please try again.");
  }
};

const handleVerifyToken = async (req, res) => {
  let user = req.user.userData;

  const userId = req.user.userData._id;
  const proFileData = await userModel.findOne({ _id: userId });
  if (proFileData) {
    return sendSuccess(res, 200, { userData: proFileData }, "");
  } else {
    return sendError(res, 200, "Invalid Request!");
  }
};

const userAuthController = {
  handleSendLoginOtp,
  handleVerifyOtp,
  handleVerifyToken,
};

export default userAuthController;
