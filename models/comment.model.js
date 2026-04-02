// models/comment.model.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
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
  },
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
