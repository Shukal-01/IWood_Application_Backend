import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  mobileNumber: { type: Number, unique: true, required: true },
  name: { type: String },
  profileImage: { type: String },
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
  reviewLikesByMe: [
  { type: mongoose.Schema.Types.ObjectId, ref: "movieReviewContentReview", default: [] }
],
reviewDislikesByMe: [
  { type: mongoose.Schema.Types.ObjectId, ref: "movieReviewContentReview", default: [] }
],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Follow" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Follow" }],
  userType: { type: String, default: "user" },
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

const userModel = mongoose.model("users", userSchema);

export default userModel;
