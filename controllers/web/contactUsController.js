import {
  sendSuccess,
  sendErrors,
  responseMessages,
} from "../../helpers/other/Req_Res_Search_function.js";
import handleCreate from "../../helpers/crudHelpers/handleCreate.js";
import handleGetWithMsg from "../../helpers/crudHelpers/GetWithMsg.js";
import handleDelete from "../../helpers/crudHelpers/Delete.js";
import handleUpdate from "../../helpers/crudHelpers/Update.js";
import contactUsModel from "../../models/web/contactUsModel.js";

// ======================================= CRUD -----------------------------------

const add = async (req, res) => {
  try {
    // const onSuccess = (data) => {
    //   return sendSuccess(
    //     res,
    //     responseMessages.success.create,
    //     data,
    //     "Successfully added"
    //   );
    // };

    await handleCreate(req, res, contactUsModel, [], {}, "");
  } catch (error) {
    const statusCode =
      error.statusCode || error.status || responseMessages.error.common;
    return sendErrors(res, statusCode, error.message);
  }
};

const get = async (req, res) => {
  try {
    const onSuccess = (data, pagination = null) => {
      if (!data || data.length === 0) {
        return sendSuccess(
          res,
          responseMessages.success.noContent,
          [],
          "No data found",
          pagination
        );
      }
      return sendSuccess(
        res,
        responseMessages.success.fetch,
        data,
        "Fetched successfully",
        pagination
      );
    };

    // Call handleGetWithMsg with pagination included
    await handleGetWithMsg(req, res, contactUsModel, {}, onSuccess);
  } catch (error) {
    const statusCode =
      error.statusCode || error.status || responseMessages.error.common;
    return sendErrors(res, statusCode, error.message);
  }
};

const deleteData = async (req, res) => {
  try {
    const onSuccess = (deletedDoc) => {
      return sendSuccess(
        res,
        responseMessages.success.common,
        deletedDoc,
        "Successfully deleted"
      );
    };

    await handleDelete(
      req,
      res,
      contactUsModel,
      { _id: req.params.itemId },
      onSuccess
    );
  } catch (error) {
    const statusCode =
      error.statusCode || error.status || responseMessages.error.common;
    return sendErrors(res, statusCode, error.message);
  }
};

const updateData = async (req, res) => {
  try {
    const onSuccess = (updatedDoc) => {
      return sendSuccess(
        res,
        responseMessages.success.common,
        updatedDoc,
        "Successfully updated"
      );
    };

    await handleUpdate(
      req,
      res,
      contactUsModel,
      [],
      {},
      "",
      { _id: req.params.itemId },
      onSuccess
    );
  } catch (error) {
    const statusCode =
      error.statusCode || error.status || responseMessages.error.common;
    return sendErrors(res, statusCode, error.message);
  }
};

// ======================================= CRUD -----------------------------------

const contactUsController = {
  add,
  get,
  deleteData,
  updateData,
};

export default contactUsController;
