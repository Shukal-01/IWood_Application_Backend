import mongoose from "mongoose";

const movieReviewContentSchema = mongoose.Schema({
  name: { type: String, required: true },
  productionHouseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "productionHouses",
    index: true,
  },
  description: { type: String },
  storyline: { type: String },
  releaseData: { type: String },
  contentTypes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "productionhousecontenttypes",
      index: true,
    },
  ],
  genres: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "moviegenres",
      index: true,
    },
  ],
  crews: [
    {
      crewId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "productionhousecrews",
        index: true,
      },
      crewCategories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "productionhousecrewcategories",
          index: true,
        },
      ],
      isAccepted: { type: Boolean },
    },
  ],
  castings: [
    {
      influencerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "influencers",
        index: true,
      },
      castingCategories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "moviecastingcategories",
          index: true,
        },
      ],
      isAccepted: { type: Boolean },
    },
  ],
  bannerImage: { type: String },
  trailerThumbnail: { type: String },
  trailerVideo: { type: String },
  images: { type: [String] },
  videos: { type: [String] },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  ratingTotal: { type: Number, default: 0 },
  ratedCount: { type: Number, default: 0 },
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive", "pending", "rejected", "blocked"],
  },
});

movieReviewContentSchema.pre("validate", function (next) {
  const removeDuplicates = (arr) =>
    Array.isArray(arr) ? [...new Set(arr.map((id) => id.toString()))] : [];

  this.contentTypes = removeDuplicates(this.contentTypes);
  this.genres = removeDuplicates(this.genres);

  if (Array.isArray(this.crews)) {
    this.crews.forEach((crew) => {
      crew.crewCategories = removeDuplicates(crew.crewCategories);
    });
  }

  if (Array.isArray(this.castings)) {
    this.castings.forEach((cast) => {
      cast.castingCategories = removeDuplicates(cast.castingCategories);
    });
  }

  next();
});

const MovieReviewContentModel = mongoose.model(
  "moviereviewcontents",
  movieReviewContentSchema
);

export default MovieReviewContentModel;
