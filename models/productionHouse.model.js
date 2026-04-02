import mongoose from "mongoose";

const productionHouseSchema = mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  productionHouseCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductionHouseCategories" }],
  portfolioLink: { type: String },
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

  likedPostsByMe: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'postuploads',
    default: []
  }],
  savedByMe: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'postuploads',
    default: []
  }],
  reviewContentWishlists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "moviereviewcontents",
      default: [],
    },
  ],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Follow' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Follow' }],
  postCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  userType: { type: String, default: 'productionHouse'},
  userFollowedByMe:            [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: [] }],
  influencerFollowedByMe:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'influencers', default: [] }],
  productionHouseFollowedByMe: [{ type: mongoose.Schema.Types.ObjectId, ref: 'productionHouses', default: [] }],
  eventCompanyFollowedByMe:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'event_companies', default: [] }],
  storeFollowedByMe:           [{ type: mongoose.Schema.Types.ObjectId, ref: 'stores', default: [] }],
});

const productionHouseModel = mongoose.model(
  "productionHouses",
  productionHouseSchema
);

export default productionHouseModel;
