import mongoose from "mongoose";

// Define schema
const movieCastingCategoriesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    importance: { type: Number, unique: true, sparse: true }, // sparse allows duplicates if missing
    status: { type: String, enum: ["0", "1"], default: "0" },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware
movieCastingCategoriesSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Only apply on document creation

  const Model = mongoose.model("moviecastingcategories");

  let desiredImportance = this.importance;

  // Get max existing importance
  const maxDoc = await Model.findOne({})
    .sort("-importance")
    .select("importance")
    .lean();
  const nextImportance = maxDoc?.importance != null ? maxDoc.importance + 1 : 1;

  // If missing, zero, or already exists, generate unique importance
  if (!desiredImportance || desiredImportance === 0) {
    this.importance = nextImportance;
  } else {
    const exists = await Model.findOne({ importance: desiredImportance });
    this.importance = exists ? nextImportance : desiredImportance;
  }

  next();
});

// Model
const movieCastingCategoriesModel = mongoose.model(
  "moviecastingcategories",
  movieCastingCategoriesSchema
);

// Create function
export const createMovieCategory = async (data) => {
  const category = new movieCastingCategoriesModel(data);
  return await category.save();
};

export default movieCastingCategoriesModel;
