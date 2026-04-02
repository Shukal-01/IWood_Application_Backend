import mongoose from "mongoose";

const eventContactFormSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    message: { type: String }
}, {timestamps: true});

const eventContactFormModel = mongoose.model("eventcontactform", eventContactFormSchema);

export default eventContactFormModel;