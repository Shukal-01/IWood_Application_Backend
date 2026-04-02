import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import sendEmail from "../../helpers/sendEmail/send-email.js";
import adminMiddleware from "../../middlewares/admin.middleware.js";
import adminModel from "../../models/adminModel.js";

const handleAdminLogin = async (req, res) => {
  let user = await adminModel.findOne({ email: req.body.email });
  // console.log(req.body,"request hit");
  if (user) {
    bcrypt.compare(req.body.password, user.password, function (err, result) {
      if (err) {
        // console.log("bad request");
        res.status(200).json({ message: "error", detail: "password_error" });
      } else {
        if (result) {
          let token = adminMiddleware.generateAccessToken(user);
          let userData = {
            _id: user._id,
            name: user.name,
            image: user.image,
            email: user.email,
            employeeId: user.employeeId,
            mobileNumber: user.mobileNumber,
            designation: user.designation,
            role: user.role,
          };
          // console.log(userData, "2nd request hit");
          return res.status(200).json({
            message: "success",
            data: { token: token, userData: userData },
          });
        } else {
          // console.log("bad request");
          res.status(200).json({ message: "error", detail: "password_error" });
        }
      }
    });

  } else {
    res.status(200).json({ message: "error", detail: "user_error" });
  }
};

const handleAdminPassword = async (req, res) => {
  let user = await adminModel.findOne({ email: req.body.email });
  if (user) {
    let otp = Math.floor(100000 + Math.random() * 900000) + "";
    bcrypt.hash(
      otp,
      Number.parseInt(process.env.SALT_ROUND),
      async function (err, hash) {
        if (err) {
          // console.log("bad1");s
          res.status(402).json({ message: "error", detail: "otpgenerror" });
        } else {
          let storePassword = await adminModel.findOneAndUpdate(
            { email: req.body.email },
            { passwordUpdateToken: hash }
          );
          sendEmail(
            req.body.email,
            process.env.EMAIL_TO_FROM_EMAIL,
            "Otp for password Update!",
            `Your Otp for password update is ${otp}.`,
            (value) => {
              // console.log("very good admin password");
              return res.status(200).json({ message: "success" });
            },
            (err) => {
              // console.log("bad");
              return res.status(402).json({ message: "error" });
            }
          );
        }
      }
    );
  } else {
    res.status(402).json({ message: "error", detail: "user_error" });
  }
};

const handleAdminPasswordVerify = async (req, res) => {
  let user = await adminModel.findOne({ email: req.body.email });
  if (user) {
    bcrypt.compare(
      req.body.otp,
      user.passwordUpdateToken,
      function (err, result) {
        if (err) {
          res.status(402).json({ message: "error", detail: "otp_error" });
        } else {
          if (result) {
            let token = adminMiddleware.generateAccessToken(user);
            return res.status(200).json({
              message: "success",
              data: { token: token },
            });
          } else {
            res.status(402).json({ message: "error", detail: "otp_error" });
          }
        }
      }
    );
  } else {
    res.status(402).json({ message: "error", detail: "user_error" });
  }
};

const handleAdminPasswordUpdate = async (req, res) => {
  // console.log("commint 1");
  // console.log(req.user.userData.email);
  let email = req.user.userData.email;
  let user = await adminModel.findOne({ email: email });
  if (user) {
    let password = req.body.newPassword;

    bcrypt.hash(
      password,
      Number.parseInt(process.env.SALT_ROUND),
      async function (err, hash) {
        if (err) {
          res
            .status(402)
            .json({ message: "error", detail: "password_gen_error" });
        } else {
          // Store 'hash' in your database
          // console.log("Hashed Password:", hash);s

          let updatePassword = await adminModel.findOneAndUpdate(
            { email: email },
            { password: hash }
          );
          if (updatePassword) {
            res.status(200).json({ message: "success" });
          } else {
            res
              .status(402)
              .json({ message: "error", detail: "password_update_error" });
          }
        }
      }
    );
  } else {
    res.status(402).json({ message: "error", detail: "user_error" });
  }
};

const handleVerifyToken = (req, res) => {
  let user = req.user.userData;
  let userData = {
    _id: user._id,
    name: user.name,
    image: user.image,
    email: user.email,
    employeeId: user.employeeId,
    mobileNumber: user.mobileNumber,
    designation: user.designation,
    role: user.role,
  };
  return res.status(200).json({
    message: "success",
    data: { userData: userData },
  });
};

const adminAuthController = {
  handleAdminLogin,
  handleAdminPassword,
  handleAdminPasswordVerify,
  handleAdminPasswordUpdate,
  handleVerifyToken,
};

export default adminAuthController;
