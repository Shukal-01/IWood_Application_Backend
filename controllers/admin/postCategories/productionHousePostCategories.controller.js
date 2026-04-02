
 
import handleDelete from "../../../helpers/crudHelpers/Delete.js";
import handleGet from "../../../helpers/crudHelpers/Get.js";
import handleCreate from "../../../helpers/crudHelpers/handleCreate.js";
import handleUpdate from "../../../helpers/crudHelpers/Update.js";
import { sendError } from "../../../helpers/other/Req_Res_Search_function.js"; 
import productionHousePostCategoriesModel from "../../../models/postCategories/productionHousePostCategories.model.js";
// ======================================= crud -----------------------------------

const add = async (req, res) => {
  try {
    handleCreate(req, res, productionHousePostCategoriesModel, [], {}, "");
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const get = async (req, res) => {
  try {
    handleGet(req, res, productionHousePostCategoriesModel, {});
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const deleteData = async (req, res) => {
  try {
    handleDelete(req, res, productionHousePostCategoriesModel, { _id: req.params.itemId });
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const updateDate = async (req, res) => {
  try {
    handleUpdate(req, res, productionHousePostCategoriesModel, [], {}, "", {
      _id: req.params.itemId,
    });
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

// ======================================= crud -----------------------------------

const productionHousePostCategoriesController = { add, get, deleteData, updateDate };

export default productionHousePostCategoriesController;
