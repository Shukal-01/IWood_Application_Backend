import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    portfolioLink: { type: String },
    socialMediaLink: { type: String },
    filedata: { type: String },
    ourPartners: { type: String },
    subject: { type: String },
    message: { type: String },
    created: { type: Date },
    updated: { type: Date },
  },
  { timestamps: true }
);

const contactUsModel = mongoose.model("contactus", contactUsSchema);

export default contactUsModel;
