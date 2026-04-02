import handleGetWithMsg from "../../helpers/crudHelpers/GetWithMsg.js";
import postUploadModel from "../../models/postUpload.model.js";
import { sendError, responseMessages, sendSuccess } from "../../helpers/other/Req_Res_Search_function.js";
import mongoose from "mongoose";
import { getSignedUrl } from "../../helpers/cloudflareUtils/r2Operations.js";
// import influencerModel from "../../models/influencer.model.js";
// import productionHouseModel from "../../models/productionHouse.model.js";
// import eventCompanyModel from "../../models/eventCompany.model.js";
// import storeModel from "../../models/store.model.js";

const handleGetAllPosts = async (req, res) => {
  // Ye direct call karega handleGetWithMsg ko, without user data
  await handleGetWithMsg(req, res, postUploadModel, {}, null);
};

// const handleGetAllPostsWithUserData = async (req, res) => {
//   try {
//     // 1) Parse pagination params
//     const page  = Math.max(parseInt(req.query.page, 10)  || 1, 1);
//     const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
//     const skip  = (page - 1) * limit;

//     // 2) Fetch posts as plain objects
//     const posts = await postUploadModel
//       .find({})
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate('userId')
//       .lean();

//     // 3) If no posts, return early
//     if (posts.length === 0) {
//       return sendSuccess(res, responseMessages.success.common, {
//         data: [],
//         pagination: { totalRecords: 0, page, limit, totalPages: 0 },
//       });
//     }

//     // 4) Group post.userId strings by userType
//     const userIdMap = {
//       influencer:       [],
//       productionHouse:  [],
//       eventCompany:     [],
//       store:            [],
//     };
//     posts.forEach(post => {
//       const type = post.userType;
//       if (userIdMap[type]) {
//         userIdMap[type].push(post.userId.toString());
//       }
//     });

//     // 5) Bulk‐fetch each user‐type’s docs by their _id
//     // "user", "influencer", "productionHouse", "eventCompany", "store"
//     const [
//       influencer,
//       productionHouse,
//       eventCompany,
//       store
//     ] = await Promise.all([
//       influencerModel     .find({ _id: { $in: userIdMap.influencer      } }).lean(),
//       productionHouseModel.find({ _id: { $in: userIdMap.productionHouse } }).lean(),
//       eventCompanyModel   .find({ _id: { $in: userIdMap.eventCompany    } }).lean(),
//       storeModel          .find({ _id: { $in: userIdMap.store           } }).lean(),
//     ]);

//     // 6) Build a lookup by _id → user doc
//     const userMap = {};
//     [...influencer, ...productionHouse, ...eventCompany, ...store].forEach(user => {
//       userMap[user._id.toString()] = user;
//     });

//     // 7) Merge into posts
//     const postsWithUserData = posts.map(post => ({
//       ...post,
//       postedBy: userMap[post.userId.toString()] || null
//     }));

//     // 8) Get total count for pagination
//     const totalCount = await postUploadModel.countDocuments();

//     // 9) Respond
//     return sendSuccess(res, responseMessages.success.common, {
//       data: postsWithUserData,
//       pagination: {
//         totalRecords: totalCount,
//         page,
//         limit,
//         totalPages: Math.ceil(totalCount / limit),
//       },
//     });

//   } catch (error) {
//     console.error("Error in handleGetAllPostsWithUserData:", error);
//     return sendError(res, responseMessages.error.common, "Failed to fetch posts");
//   }
// };

