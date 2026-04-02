import contactUsModel from "../../models/web/contactUsModel.js";
import handleDelete from "../../helpers/crudHelpers/Delete.js";
import handleUpdate from "../../helpers/crudHelpers/Update.js";
import {
  responseMessages,
  sendError,
  sendSuccess,
} from "../../helpers/other/Req_Res_Search_function.js";

// Get all contact us records
const get = async (req, res) => {
  try {
    const data = await contactUsModel.find({}).sort({ created: -1 });
    return sendSuccess(res, responseMessages.success.common, data);
  } catch (error) {
    console.error("Error in contactUsController.get:", error);
    return sendError(
      res,
      responseMessages.error.serverError,
      "Failed to retrieve contact us records"
    );
  }
};

// Get a single contact us record by ID
const getById = async (req, res) => {
  try {
    const data = await contactUsModel.findById(req.params.id);
    if (!data) {
      return sendError(
        res,
        responseMessages.error.notFound,
        "Contact us record not found"
      );
    }
    return sendSuccess(res, responseMessages.success.common, data);
  } catch (error) {
    console.error("Error in contactUsController.getById:", error);
    return sendError(
      res,
      responseMessages.error.serverError,
      "Failed to retrieve contact us record"
    );
  }
};

// Delete a contact us record
const deleteData = async (req, res) => {
  try {
    return await handleDelete(req, res, contactUsModel);
  } catch (error) {
    console.error("Error in contactUsController.deleteData:", error);
    return sendError(
      res,
      responseMessages.error.serverError,
      "Failed to delete contact us record"
    );
  }
};

// Update a contact us record
const updateDate = async (req, res) => {
  try {
    return await handleUpdate(req, res, contactUsModel);
  } catch (error) {
    console.error("Error in contactUsController.updateDate:", error);
    return sendError(
      res,
      responseMessages.error.serverError,
      "Failed to update contact us record"
    );
  }
};

const contactUsController = { get, getById, deleteData, updateDate };

export default contactUsController;
