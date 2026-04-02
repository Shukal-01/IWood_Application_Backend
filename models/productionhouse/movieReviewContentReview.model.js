import mongoose from "mongoose";
import influencerModel from "../influencer.model.js";
import productionHouseModel from "../productionHouse.model.js";
import eventCompanyModel from "../eventCompany.model.js";
import storeModel from "../store.model.js";
import userModel from "../users.model.js";

// Safe model registration
const dynamicModels = {
  user: userModel,
  influencer: influencerModel,
  productionHouse: productionHouseModel,
  eventCompany: eventCompanyModel,
  store: storeModel,
};

for (const [key, model] of Object.entries(dynamicModels)) {
  if (!mongoose.models[key]) {
    mongoose.model(key, model.schema);
  }
}

const movieReviewContentReviewSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "movieReviewContents",
      index: true,
    },
    productionHouseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "productionHouses",
      index: true,
    },
    userType: {
      type: String,
      required: true,
      enum: Object.keys(dynamicModels), // ["user", "influencer", ...]
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
      index: true,
    },
    review: {
      type: String,
      trim: true,
      default: "",
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    likeCount: { type: Number, default: 0, min: 0 },
  dislikeCount: { type: Number, default: 0, min: 0 }
  },
  {
    timestamps: true,
  }
);

// Optional full-text search on review
movieReviewContentReviewSchema.index({ review: "text" });

// middleware: remove reactions when a review is deleted
movieReviewContentReviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await ReviewReaction.deleteMany({ reviewId: doc._id });
  }
});

const movieReviewContentReviewModel = mongoose.model(
  "movieReviewContentReview",
  movieReviewContentReviewSchema
);

export default movieReviewContentReviewModel;
