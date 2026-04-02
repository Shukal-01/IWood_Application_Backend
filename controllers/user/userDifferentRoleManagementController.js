import { response } from "express";
import handleCreateNew from "../../helpers/crudHelpers/new/handleCreateNew.js";
import {
  responseMessages,
  sendError,
  sendSuccess,
} from "../../helpers/other/Req_Res_Search_function.js";
import eventCompanyMiddleware from "../../middlewares/eventCompanyMiddleware.js";
import influencerMiddleware from "../../middlewares/influencerMiddleware.js";
import productionHouseMiddleware from "../../middlewares/productionHouseMiddleware.js";
import storeMiddleware from "../../middlewares/storeMiddleware.js";
import eventCompanyModel from "../../models/eventCompany.model.js";
import influencerModel from "../../models/influencer.model.js";
import productionHouseModel from "../../models/productionHouse.model.js";
import storeModel from "../../models/store.model.js";
import mongoose from "mongoose";
import productionHouseCrewModel from "../../models/productionhouse/productionHouseCrew.model.js";
import productionHouseCrewMiddleware from "../../middlewares/productionHouseCrewMiddleware.js";
import userMiddleware from "../../middlewares/userMiddleware.js";
import staticData from "../../data/static_data.js";

const getTokenUserData = async (currentUser, _currentUserToken) => {
  if (currentUser == staticData.userProfiles.influencer) {
    return influencerMiddleware.getUserData(_currentUserToken);
  } else if (currentUser == staticData.userProfiles.productionHouse) {
    return productionHouseMiddleware.getUserData(_currentUserToken);
  } else if (currentUser == staticData.userProfiles.store) {
    return storeMiddleware.getUserData(_currentUserToken);
  } else if (currentUser == staticData.userProfiles.eventCompany) {
    return eventCompanyMiddleware.getUserData(_currentUserToken);
  } else {
    return userMiddleware.getUserData(_currentUserToken);
  }
};

// influencer side ----------------_
const handleCheckIfUserIsInfluencer = async (req, res) => {
  try {
    const userId = req.user.userData._id;
    const isInfluencerExist = await influencerModel.findOne({ userId: userId });

    if (isInfluencerExist) {
      const token = influencerMiddleware.generateAccessToken(isInfluencerExist);
      return sendSuccess(res, 200, { token: token }, "");
    }
    return sendError(res, 200, "not_an_influencer");
  } catch (error) {
    // console.log(error.message);

    return sendError(
      res,
      200,
      "Unable to check if user is an influencer! Please try again later."
    );
  }
};

const handleCreateInfluencerAccount = async (req, res) => {
  const userId = req.user.userData._id;

  try {
    const isInfluencerExist = await influencerModel.findById(userId);
    if (isInfluencerExist) {
      return sendError(res, 200, "Influencer account already exists!");
    }

    const skipArr = [];
    const extraObj = { userId: userId };

    const { influencerCategories } = req.body;
    if (influencerCategories) {
      skipArr.push("influencerCategories");
      extraObj["influencerCategories"] = JSON.parse(influencerCategories);
    }

    const isCreated = await handleCreateNew(
      req,
      influencerModel,
      skipArr,
      extraObj,
      "",
      0
    );

    if (isCreated.message === "success") {
      return sendSuccess(
        res,
        200,
        {
          profileData: isCreated,
        },
        ""
      );
    } else {
      return sendError(res, 200, "Influencer account creation failed!");
    }
  } catch (error) {
    // console.log(error.message);

    return sendError(res, 200, "Something went wrong! Please try again later.");
  }
};

// Get Single Influencer by Influencer Id
const handleGetSingleInfluencerById = async (req, res) => {
  try {
    const { influencerId } = req.params;

    if (!influencerId) {
      return res
        .status(400)
        .json({ message: "influencerId is required in URL params." });
    }

    const influencer = await influencerModel
      .findById(influencerId)
      .populate("influencerCategories")
      .select("-followers -following");

    if (!influencer) {
      return res.status(404).json({ message: "Influencer not found." });
    }

    return res.status(200).json({
      message: "success",
      data: influencer,
    });
  } catch (error) {
    // console.error("Error in handleGetSingleInfluencerById:", error.message);
    return res.status(500).json({
      message: "error",
      detail: error.message,
    });
  }
};

