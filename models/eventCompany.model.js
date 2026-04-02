import mongoose from "mongoose";

const eventCompanySchema = mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  eventCompanyCategories: { type: [String] },
  portfolioLink: { type: String }, // also called as website link
  // images
  profileImage: { type: String },
  coverImage: { type: String },
  // social linkes---
  youtube: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  xPlatform: { type: String },
  linkedin: { type: String },
  //---
  // contact info---
  email: { type: String },
  phone: { type: Number },
  watsappNumber: { type: Number },
  //---
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive", "pending", "rejected", "blocked"],
  },
  reviewLikesByMe: [
  { type: mongoose.Schema.Types.ObjectId, ref: "movieReviewContentReview", default: [] }
],
reviewDislikesByMe: [
  { type: mongoose.Schema.Types.ObjectId, ref: "movieReviewContentReview", default: [] }
],

  likedPostsByMe: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "postuploads",
      default: [],
    },
  ],
  savedByMe: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "postuploads",
      default: [],
    },
  ],
  reviewContentWishlists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "moviereviewcontents",
      default: [],
    },
  ],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Follow" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Follow" }],
  postCount: { type: Number, default: 0 },
  userType: { type: String, default: "eventCompany" },
  userFollowedByMe: [
    { type: mongoose.Schema.Types.ObjectId, ref: "users", default: [] },
  ],
  influencerFollowedByMe: [
    { type: mongoose.Schema.Types.ObjectId, ref: "influencers", default: [] },
  ],
  productionHouseFollowedByMe: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productionHouses",
      default: [],
    },
  ],
  eventCompanyFollowedByMe: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event_companies",
      default: [],
    },
  ],
  storeFollowedByMe: [
    { type: mongoose.Schema.Types.ObjectId, ref: "stores", default: [] },
  ],
});

const eventCompanyModel = mongoose.model("event_companies", eventCompanySchema);

export default eventCompanyModel;
