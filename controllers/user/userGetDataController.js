import handleGetWithMsg from "../../helpers/crudHelpers/GetWithMsg.js";
import {
  responseMessages,
  sendError,
  sendSuccess,
} from "../../helpers/other/Req_Res_Search_function.js";
import EventCompanyCategories from "../../models/eventcompany/eventcompanycategories.model.js";
import InfluencerCategoriesModel from "../../models/influencers/influencercategories.model.js";
import ProductionHouseCategories from "../../models/productionhouse/productionhousecategories.model.js";
import InfluencerModel from "../../models/influencer.model.js";
import productionHouseModel from "../../models/productionHouse.model.js";
import eventCompanyModel from "../../models/eventCompany.model.js";
import storeModel from "../../models/store.model.js";
import StoreCategories from "../../models/store/storecategories.model.js";
import movieGenresModel from "../../models/productionhouse/movieGenres.model.js";
import productionHouseCrewCategoriesModel from "../../models/productionhouse/productionHouseCrewCategories.model.js";
import movieCastingCategoriesModel from "../../models/productionhouse/movieCastingCategories.model.js";
import productionHouseCrewModel from "../../models/productionhouse/productionHouseCrew.model.js";
import productionHouseContentTypesModel from "../../models/productionhouse/productionHouseContentTypes.model.js";
import MovieReviewContentModel from "../../models/productionhouse/movieReviewContent.model.js";
import InfluencerSubCategoriesModel from "../../models/influencers/influencersubcategories.model.js";

const userModels = {
  influencer: InfluencerModel,
  eventCompany: eventCompanyModel,
  productionHouse: productionHouseModel,
  store: storeModel,
};

const handleSearchUsers = async (req, res) => {
  try {
    const { userType, username } = req.query;
    if (!userType || !username) {
      return sendError(res, responseMessages.error.common, {
        detail: "Both userType and username query params are required.",
      });
    }

    const Model = userModels[userType];
    if (!Model) {
      return sendError(res, responseMessages.error.invalidParams, {
        detail: `userType must be one of: ${Object.keys(userModels).join(
          ", "
        )}`,
      });
    }
    
    // build per-word regex search
    const terms = username
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    const nameQuery = {
      $and: terms.map((t) => ({ name: { $regex: t, $options: "i" } })),
    };

    const users = await Model.find(nameQuery)
      .sort({ createdAt: -1 })
      .limit(6)
      .select("userId name profileImage")
      .lean();
    
    if (users.length > 0) {
      return sendSuccess(res, 200, { users }, "success");
    } else {
      // no users found for that search
      return sendError(res, 200, `No users found matching "${username}"`);
    }
  } catch (err) {
    console.error("Error in handleSearchUsers:", err);
    return sendError(res, responseMessages.error.common);
  }
};

