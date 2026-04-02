import mongoose from "mongoose";

const productionHouseCrewCategoriesSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["0", "1"], default: "0" },
  },
  {
    timestamps: true,
  }
);

const productionHouseCrewCategoriesModel = mongoose.model(
  "productionhousecrewcategories",
  productionHouseCrewCategoriesSchema
);

export default productionHouseCrewCategoriesModel;
