import mongoose from "mongoose";

const movieGenresSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["0", "1"], default: "0" },
  },
  {
    timestamps: true,
  }
);

const movieGenresModel = mongoose.model("moviegenres", movieGenresSchema);

export default movieGenresModel;
