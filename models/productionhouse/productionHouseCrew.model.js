// models/influencer.model.js
import mongoose from "mongoose";

const productionHouseCrewSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  productionHouseCrewCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productionhousecrewcategories",
    },
  ],
  portfolioLink: { type: String },
  profileImage: { type: String },
  coverImage: { type: String },
  youtube: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  xPlatform: { type: String },
  linkedin: { type: String },
  email: { type: String },
  phone: { type: Number },
  watsappNumber: { type: Number },
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive", "pending", "rejected", "blocked"],
  },
  // likedPostsByMe: [
  //   { type: mongoose.Schema.Types.ObjectId, ref: "postuploads", default: [] },
  // ],
  // savedByMe: [
  //   { type: mongoose.Schema.Types.ObjectId, ref: "postuploads", default: [] },
  // ],
  // postCount: { type: Number, default: 0 },

  // // followers/following tracking
  // followersCount: { type: Number, default: 0 },
  // followingCount: { type: Number, default: 0 },
  // followers: [
  //   { type: mongoose.Schema.Types.ObjectId, ref: "Follow", default: [] },
  // ],
  // following: [
  //   { type: mongoose.Schema.Types.ObjectId, ref: "Follow", default: [] },
  // ],

  // // per-type quick-lookup arrays
  // userFollowedByMe: [
  //   { type: mongoose.Schema.Types.ObjectId, ref: "users", default: [] },
  // ],
  // influencerFollowedByMe: [
  //   { type: mongoose.Schema.Types.ObjectId, ref: "influencers", default: [] },
  // ],
  // productionHouseFollowedByMe: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "productionHouses",
  //     default: [],
  //   },
  // ],
  // eventCompanyFollowedByMe: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "event_companies",
  //     default: [],
  //   },
  // ],
  // storeFollowedByMe: [
  //   { type: mongoose.Schema.Types.ObjectId, ref: "stores", default: [] },
  // ],
});

const productionHouseCrewModel = mongoose.model(
  "productionhousecrews",
  productionHouseCrewSchema
);
export default productionHouseCrewModel;
