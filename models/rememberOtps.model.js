import mongoose from "mongoose";

const rememberOtpsSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true }, // Phone number as the key
  otp: { type: String, required: true }, // OTP as the value
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Automatically delete after 5 minutes (300 seconds)
});

const rememberOtpsModel = mongoose.model("rememberotps", rememberOtpsSchema);

export default rememberOtpsModel;