export const handleGetAllPostsWithUserData = async (req, res) => {
  try {
    // 1) Pagination params
    const page  = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 50) || 20, 1);
    const skip  = (page - 1) * limit;

    // 2) Fetch and populate userId
    const rawPosts = await postUploadModel.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId")   // full user doc in `userId`
      .lean();

    // 3) If no posts, return early
    const totalCount = await postUploadModel.countDocuments({ status: 'active' });
    if (rawPosts.length === 0) {
      return sendSuccess(res, responseMessages.success.common, {
        data: [],
        pagination: {
          totalRecords: 0,
          page,
          limit,
          totalPages: 0
        }
      });
    }

    // 4) Map posts: keep userId as object, refresh URLs
    // const postsWithUserData = rawPosts.map(post => {
    //   const { fileUrl, thumbnailUrl, ...rest } = post;
    //   return {
    //     ...rest,
    //     // userId remains populated object
    //     fileUrl: getSignedUrl(fileUrl),
    //     thumbnailUrl: thumbnailUrl ? getSignedUrl(thumbnailUrl) : null
    //   };
    // });

    // 4) Map posts: keep userId as object, use public endpoint URLs
    const endpoint = process.env.GET_R2_ENDPOINT.replace(/\/+$/,'');
    const postsWithUserData = rawPosts.map(post => {
      const { fileUrl, thumbnailUrl, ...rest } = post;
      return {
        ...rest,
        // userId remains populated object
        fileUrl: `${endpoint}/${fileUrl}`,
        thumbnailUrl: thumbnailUrl ? `${endpoint}/${thumbnailUrl}` : null
      };
    });

    // 5) Respond with data and pagination info
    return sendSuccess(res, responseMessages.success.common, {
      data: postsWithUserData,
      pagination: {
        totalRecords: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Error in handleGetAllPostsWithUserData:", error);
    return sendError(res, responseMessages.error.common, "Failed to fetch posts");
  }
};

// create a Get Method to Fetch posts which post type is reel video
export const handleGetAllReelPosts = async (req, res) => {
  try {
    // 1) Pagination params
    const page  = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 50) || 20, 1);
    const skip  = (page - 1) * limit;

    // 2) Fetch and populate userId
    const rawPosts = await postUploadModel.find({ status: 'active', postType: 'reel' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId")   // full user doc in `userId`
      .lean();

    // 3) If no posts, return early
    const totalCount = await postUploadModel.countDocuments({ status: 'active', postType: 'reel' });
    if (rawPosts.length === 0) {
      return sendSuccess(res, responseMessages.success.common, {
        data: [],
        pagination: {
          totalRecords: 0,
          page,
          limit,
          totalPages: 0
        }
      });
    }

    // 4) Map posts: keep userId as object, refresh URLs
    // const postsWithUserData = rawPosts.map(post => {
    //   const { fileUrl, thumbnailUrl, ...rest } = post;
    //   return {
    //     ...rest,
    //     // userId remains populated object
    //     fileUrl: getSignedUrl(fileUrl),
    //     thumbnailUrl: thumbnailUrl ? getSignedUrl(thumbnailUrl) : null
    //   };
    // });

    // 4) Map posts: keep userId, combine signed URL token with public endpoint
    // const endpoint = process.env.R2_ENDPOINT.replace(/\/+$/,'');
    // const postsWithUserData = rawPosts.map(post => {
    //   const { fileUrl, thumbnailUrl, ...rest } = post;
    //   // Generate signed URL and extract query params
    //   const signedFile = getSignedUrl(fileUrl);
    //   const signedThumb = thumbnailUrl ? getSignedUrl(thumbnailUrl) : null;
    //   const fileQuery   = signedFile.includes('?') ? signedFile.substring(signedFile.indexOf('?')) : '';
    //   const thumbQuery  = signedThumb && signedThumb.includes('?') ? signedThumb.substring(signedThumb.indexOf('?')) : '';

    //   return {
    //     ...rest,
    //     fileUrl:      `${endpoint}/${fileUrl}${fileQuery}`,
    //     thumbnailUrl: thumbnailUrl ? `${endpoint}/${thumbnailUrl}${thumbQuery}` : null
    //   };
    // });

    // 4) Map posts: keep userId as object, use public endpoint URLs
    const endpoint = process.env.GET_R2_ENDPOINT.replace(/\/+$/,'');
    const postsWithUserData = rawPosts.map(post => {
      const { fileUrl, thumbnailUrl, ...rest } = post;
      return {
        ...rest,
        // userId remains populated object
        fileUrl: `${endpoint}/${fileUrl}`,
        thumbnailUrl: thumbnailUrl ? `${endpoint}/${thumbnailUrl}` : null
      };
    });

    // 5) Respond with data and pagination info
    return sendSuccess(res, responseMessages.success.common, {
      data: postsWithUserData,
      pagination: {
        totalRecords: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Error in handleGetAllPostsWithUserData:", error);
    return sendError(res, responseMessages.error.common, "Failed to fetch posts");
  }
}

export const handleGetPostsByUser = async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const allowedTypes = ['user', 'influencer', 'productionHouse', 'eventCompany', 'store'];

    // 1) Validate inputs
    if (!allowedTypes.includes(userType)) {
      return sendError(res, responseMessages.error.common, 'Invalid userType');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, responseMessages.error.common, 'Invalid userId');
    }

    // 2) Fetch & populate to grab the user object
    const rawPosts = await postUploadModel
      .find({ userType, userId })
      .sort({ createdAt: -1 })
      .populate('userId')
      .lean();

    // 3) No posts => consistent shape
    if (rawPosts.length === 0) {
      return sendSuccess(res, responseMessages.success.common, {
        user: null,
        posts: []
      });
    }

    // 4) Extract full user from first post
    const user = rawPosts[0].userId;

    // 5) R2 endpoint
    const endpoint = process.env.GET_R2_ENDPOINT.replace(/\/+$/, '');

    // 6) Map posts
    let posts = rawPosts.map(post => {
      const { userId: populatedUser, fileUrl, thumbnailUrl, ...rest } = post;
      return {
        ...rest,
        userId: populatedUser._id,
        fileUrl: `${endpoint}/${fileUrl}`,
        thumbnailUrl: thumbnailUrl ? `${endpoint}/${thumbnailUrl}` : null
      };
    });
    // 6.1) Replicate posts 5 times
// posts = Array(5).fill(posts).flat();

    // 7) Send response
    return sendSuccess(res, responseMessages.success.common, {
      user,
      posts
    });

  } catch (err) {
    console.error('Error in handleGetPostsByUser:', err);
    return sendError(res, responseMessages.error.common, 'Failed to fetch posts');
  }
};

const userPostController = { handleGetAllPosts, handleGetAllPostsWithUserData, handleGetPostsByUser, handleGetAllReelPosts };

export default userPostController;
