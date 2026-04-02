// models/like.model.js
import mongoose from "mongoose";

const reviewContentWishlistSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      required: true,
      enum: ["user", "influencer", "productionHouse", "eventCompany", "store"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
    },
    reviewContent: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "moviereviewcontents",
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes by same user on same post
reviewContentWishlistSchema.index(
  { userType: 1, userId: 1, reviewContent: 1 },
  { unique: true }
);

const reviewContentWishlistModel = mongoose.model(
  "reviewcontentwishlist",
  reviewContentWishlistSchema
);

export default reviewContentWishlistModel;
