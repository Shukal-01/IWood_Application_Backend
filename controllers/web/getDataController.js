import handleGetWithMsg from "../../helpers/crudHelpers/GetWithMsg.js";
import {
  responseMessages,
  sendError,
} from "../../helpers/other/Req_Res_Search_function.js";
import EventCompanyCategories from "../../models/eventcompany/eventcompanycategories.model.js";
import InfluencerCategoriesModel from "../../models/influencers/influencercategories.model.js";
import ProductionHouseCategories from "../../models/productionhouse/productionhousecategories.model.js";
import StoreCategories from "../../models/store/storecategories.model.js";

const handleGetAllInfluencerCategories = async (req, res) => {
  try {
    handleGetWithMsg(req, res, InfluencerCategoriesModel, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetAllProductionHouseCategories = async (req, res) => {
  try {
    handleGetWithMsg(req, res, ProductionHouseCategories, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetAllStoreCategories = async (req, res) => {
  try {
    handleGetWithMsg(req, res, StoreCategories, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const handleGetAllEventCompaniesCategories = async (req, res) => {
  try {
    handleGetWithMsg(req, res, EventCompanyCategories, {});
  } catch (error) {
    return sendError(res, responseMessages.error.common);
  }
};

const webGetData = {
  handleGetAllInfluencerCategories,
  handleGetAllProductionHouseCategories,
  handleGetAllStoreCategories,
  handleGetAllEventCompaniesCategories,
};

export default webGetData;
