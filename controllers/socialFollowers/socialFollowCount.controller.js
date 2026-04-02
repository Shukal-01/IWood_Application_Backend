import influencerModel from "../../models/influencer.model.js";
import productionHouseModel from "../../models/productionHouse.model.js";
import storeModel from "../../models/store.model.js";
import userModel from "../../models/users.model.js";
import eventCompanyModel from "../../models/eventCompany.model.js";
import {
  fetchInstagram,
  fetchX,
  fetchYouTube,
} from "./socialFollower.controller.js";
import mongoose from "mongoose";
import { responseMessages, sendSuccess } from "../../helpers/other/Req_Res_Search_function.js";

export async function getAllFollowerCounts(userType, id) {
  // 1. Select the right model
  const modelMap = {
    influencer:      influencerModel,
    eventCompany:    eventCompanyModel,
    productionHouse: productionHouseModel,
    store:           storeModel,
    user:            userModel,
  };
  const Model = modelMap[userType];
  if (!Model) {
    throw new Error(`Unknown userType: ${userType}`);
  }

  // 2. Validate and fetch the document by its _id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid _id format: ${id}`);
  }
  const doc = await Model.findById(id).lean();
  if (!doc) {
    throw new Error(`${userType} with _id ${id} not found`);
  }

  // 3. Prepare the result container
  const result = {
    instagram: { count: 0, verified: false },
    xPlatform: { count: 0, verified: false },
    youtube:   { count: 0, verified: false },
  };

  // 4. Fetch each platform if a handle is present
  if (doc.instagram) {
    try {
      const { count } = await fetchInstagram(doc.instagram);
      result.instagram = { count, verified: true };
    } catch (e) {
      console.warn(`Instagram fetch error for ${doc.instagram}:`, e.message);
    }
  }

  if (doc.xPlatform) {
    try {
      const { count } = await fetchX(doc.xPlatform);
      result.xPlatform = { count, verified: true };
    } catch (e) {
      console.warn(`X fetch error for ${doc.xPlatform}:`, e.message);
    }
  }

  if (doc.youtube) {
    try {
      const { count } = await fetchYouTube(doc.youtube);
      result.youtube = { count, verified: true };
    } catch (e) {
      console.warn(`YouTube fetch error for ${doc.youtube}:`, e.message);
    }
  }
    
  return result;
}
