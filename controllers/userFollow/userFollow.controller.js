// controllers/followController.js
import Follow from '../../models/follow.model.js';
import mongoose from 'mongoose';
import User from '../../models/users.model.js';
import Influencer from '../../models/influencer.model.js';
import ProductionHouse from '../../models/productionHouse.model.js';
import EventCompany from '../../models/eventCompany.model.js';
import Store from '../../models/store.model.js';
import { responseMessages, sendError, sendSuccess } from '../../helpers/other/Req_Res_Search_function.js';
/**
 * Follow someone
 */
export const handleFollow = async (req, res) => {
  const { followerId, followerType, followingId, followingType } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) Create Follow doc
    const [ followDoc ] = await Follow.create(
      [{ followerId, followerType, followingId, followingType }],
      { session }
    );

    // console.log(followDoc)
    // 2) Resolve profile models
    const modelMap = { user: User, influencer: Influencer, productionHouse: ProductionHouse, eventCompany: EventCompany, store: Store };
    const FollowerModel  = modelMap[followerType];
    const FollowingModel = modelMap[followingType];

    // 3) Build the per-type field name
    const typeField = `${followingType}FollowedByMe`;

    // 4) Update both profiles in parallel
    await Promise.all([
      // follower’s side
      FollowerModel.findByIdAndUpdate(
        followerId,
        {
          $addToSet: {
            following: followDoc._id,
            [typeField]: followingId        // e.g. influencerFollowedByMe: followingId
          },
          $inc: { followingCount: 1 }
        },
        { session }
      ),
      // target’s side
      FollowingModel.findByIdAndUpdate(
        followingId,
        {
          $addToSet: { followers: followDoc._id },
          $inc: { followersCount: 1 }
        },
        { session }
      )
    ]);

    // 5) Commit
    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, responseMessages.success.common, followDoc, "Successfully followed.");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.code === 11000) {
      return res.status(409).json({ success:false, message:'Already following.' });
    }
    console.error(err);
    return sendError(res, 500, err.message)
  }
};
/**
 * Unfollow someone
 */
export const handleUnfollow = async (req, res) => {
  const { followerId, followerType, followingId, followingType } = req.body;

  // 1) Start session & transaction
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    console.error('Failed to start DB session:', err);
    return res.status(500).json({ success: false, message: 'DB session error' });
  }

  try {
    // 2) Delete the Follow document
    const followDoc = await Follow.findOneAndDelete(
      { followerId, followerType, followingId, followingType },
      { session }
    );
    if (!followDoc) {
      console.warn('No Follow doc found to delete');
      throw new Error('Not found');
    }

    // 3) Resolve profile models
    const modelMap = {
      user: User,
      influencer: Influencer,
      productionHouse: ProductionHouse,
      eventCompany: EventCompany,
      store: Store,
    };
    const FollowerModel  = modelMap[followerType];
    const FollowingModel = modelMap[followingType];

    // 4) Compute the per-type quick-lookup field names
    const followerQuickField  = `${followingType}FollowedByMe`;  // e.g. 'productionHouseFollowedByMe'
    const followingQuickField = `${followerType}FollowedByMe`;   // e.g. 'userFollowedByMe'

    // 5) Update both documents in parallel
    const [updatedFollower, updatedFollowing] = await Promise.all([
      // On the follower’s doc: remove the followDoc._id, remove raw followingId, decrement count
      FollowerModel.findByIdAndUpdate(
        followerId,
        {
          $pull: {
            following: followDoc._id,
            [followerQuickField]: followingId
          },
          $inc: { followingCount: -1 }
        },
        { session, new: true }
      ),

      // On the following’s doc: remove the followDoc._id, remove raw followerId, decrement count
      FollowingModel.findByIdAndUpdate(
        followingId,
        {
          $pull: {
            followers: followDoc._id,
            [followingQuickField]: followerId
          },
          $inc: { followersCount: -1 }
        },
        { session, new: true }
      )
    ]);

    // 6) Commit & end session
    await session.commitTransaction();
    session.endSession();

    // return res.json({ success: true, message: 'Unfollowed successfully.' });
    return sendSuccess(res, responseMessages.success.common, updatedFollower, "Successfully unfollowed.");
  } catch (err) {
    // rollback on error
    try { await session.abortTransaction(); } catch (_) {}
    session.endSession();

    if (err.message === 'Not found') {
      return res.status(404).json({ success: false, message: 'Follow record not found.' });
    }
    console.error('Error in handleUnfollow:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * Get list of accounts a user is following
 * Supports pagination via query params `page` & `limit`
 */
export const handleGetFollowing = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const page  = Math.max(parseInt(req.query.page,10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit,10)||20, 1), 100);
    const skip  = (page-1)*limit;

    const [ total, list ] = await Promise.all([
      Follow.countDocuments({ followerId: userId, followerType: userType }),
      Follow.find({ followerId: userId, followerType: userType })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .populate('followingId')  // get full profile
        .lean()
    ]);

    return res.json({
      success: true,
      data: list.map(f => ({
        profile: f.followingId,
        type: f.followingType,
        followedAt: f.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total/limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message:'Server error.' });
  }
};

/**
 * Get list of followers of a user
 */
export const handleGetFollowers = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const page  = Math.max(parseInt(req.query.page,10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit,10)||20, 1), 100);
    const skip  = (page-1)*limit;

    const [ total, list ] = await Promise.all([
      Follow.countDocuments({ followingId: userId, followingType: userType }),
      Follow.find({ followingId: userId, followingType: userType })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .populate('followerId')
        .lean()
    ]);

    return res.json({
      success: true,
      data: list.map(f => ({
        profile: f.followerId,
        type: f.followerType,
        followedAt: f.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total/limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message:'Server error.' });
  }
};

const modelMap = {
  user: User,
  influencer: Influencer,
  productionHouse: ProductionHouse,
  eventCompany: EventCompany,
  store: Store,
};
/**
 * Check if viewer follows target, and return target’s profile data + flag.
 */
export const checkFollowingStatus = async (req, res) => {
  try {
    const { viewerType, viewerId, targetType, targetId } = req.params;

    // 1) Validate inputs
    if (
      !modelMap[viewerType] ||
      !modelMap[targetType] ||
      !mongoose.Types.ObjectId.isValid(viewerId) ||
      !mongoose.Types.ObjectId.isValid(targetId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid viewerType/viewerId or targetType/targetId'
      });
    }

    const ViewerModel = modelMap[viewerType];
    const TargetModel = modelMap[targetType];

    // 2) Load target profile (omit heavy arrays)
    const target = await TargetModel.findById(targetId)
      .select('-followers -following -userFollowedByMe -influencerFollowedByMe -productionHouseFollowedByMe -eventCompanyFollowedByMe -storeFollowedByMe')
      .lean();
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target profile not found'
      });
    }

    // 3) Compute which quick-lookup field to use
    const lookupField = `${targetType}FollowedByMe`;  
    // e.g. if targetType==='influencer' → 'influencerFollowedByMe'

    // 4) Fetch only that array from the viewer
    const viewer = await ViewerModel.findById(viewerId)
      .select(lookupField)
      .lean();
    if (!viewer) {
      return res.status(404).json({
        success: false,
        message: 'Viewer profile not found'
      });
    }

    // 5) Safe membership check
    const list = Array.isArray(viewer[lookupField]) ? viewer[lookupField].map(id => id.toString()) : [];
    const isFollowing = list.includes(targetId);

    // 6) Return combined result
    return sendSuccess(
      res,
      responseMessages.success.common,
      { profile: target, isFollowing }
    );

  } catch (err) {
    console.error('Error in checkFollowingStatus:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};