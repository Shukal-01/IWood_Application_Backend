// models/Follow.js
import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'followerType',
    index: true,
  },
  followerType: {
    type: String,
    required: true,
    enum: ['user','influencer','productionHouse','eventCompany','store'],
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'followingType',
    index: true,
  },
  followingType: {
    type: String,
    required: true,
    enum: ['user','influencer','productionHouse','eventCompany','store'],
  },
}, { timestamps: true });

// Compound unique index prevents duplicates at the database level
followSchema.index(
  { followerId: 1, followerType: 1, followingId: 1, followingType: 1 },
  { unique: true }
);

const Follow = mongoose.model('Follow', followSchema);
export default Follow;