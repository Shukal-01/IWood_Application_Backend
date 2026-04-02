// models/like.model.js
import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true,
    enum: ['user','influencer','productionHouse','eventCompany','store']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'postuploads'
  }
}, { timestamps: true });

// Prevent duplicate likes by same user on same post
bookmarkSchema.index({ userType: 1, userId: 1, postId: 1 }, { unique: true });

export default mongoose.model('bookmark', bookmarkSchema);