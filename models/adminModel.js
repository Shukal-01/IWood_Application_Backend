import mongoose from "mongoose";


const adminSchema = mongoose.Schema({
  name: { type: String },
  image: { type: String },
  email: { type: String },
  password: { type: String },
  employeeId: { type: String },
  mobileNumber: { type: Number },
  passwordUpdateToken: { type: String },
  designation: { type: String },
  role: { type: Array },
  created: { type: Date },
  updated: { type: Date },
});

const adminModel = mongoose.model("admins", adminSchema);

export default adminModel;