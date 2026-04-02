import bcrypt from "bcrypt";
// import path from "path";
import handleCreate from "../../helpers/crudHelpers/handleCreate.js";
import handleDelete from "../../helpers/crudHelpers/Delete.js";
import handleUpdate from "../../helpers/crudHelpers/Update.js";
import superAdminModel from "../../models/superAdminModel.js";
// import { sendError } from "../../helpers/other/Req_Res_Search_function.js";

const add = async (req, res) => {

  let role = req.body.role;
  let processedRole = [];

  if (role || !(role === "undefined")) {
    processedRole = JSON.parse(role);
  }

  try {
    handleCreate(
      req,
      res,
      superAdminModel,
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

const get = async (req, res) => {
  let data = await superAdminModel.find({ role: { $ne: "superadmin" } });
  return res.status(200).json({ message: "success", data: data });
};

const deleteData = async (req, res) => {
  handleDelete(req, res, superAdminModel, { _id: req.params.itemId });
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

  handleUpdate(req, res, superAdminModel, ["role", "password"], updateObj, "", {
    _id: req.params.itemId,
  });
};

const superAdminController = { add, get, deleteData, updateDate };

export default superAdminController;
