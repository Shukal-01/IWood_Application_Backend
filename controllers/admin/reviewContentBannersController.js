import handleDelete from "../../helpers/crudHelpers/Delete.js";
import handleGet from "../../helpers/crudHelpers/Get.js";
import handleCreate from "../../helpers/crudHelpers/handleCreate.js";
import handleUpdate from "../../helpers/crudHelpers/Update.js";
import { sendError } from "../../helpers/other/Req_Res_Search_function.js";
import reviewContentBannersModel from "../../models/reviewContentDisplay/reviewContentBanners.model.js";
// ======================================= crud -----------------------------------

const add = async (req, res) => {
  try {
    handleCreate(req, res, reviewContentBannersModel, [], {}, "");
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const get = async (req, res) => {
  try {
    handleGet(req, res, reviewContentBannersModel, {}, [
      {
        path: "internalContentId",
        select: "name",
      },
    ], ["bannerImage"]);
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const deleteData = async (req, res) => {
  try {
    handleDelete(req, res, reviewContentBannersModel, {
      _id: req.params.itemId,
    }, null, ["bannerImage"]);
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const updateDate = async (req, res) => {
  try {
    handleUpdate(req, res, reviewContentBannersModel, [], {}, "", {
      _id: req.params.itemId,
    });
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

// ======================================= crud -----------------------------------

const reviewContentBannersController = {
  add,
  get,
  deleteData,
  updateDate,
};

export default reviewContentBannersController;
