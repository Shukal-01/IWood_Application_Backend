import mongoose from "mongoose";
// Import model instances to grab their schemas for alias registration
import influencerModel from "./influencer.model.js";
import productionHouseModel from "./productionHouse.model.js";
import eventCompanyModel from "./eventCompany.model.js";
import storeModel from "./store.model.js";
import userModel from "./users.model.js";

// Register singular model names as aliases for existing schemas
mongoose.model("influencer", influencerModel.schema);
mongoose.model("productionHouse", productionHouseModel.schema);
mongoose.model("eventCompany", eventCompanyModel.schema);
mongoose.model("store", storeModel.schema);
mongoose.model("user", userModel.schema);

// Define the post upload schema
const postUploadSchema = new mongoose.Schema({
  postType: { type: String, enum: ["all", "post", "reel"], default: "all" },

  // userType must match the singular model names for refPath
  userType: {
    type: String,
    enum: ["user", "influencer", "productionHouse", "eventCompany", "store"],
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "userType",
    required: true,
  },

  postUserCategories: { type: [String], default: [] },

  // Post-related fields
  fileUrl:      { type: String, required: true },
  fileAspectRatio: { type: Number, default: 1 },
  thumbnailUrl: { type: String },
  fileType:     { type: String, enum: ["chunk", "full"] },
  type:         { type: String, enum: ["image", "video"], required: true },
  postTitle:    { type: String },

  status:       { type: String, enum: ["hidden", "active"], default: "active" },
}, { timestamps: true });

postUploadSchema.add({
  likesCount: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  hashTags: { type: [String], default: [] },
  caption: { type: String, default: "" },
});

// Compile & export the post uploads model
const PostUpload = mongoose.model("postuploads", postUploadSchema);
export default PostUpload;
