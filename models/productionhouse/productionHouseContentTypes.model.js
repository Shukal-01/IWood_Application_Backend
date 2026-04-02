import mongoose from "mongoose";

const productionHouseContentTypesSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["0", "1"], default: "0" },
  },
  {
    timestamps: true,
  }
);

const productionHouseContentTypesModel = mongoose.model(
  "productionhousecontenttypes",
  productionHouseContentTypesSchema
);

export default productionHouseContentTypesModel;
