import handleDelete from "../../../helpers/crudHelpers/Delete.js";
import handleGet from "../../../helpers/crudHelpers/Get.js";
import handleCreate from "../../../helpers/crudHelpers/handleCreate.js";
import handleUpdate from "../../../helpers/crudHelpers/Update.js";
import { sendError } from "../../../helpers/other/Req_Res_Search_function.js";
import storePostCategoriesModel from "../../../models/postCategories/storePostCategories.model.js";
// ======================================= crud -----------------------------------

const add = async (req, res) => {
  try {
    handleCreate(req, res, storePostCategoriesModel, [], {}, "");
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const get = async (req, res) => {
  try {
    handleGet(req, res, storePostCategoriesModel, {});
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const deleteData = async (req, res) => {
  try {
    handleDelete(req, res, storePostCategoriesModel, {
      _id: req.params.itemId,
    });
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const updateDate = async (req, res) => {
  try {
    handleUpdate(req, res, storePostCategoriesModel, [], {}, "", {
      _id: req.params.itemId,
    });
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

// ======================================= crud -----------------------------------

const storePostCategoriesController = { add, get, deleteData, updateDate };

export default storePostCategoriesController;