const handleSearchProductionHouseCrews = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return sendError(res, responseMessages.error.common, {
        detail: "Name query params are required.",
      });
    }

    // build per-word regex search
    const terms = username
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    const nameQuery = {
      $and: terms.map((t) => ({ name: { $regex: t, $options: "i" } })),
    };

    const users = await productionHouseCrewModel
      .find(nameQuery)
      .sort({ createdAt: -1 })
      .limit(6)
      .select("userId name profileImage")
      .lean();

    if (users.length > 0) {
      return sendSuccess(res, 200, { users }, "success");
    } else {
      // no users found for that search
      return sendError(res, 200, `No users found matching "${username}"`);
    }
  } catch (err) {
    console.error("Error in handleSearchUsers:", err);
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetInfluencerCategories = async (req, res) => {
  try {
    handleGetWithMsg(req, res, InfluencerCategoriesModel, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetInfluencerSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    if (!categoryId) {
      return res.status(400).json({ 
        message: "error", 
        detail: "categoryId is required in URL params." 
      });
    }
    
    const findQuery = { categoryId: categoryId, status: "1" };
    const subcategories = await InfluencerSubCategoriesModel.find(findQuery).sort({ name: 1 });
    
    return sendSuccess(res, 200, subcategories, "Subcategories fetched successfully");
  } catch (error) {
    console.error("Error in handleGetInfluencerSubCategories:", error.message);
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetProductionHoueCategories = async (req, res) => {
  try {
    handleGetWithMsg(req, res, ProductionHouseCategories, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetProductionHoueCrewCategories = async (req, res) => {
  try {
    handleGetWithMsg(req, res, productionHouseCrewCategoriesModel, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetMoviewCastingCategories = async (req, res) => {
  try {
    handleGetWithMsg(req, res, movieCastingCategoriesModel, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetMovieGenres = async (req, res) => {
  try {
    handleGetWithMsg(req, res, movieGenresModel, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetProductionHouseContentTypes = async (req, res) => {
  try {
    handleGetWithMsg(req, res, productionHouseContentTypesModel, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetInfluencersByInfluencerCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res
        .status(400)
        .json({ message: "categoryId is required in URL params." });
    }

    const findQuery = { influencerCategories: categoryId }; // ❗ keep categoryId as string

    // Fetch the latest 6 influencers by category
    const influencers = await InfluencerModel.find(findQuery)
      .sort({ createdAt: -1 })
      .limit(6);

    // Concatenate the result 5 times
    // const concatenatedInfluencers = [].concat(...Array(5).fill(influencers));

    return res.status(200).json({
      message: "success",
      data: influencers,
    });
  } catch (error) {
    console.error("Error in handleGetInfluencersByCategory:", error.message);
    return res.status(500).json({
      message: "error",
      detail: error.message,
    });
  }
};

const handleGetStoreCategories = async (req, res) => {
  try {
    handleGetWithMsg(req, res, StoreCategories, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};
const handleGetReviewContents = async (req, res) => {
  try {
    const contents = await MovieReviewContentModel.find()
      .populate("productionHouseId")
      .populate("contentTypes")
      .populate("genres")
      .populate({
        path: "crews.crewId",
        model: "productionhousecrews",
      })
      .populate({
        path: "crews.crewCategories",
        model: "productionhousecrewcategories",
      })
      .populate({
        path: "castings.influencerId",
        model: "influencers",
      })
      .populate({
        path: "castings.castingCategories",
        model: "moviecastingcategories",
      })
      .lean();

    

    res
      .status(200)
      .json({
        message: "success",
        data: [
          ...contents,
          ...contents,
          ...contents,
          ...contents,
          ...contents,
          ...contents,
        ],
      });
  } catch (err) {
    console.error("Error fetching movie review contents:", err);
    res.status(500).json({ message: "error", detail: "Internal server error" });
  }
};

const handleGetReviewContentById = async (req, res) => {
  try {
    const { contentId } = req.params;
    const contents = await MovieReviewContentModel.findById(contentId)
      .populate("productionHouseId")
      .populate("contentTypes")
      .populate("genres")
      .populate({
        path: "crews.crewId",
        model: "productionhousecrews",
      })
      .populate({
        path: "crews.crewCategories",
        model: "productionhousecrewcategories",
      })
      .populate({
        path: "castings.influencerId",
        model: "influencers",
      })
      .populate({
        path: "castings.castingCategories",
        model: "moviecastingcategories",
      })
      .lean(); 
    res.status(200).json({ message: "success", data: contents });
  } catch (err) {
    console.error("Error fetching movie review contents:", err);
    res.status(500).json({ message: "error", detail: "Internal server error" });
  }
};

const handleGetEventCompanyCategories = async (req, res) => {
  try {
    handleGetWithMsg(req, res, EventCompanyCategories, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetProductionHousesByProductionHouseCategoryId = async (
  req,
  res
) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res
        .status(400)
        .json({ message: "categoryId is required in URL params." });
    }

    const findQuery = { productionHouseCategories: categoryId }; // Important: categoryId is stored as ObjectId in array

    // Fetch the latest 6 production houses by category
    const productionHouses = await productionHouseModel
      .find(findQuery)
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("productionHouseCategories"); // If you want populated category data too, else remove

    // Concatenate 5 times
    // const concatenatedProductionHouses = [].concat(...Array(5).fill(productionHouses));

    return res.status(200).json({
      message: "success",
      data: productionHouses,
    });
  } catch (error) {
    console.error(
      "Error in handleGetProductionHousesByCategory:",
      error.message
    );
    return res.status(500).json({
      message: "error",
      detail: error.message,
    });
  }
};

const handleGetProductionHousesContentByProductionHouseId = async (
  req,
  res
) => {
  try {
    const { productionHouseId } = req.params;

    if (!productionHouseId) {
      return res
        .status(400)
        .json({ message: "productionHouseId is required in URL params." });
    }

    const findQuery = { productionHouseId: productionHouseId }; // Important: productionHouseId is stored as ObjectId in array

    // Fetch the latest 6 production houses by category
    const productionHousesContents = await MovieReviewContentModel.find(
      findQuery
    )
      .sort({ createdAt: -1 })
      .limit(6);

    // console.log('productionHousesContents',productionHousesContents);

    // .populate("productionHouseCategories"); // If you want populated category data too, else remove

    // Concatenate 5 times
    // const concatenatedProductionHouses = [].concat(...Array(5).fill(productionHouses));

    return res.status(200).json({
      message: "success",
      data: productionHousesContents,
    });
  } catch (error) {
    console.error(
      "Error in handleGetProductionHousesByCategory:",
      error.message
    );
    return res.status(500).json({
      message: "error",
      detail: error.message,
    });
  }
};

const userGetDataController = {
  handleGetInfluencerCategories,
  handleGetProductionHoueCategories,
  handleGetMovieGenres,
  handleGetInfluencersByInfluencerCategory,
  handleGetStoreCategories,
  handleGetEventCompanyCategories,
  handleGetProductionHousesByProductionHouseCategoryId,
  handleSearchUsers,
  handleGetProductionHoueCrewCategories,
  handleGetMoviewCastingCategories,
  handleSearchProductionHouseCrews,
  handleGetProductionHouseContentTypes,
  handleGetProductionHousesContentByProductionHouseId,
  handleGetReviewContents,
  handleGetReviewContentById,
  handleGetInfluencerSubCategories,
};

export default userGetDataController;
