import mongoose from "mongoose";

const reviewContentBannersSchema = mongoose.Schema(
  {
    bannerImage: { type: String },
    isInternalContent: { type: String, enum: ["0", "1"], default: "1" },
    externalContentLink: { type: String },
    internalContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "moviereviewcontents",
      index: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "pending", "rejected", "blocked"],
    },
  },
  {
    timestamps: true,
  }
);

const reviewContentBannersModel = mongoose.model(
  "reviewcontentbanners",
  reviewContentBannersSchema
);

export default reviewContentBannersModel;
