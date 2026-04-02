import bcrypt from "bcrypt";
// import path from "path";
import handleCreate from "../../helpers/crudHelpers/handleCreate.js";
import handleDelete from "../../helpers/crudHelpers/Delete.js";
import handleUpdate from "../../helpers/crudHelpers/Update.js";
import adminModel from "../../models/adminModel.js";
// import handleGetWithMsg from "../../helpers/crudHelpers/GetWithMsg.js";
// import { sendError } from "../../helpers/other/Req_Res_Search_function.js";

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
  forcePathStyle: true,
});

export const generateSignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
  return signedUrl;
};

const add = async (req, res) => {

  let role = req.body.role;
  let processedRole = [];

  // if (role || !(role === "undefined")) {
  //   processedRole = JSON.parse(role);
  // }

  if (Array.isArray(role)) {
    processedRole = role;
  } else if (typeof role === "string" && role !== "undefined") {
    try {
      processedRole = JSON.parse(role); // Only if role comes as a string
    } catch (err) {
      processedRole = []; // fallback if parsing fails
    }
  }

  try {
    handleCreate(
      req,
      res,
      adminModel,
      ["role", "password"],
      {
        role: processedRole,
        password: await bcrypt.hash(
          req.body.password,
          Number.parseInt(process.env.SALT_ROUND)
        ),
      },
      ""
    );
  } catch (error) {
    return res
      .status(404)
      .json({ message: "error", detail: "something went wrong!" });
  }
};

// const get = async (req, res) => {
//   let data = await adminModel.find({ role: { $ne: "superadmin" } });
//   // handleGetWithMsg(req, res, adminModel, { role: { $ne: "superadmin" } }, null);
//   return res.status(200).json({ message: "success", data: data });
// };
const get = async (req, res) => {
  try {
    const data = await adminModel.find({ role: { $ne: 'superadmin' } });

    const updatedData = await Promise.all(
      data.map(async (admin) => {
        const adminObj = admin.toObject();
        if (adminObj.image) {
          adminObj.image = await generateSignedUrl(adminObj.image);
        }
        return adminObj;
      })
    );

    return res.status(200).json({ message: 'success', data: updatedData });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return res.status(500).json({ message: 'error', detail: 'Something went wrong!' });
  }
};

const deleteData = async (req, res) => {
  handleDelete(req, res, adminModel, { _id: req.params.itemId }, null, ["profileImage", "coverImage", "fileUrl", "thumbnailUrl", "video", "image", "bannerImage"]);
};
const updateDate = async (req, res) => {
  let role = req.body.role;
  let processedRole = [];

  if (role || !(role === "undefined")) {
    processedRole = JSON.parse(role);
  }

  let updateObj = {};

  if (req.body.password && req.body.password.length > 0) {
    const hashedPassword = await bcrypt.hash(
      req.body.password,
      Number.parseInt(process.env.SALT_ROUND)
    );
    updateObj = {
      role: processedRole,
      password: hashedPassword,
    };
  } else {
    updateObj = {
      role: processedRole,
    };
  }

  handleUpdate(req, res, adminModel, ["role", "password"], updateObj, "", {
    _id: req.params.itemId,
  });
};

const subAdminController = { add, get, deleteData, updateDate };

export default subAdminController;
