// models/influencer.model.js
import mongoose from "mongoose";

const influencerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  influencerCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InfluencerCategories",
    },
  ],
  influencerSubCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InfluencerSubCategories",
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
  reviewLikesByMe: [
  { type: mongoose.Schema.Types.ObjectId, ref: "movieReviewContentReview", default: [] }
],
reviewDislikesByMe: [
  { type: mongoose.Schema.Types.ObjectId, ref: "movieReviewContentReview", default: [] }
],
  likedPostsByMe: [
    { type: mongoose.Schema.Types.ObjectId, ref: "postuploads", default: [] },
  ],
  savedByMe: [
    { type: mongoose.Schema.Types.ObjectId, ref: "postuploads", default: [] },
  ],
  reviewContentWishlists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "moviereviewcontents",
      default: [],
    },
  ],
  postCount: { type: Number, default: 0 },

  // followers/following tracking
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Follow", default: [] },
  ],
  following: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Follow", default: [] },
  ],

  // per-type quick-lookup arrays
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

export default mongoose.model("influencers", influencerSchema);
