import mongoose from "mongoose";

const productionHouseTeamSchema = new mongoose.Schema(
  {
    productionHouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionHouse",
      required: true,
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Influencer",
      required: true,
    },
    roles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "moviecastingcategories",
      required: true,
    }],
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound unique index to prevent duplicate team members
productionHouseTeamSchema.index(
  { productionHouseId: 1, influencerId: 1 },
  { unique: true }
);

const ProductionHouseTeamModel = mongoose.model(
  "ProductionHouseTeam",
  productionHouseTeamSchema
);

export default ProductionHouseTeamModel; 