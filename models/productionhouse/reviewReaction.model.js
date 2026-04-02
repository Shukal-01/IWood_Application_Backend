// models/reviewReaction.model.js
import mongoose from 'mongoose';

const reviewReactionSchema = new mongoose.Schema({
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'movieReviewContentReview',
        index: true,
    },
    userType: {
        type: String,
        required: true,
        enum: ['user', 'influencer', 'productionHouse', 'eventCompany', 'store'],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType',
        index: true,
    },
    reaction: {
        type: String,
        required: true,
        enum: ['like', 'dislike'],
    }
}, { timestamps: true });

// ensure one reaction per user/review
reviewReactionSchema.index({ reviewId: 1, userType: 1, userId: 1 }, { unique: true });

export default mongoose.model('ReviewReaction', reviewReactionSchema);