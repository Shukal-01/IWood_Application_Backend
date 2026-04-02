// Import the OTP model  

import rememberOtpsModel from "../../models/rememberOtps.model.js";

 

// Store OTP in the database with an expiry
export async function storeOTP(phoneNumber, otp) {
  try {
    // Upsert: If OTP already exists for the phone number, update it; otherwise, create a new one
    await rememberOtpsModel.findOneAndUpdate(
      { phoneNumber }, // Search by phone number
      { otp, createdAt: Date.now() }, // Update or set the OTP and createdAt
      { upsert: true, new: true } // Upsert: Insert new if not found, return updated doc
    );
    // console.log(`Stored OTP for ${phoneNumber}`);
  } catch (error) {
    console.error("Error storing OTP:", error);
  }
}

// Validate OTP from the database
export async function validateOTP(phoneNumber, otp) {
  try {
    // Find OTP for the phone number
    const otpEntry = await rememberOtpsModel.findOne({ phoneNumber });

    if (otpEntry && otpEntry.otp === otp) {
      // OTP is valid, so remove it from the database
      await rememberOtpsModel.deleteOne({ phoneNumber });
      // console.log("OTP validated");
      return true;
    } else {
      // console.log("OTP invalid or expired");
      return false;
    }
  } catch (error) {
    // console.error("Error validating OTP:", error);
    return false;
  }
} 