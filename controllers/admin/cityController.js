import handleDelete from "../../helpers/crudHelpers/Delete.js";
import handleGet from "../../helpers/crudHelpers/Get.js";
import handleCreate from "../../helpers/crudHelpers/handleCreate.js";
import handleUpdate from "../../helpers/crudHelpers/Update.js";
import { sendError } from "../../helpers/other/Req_Res_Search_function.js";
import cityModel from "../../models/location/city.model.js";


// ======================================= crud -----------------------------------

const add = async (req, res) => {
    try {
        handleCreate(req, res, cityModel, [], {}, "")
    } catch (error) {
        return sendError(res, 404, error.message)
    }
}

const get = async (req, res) => {
    try {
        handleGet(req, res, cityModel, {})
    } catch (error) {
        return sendError(res, 404, error.message)
    }
}

const deleteData = async (req, res) => {
    try {
        handleDelete(req, res, cityModel, { _id: req.params.itemId })
    } catch (error) {
        return sendError(res, 404, error.message)
    }
}

const updateDate = async (req, res) => {
    try {

        handleUpdate(req, res, cityModel, [], {}, "", {
            _id: req.params.itemId,
        })
    } catch (error) {
        return sendError(res, 404, error.message)
    }
}

// ======================================= crud -----------------------------------


const cityController = { add, get, deleteData, updateDate }

export default cityController;

