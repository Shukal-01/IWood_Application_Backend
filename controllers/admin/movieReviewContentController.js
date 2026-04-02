import handleDelete from "../../helpers/crudHelpers/Delete.js";
import handleGet from "../../helpers/crudHelpers/Get.js";
import handleCreate from "../../helpers/crudHelpers/handleCreate.js";
import handleUpdate from "../../helpers/crudHelpers/Update.js";
import { sendError, sendSuccess } from "../../helpers/other/Req_Res_Search_function.js";
import MovieReviewContentModel from "../../models/productionhouse/movieReviewContent.model.js";

// ======================================= crud -----------------------------------

const add = async (req, res) => {
  try {
    handleCreate(req, res, MovieReviewContentModel, [], {}, "");
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const get = async (req, res) => {
  try {
    handleGet(req, res, MovieReviewContentModel, {});
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const getById = async (req, res) => {
  try {
    const contentId = req.params.id;
    if (!contentId) {
      return sendError(res, 400, "Content ID is required");
    }

    const content = await MovieReviewContentModel.findById(contentId);
    if (!content) {
      return sendError(res, 404, "Content not found");
    }

    return sendSuccess(res, 200, content, "success");
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const deleteData = async (req, res) => {
  try {
    handleDelete(req, res, MovieReviewContentModel, {
      _id: req.params.itemId,
    });
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

const updateDate = async (req, res) => {
  try {
    handleUpdate(req, res, MovieReviewContentModel, [], {}, "", {
      _id: req.params.itemId,
    });
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

// Search for movie review content by name
const search = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return sendError(res, 400, "Search query must be at least 2 characters");
    }

    // Clean and split the query into terms
    const terms = query
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    // Create the name query using regex for case-insensitive partial matches
    const nameQuery = {
      $and: terms.map((t) => ({ name: { $regex: t, $options: "i" } })),
    };

    // Find matching movie review content
    const contents = await MovieReviewContentModel.find(nameQuery)
      .sort({ name: 1 })
      .limit(10)
      .select("_id name description bannerImage")
      .lean();

    if (contents.length > 0) {
      return sendSuccess(res, 200, contents, "success");
    } else {
      return sendSuccess(res, 200, [], "No content found matching the search query");
    }
  } catch (error) {
    console.error("Error in search function:", error);
    return sendError(res, 500, error.message || "Internal server error");
  }
};

// ======================================= crud -----------------------------------

const movieReviewContentController = {
  add,
  get,
  getById,
  deleteData,
  updateDate,
  search,
};

export default movieReviewContentController; 