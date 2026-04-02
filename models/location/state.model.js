import mongoose from "mongoose";

const stateSchema = mongoose.Schema({
  name: { type: String },
  code: { type: String, unique: true },
  countryCode: { type: String },
  status: { type: String },
});

const stateModel = mongoose.model("states", stateSchema);

export default  stateModel
