import mongoose from "mongoose";

const blogNewsletterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
}, {timestamps: true});

const blogNewsletterModel = mongoose.model("blogNewsletter", blogNewsletterSchema);

export default blogNewsletterModel;