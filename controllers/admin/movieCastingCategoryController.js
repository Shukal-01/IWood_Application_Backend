import handleDelete from "../../helpers/crudHelpers/Delete.js";
import handleGet from "../../helpers/crudHelpers/Get.js";
import handleCreate from "../../helpers/crudHelpers/handleCreate.js";
import handleUpdate from "../../helpers/crudHelpers/Update.js";
import { sendError } from "../../helpers/other/Req_Res_Search_function.js";
import movieCastingCategoriesModel from "../../models/productionhouse/movieCastingCategories.model.js";
// ======================================= crud -----------------------------------

const add = async (req, res) => {
  try {
    handleCreate(req, res, movieCastingCategoriesModel, [], {}, "");
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const get = async (req, res) => {
  try {
    handleGet(req, res, movieCastingCategoriesModel, {});
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const deleteData = async (req, res) => {
  try {
    handleDelete(req, res, movieCastingCategoriesModel, {
      _id: req.params.itemId,
    });
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const updateDate = async (req, res) => {
  try {
    handleUpdate(req, res, movieCastingCategoriesModel, [], {}, "", {
      _id: req.params.itemId,
    });
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

// ======================================= crud -----------------------------------

const movieCastingCategoryController = {
  add,
  get,
  deleteData,
  updateDate,
};

export default movieCastingCategoryController;