// influencer side ----------------_

// production house side ----------------_
const handleCheckIfUserIsProductionHouse = async (req, res) => {
  try {
    const userId = req.user.userData._id;
    const isProductionHouseExist = await productionHouseModel.findOne({
      userId: userId,
    });

    if (isProductionHouseExist) {
      const token = productionHouseMiddleware.generateAccessToken(
        isProductionHouseExist
      );
      return sendSuccess(res, 200, { token: token }, "");
    }
    return sendError(res, 200, "not_an_production_house");
  } catch (error) {
    return sendError(
      res,
      200,
      "Unable to check if user is an influencer! Please try again later."
    );
  }
};

const handleCreateProductionHouseAccount = async (req, res) => {
  const userId = req.user.userData._id;
  // console.log("Create production house");

  try {
    // ✅ Correction 1: findOne instead of findById
    const productionHouse = await productionHouseModel.findOne({
      userId: userId,
    });
    if (productionHouse) {
      return sendError(res, 200, "Production House account already exists!");
    }

    const skipArr = [];
    const extraObj = { userId: userId };

    const { productionHouseCategories } = req.body;

    if (productionHouseCategories) {
      const productionHouseCategoryInArray = JSON.parse(
        productionHouseCategories
      );

      skipArr.push("productionHouseCategories");

      // ✅ Correction 2: Convert each ID to ObjectId
      extraObj["productionHouseCategories"] =
        productionHouseCategoryInArray.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
    }

    const response = await handleCreateNew(
      req,
      productionHouseModel,
      skipArr,
      extraObj,
      "",
      0
    );

    if (response.message === "success") {
      return sendSuccess(res, 200, "", "");
    } else {
      return sendError(res, 200, "Production House account creation failed!");
    }
  } catch (error) {
    // console.error("Error in creating production house:", error.message);
    return sendError(res, 200, "Something went wrong! Please try again later.");
  }
};

// Get Single Production House by Production House Id
const handleGetSingleProductionHouseById = async (req, res) => {
  try {
    const { productionId } = req.params;

    if (!productionId) {
      return res
        .status(400)
        .json({ message: "productionId is required in URL params." });
    }

    const productionHouse = await productionHouseModel
      .findById(productionId)
      .populate("productionHouseCategories");

    if (!productionHouse) {
      return res.status(404).json({ message: "Production House not found." });
    }

    return res.status(200).json({
      message: "success",
      data: productionHouse,
    });
  } catch (error) {
    // console.error(
    //   "Error in handle Get Single Production House By Id:",
    //   error.message
    // );
    return res.status(500).json({
      message: "error",
      detail: error.message,
    });
  }
};
// influencer side ----------------_
// store side ----------------_
const handleCheckIfUserIsStore = async (req, res) => {
  try {
    const userId = req.user.userData._id;
    const isStoreExist = await storeModel.findOne({
      userId: userId,
    });

    if (isStoreExist) {
      const token = storeMiddleware.generateAccessToken(isStoreExist);
      return sendSuccess(res, 200, { token: token }, "");
    }
    return sendError(res, 200, "not_an_store");
  } catch (error) {
    return sendError(
      res,
      200,
      "Unable to check if user is an Production House! Please try again later."
    );
  }
};

const handleCreateStoreAccount = async (req, res) => {
  const userId = req.user.userData._id;

  try {
    const storeData = await storeModel.findById(userId);
    if (storeData) {
      return sendError(res, 200, "Store account already exists!");
    }

    const skipArr = [];
    const extraObj = { userId: userId };

    const { storeCategories } = req.body;
    if (storeCategories) {
      skipArr.push("storeCategories");
      extraObj["storeCategories"] = JSON.parse(storeCategories);
    }

    const response = await handleCreateNew(
      req,
      storeModel,
      skipArr,
      extraObj,
      "",
      0
    );

    if (response.message === "success") {
      return sendSuccess(res, 200, "", "");
    } else {
      return sendError(res, 200, "Store account creation failed!");
    }
  } catch (error) {
    return sendError(res, 200, "Something went wrong! Please try again later.");
  }
};
// store ----------------_

// event company side ----------------_
const handleCheckIfUserIsEventCompany = async (req, res) => {
  try {
    const userId = req.user.userData._id;
    const isEventCompanyExists = await eventCompanyModel.findOne({
      userId: userId,
    });

    if (isEventCompanyExists) {
      const token =
        eventCompanyMiddleware.generateAccessToken(isEventCompanyExists);
      return sendSuccess(res, 200, { token: token }, "");
    }
    return sendError(res, 200, "not_an_event_company");
  } catch (error) {
    return sendError(
      res,
      200,
      "Unable to check if user is an event company! Please try again later."
    );
  }
};

const handleCreateEventCompanyAccount = async (req, res) => {
  const userId = req.user.userData._id;

  try {
    const eventCompany = await eventCompanyModel.findById(userId);
    if (eventCompany) {
      return sendError(res, 200, "event comapany account already exists!");
    }

    const skipArr = [];
    const extraObj = { userId: userId };

    const { eventCompanyCategories } = req.body;
    if (eventCompanyCategories) {
      skipArr.push("eventCompanyCategories");
      extraObj["eventCompanyCategories"] = JSON.parse(eventCompanyCategories);
    }

    const response = await handleCreateNew(
      req,
      eventCompanyModel,
      skipArr,
      extraObj,
      "",
      0
    );

    if (response.message === "success") {
      return sendSuccess(res, 200, "", "");
    } else {
      return sendError(res, 200, "Event Company account creation failed!");
    }
  } catch (error) {
    return sendError(res, 200, "Something went wrong! Please try again later.");
  }
};
// event company ----------------_

// production house crew ----------------_
const handleCheckIfUserIsProductionHouseCrew = async (req, res) => {
  try {
    // console.log("Check if user is production house crew");
    const userId = req.user.userData._id;
    const isProductionHouseCrewExists = await productionHouseCrewModel.findOne({
      userId: userId,
    });
    // console.log("isProductionHouseCrewExists", isProductionHouseCrewExists);

    if (isProductionHouseCrewExists) {
      const token = productionHouseCrewMiddleware.generateAccessToken(
        isProductionHouseCrewExists
      );
      // console.log("token", token);
      // console.log("sendSuccess");

      return sendSuccess(res, 200, { token: token }, "");
    }
    // console.log("sendError");
    return sendError(res, 200, "not_an_production_house_crew");
  } catch (error) {
    // console.log("error", error);
    return sendError(
      res,
      200,
      "Unable to check if user is an event company! Please try again later."
    );
  }
};

const handleCreateProductionHouseCrewAccount = async (req, res) => {
  const userId = req.user.userData._id;

  try {
    const productionHouseCrew = await productionHouseCrewModel.findById(userId);
    if (productionHouseCrew) {
      return sendError(
        res,
        200,
        "production house crew account already exists!"
      );
    }

    const skipArr = [];
    const extraObj = { userId: userId };

    const { productionHouseCrewCategories } = req.body;
    if (productionHouseCrewCategories) {
      skipArr.push("productionHouseCrewCategories");
      extraObj["productionHouseCrewCategories"] = JSON.parse(
        productionHouseCrewCategories
      );
    }

    const response = await handleCreateNew(
      req,
      productionHouseCrewModel,
      skipArr,
      extraObj,
      "",
      0
    );

    if (response.message === "success") {
      return sendSuccess(res, 200, "", "");
    } else {
      return sendError(
        res,
        200,
        "Production House Crew account creation failed!"
      );
    }
  } catch (error) {
    return sendError(res, 200, "Something went wrong! Please try again later.");
  }
};
// production house crew ----------------_

const userDifferentRoleManagementController = {
  getTokenUserData,
  handleCheckIfUserIsInfluencer,
  handleCreateInfluencerAccount,
  handleCheckIfUserIsProductionHouse,
  handleCreateProductionHouseAccount,
  handleCheckIfUserIsStore,
  handleCreateStoreAccount,
  handleCheckIfUserIsEventCompany,
  handleCreateEventCompanyAccount,
  handleGetSingleInfluencerById,
  handleGetSingleProductionHouseById,
  handleCheckIfUserIsProductionHouseCrew,
  handleCreateProductionHouseCrewAccount,
};

export default userDifferentRoleManagementController;
