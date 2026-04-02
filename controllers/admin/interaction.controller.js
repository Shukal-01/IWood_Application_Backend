import mongoose from "mongoose";
import likeModel from "../../models/like.model.js";
import commentModel from "../../models/comment.model.js";
import PostUpload from "../../models/postUpload.model.js";
import bookmarkModel from "../../models/bookmark.model.js";
import {
  sendError,
  responseMessages,
  sendSuccess,
} from "../../helpers/other/Req_Res_Search_function.js";

export const allowedTypes = [
  "user",
  "influencer",
  "productionHouse",
  "eventCompany",
  "store",
];

// 3.1 Add a like
export const handleLikePost = async (req, res) => {
  try {
    const { userType, userId, postId } = req.params;
    if (
      !allowedTypes.includes(userType) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return sendError(
        res,
        responseMessages.error.common,
        "Invalid parameters"
      );
    }

    // 1) Create the Like record (will throw if duplicate)
    await likeModel.create({ userType, userId, postId });

    // 2) Increment likesCount on the post
    const post = await PostUpload.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );
    if (!post) {
      throw new Error("Post not found");
    }

    // 3) Add this postId to the user’s likedPosts array
    //    Use the correct Mongoose model by userType
    const UserModel = mongoose.model(userType);
    await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { likedPostsByMe: postId } }, // addToSet prevents duplicates
      { new: true }
    );

    return sendSuccess(res, responseMessages.success.common, {
      postId,
      likesCount: post.likesCount,
    });
  } catch (err) {
    if (err.code === 11000) {
      // duplicate key from Like.create()
      return sendError(res, responseMessages.error.common, "Already liked");
    }
    console.error("Error in handleLikePost:", err);
    return sendError(res, responseMessages.error.common, "Could not like post");
  }
};

export const handleBookmarkPost = async (req, res) => {
  try {
    const { userType, userId, postId } = req.params;
    if (
      !allowedTypes.includes(userType) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(postId)

    )
    // console.log(userType, userId, postId);
    {
      return sendError(
        res,
        responseMessages.error.common,
        "Invalid parameters"
      );
    }

    // 1) Create the Like record (will throw if duplicate)
    await bookmarkModel.create({ userType, userId, postId });

    // 3) Add this postId to the user’s likedPosts array
    //    Use the correct Mongoose model by userType
    const UserModel = mongoose.model(userType);
    await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { savedByMe: postId } }, // addToSet prevents duplicates
      { new: true }
    );

    return sendSuccess(res, responseMessages.success.common, {
      postId,
    });
  } catch (err) {
    if (err.code === 11000) {
      // duplicate key from Like.create()
      return sendError(res, responseMessages.error.common, "Already Bookmarked");
    }
    console.error("Error in handleBookmarkPost:", err);
    return sendError(res, responseMessages.error.common, "Could not saved post");
  }
};

// 3.2 Get likes for a post (and count)
export const handleGetPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, responseMessages.error.common, "Invalid postId");
    }

    const likes = await likeModel.find({ postId }).lean();
    const count = likes.length;
    return sendSuccess(res, responseMessages.success.common, { count, likes });
  } catch (err) {
    console.error(err);
    return sendError(
      res,
      responseMessages.error.common,
      "Could not fetch likes"
    );
  }
};

export const handleGetPostBookmarks = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, responseMessages.error.common, "Invalid postId");
    }

    const bookmarks = await bookmarkModel.find({ postId }).lean();
    const bookmarkCount = bookmarks.length;
    return sendSuccess(res, responseMessages.success.common, { bookmarks, bookmarkCount });
  } catch (err) {
    console.error(err);
    return sendError(
      res,
      responseMessages.error.common,
      "Could not fetch bookmarks"
    );
  }
};

export const handleUnlikePost = async (req, res) => {
  try {
    const { userType, userId, postId } = req.params;
    // ... validation as before ...

    // 1) Remove the Like document
    const deleteResult = await likeModel.deleteOne({
      userType,
      userId,
      postId,
    });
    if (deleteResult.deletedCount === 0) {
      return sendError(res, responseMessages.error.common, "Like not found");
    }

    // 2) Decrement the post’s like count
    const post = await PostUpload.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );
    if (!post) throw new Error("Post not found");

    // 3) Pull the postId from the user’s likedPostsByMe array
    const UserModel = mongoose.model(userType);
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { likedPostsByMe: postId } }, // <-- updated field name
      { new: true }
    );

    // 4) Respond with the new counts and optional user data
    return sendSuccess(res, responseMessages.success.common, {
      postId,
      likesCount: post.likesCount,
      likedPostsByMe: updatedUser.likedPostsByMe,
    });
  } catch (err) {
    console.error("Error in handleUnlikePost:", err);
    return sendError(
      res,
      responseMessages.error.common,
      "Could not unlike post"
    );
  }
};

export const handleRemoveBookmark = async (req, res) => {
  try {
    const { userType, userId, postId } = req.params;
    // ... validation as before ...

    // 1) Remove the Like document
    const deleteResult = await bookmarkModel.deleteOne({
      userType,
      userId,
      postId,
    });
    if (deleteResult.deletedCount === 0) {
      return sendError(res, responseMessages.error.common, "Bookmark not found");
    }

    // 3) Pull the postId from the user’s likedPostsByMe array
    const UserModel = mongoose.model(userType);
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { savedByMe: postId } }, // <-- updated field name
      { new: true }
    );

    // 4) Respond with the new counts and optional user data
    return sendSuccess(res, responseMessages.success.common, {
      postId,
      savedByMe: updatedUser.savedByMe,
    });
  } catch (err) {
    console.error("Error in handleBookmarkPost:", err);
    return sendError(
      res,
      responseMessages.error.common,
      "Could not bookmark post"
    );
  }
};

export const handleGetLikedPostsByUser = async (req, res) => {
  try {
    const { userType, userId } = req.params;

    // 1) Validate params
    if (
      !allowedTypes.includes(userType) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return sendError(
        res,
        responseMessages.error.common,
        "Invalid parameters"
      );
    }

    // 2) Fetch Like docs for this user
    const likes = await likeModel.find({ userType, userId }) // filter by both fields :contentReference[oaicite:1]{index=1}
      .populate({
        path: "postId",
        model: "postuploads",
      }) // replace postId with full post doc :contentReference[oaicite:2]{index=2}
      .lean();

    // 3) Extract post details (ignore any missing posts)
    const posts = likes
      .map((like) => like.postId)
      .filter((post) => post != null);

    // 4) Return the array of liked posts
    return sendSuccess(res, responseMessages.success.common, {
      posts,
    });
  } catch (err) {
    console.error("Error in handleGetLikedPostsByUser:", err);
    return sendError(
      res,
      responseMessages.error.common,
      "Could not fetch liked posts"
    );
  }
};

export const handleGetBookmarkedPostsByUser = async (req, res) => {
  try {
    const { userType, userId } = req.params;

    // 1) Validate params
    if (
      !allowedTypes.includes(userType) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return sendError(
        res,
        responseMessages.error.common,
        "Invalid parameters"
      );
    }

    // 2) Fetch Like docs for this user
    const bookmarks = await bookmarkModel.find({ userType, userId }) // filter by both fields :contentReference[oaicite:1]{index=1}
      .populate({
        path: "postId",
        model: "postuploads",
      }) // replace postId with full post doc :contentReference[oaicite:2]{index=2}
      .lean();

    // 3) Extract post details (ignore any missing posts)
    const posts = bookmarks
      .map((bookmarks) => bookmarks.postId)
      .filter((post) => post != null);

    // 4) Return the array of liked posts
    return sendSuccess(res, responseMessages.success.common, {
      posts,
    });
  } catch (err) {
    console.error("Error in handleGetBookmarkedPostsByUser:", err);
    return sendError(
      res,
      responseMessages.error.common,
      "Could not fetch bookmarked posts"
    );
  }
};

// 3.3 Add a comment
export const handleCommentPost = async (req, res) => {
  try {
    const { userType, userId, postId } = req.params;
    const { text } = req.body;
    if (
      !text ||
      !allowedTypes.includes(userType) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return sendError(
        res,
        responseMessages.error.common,
        "Invalid parameters"
      );
    }

    const comment = await commentModel.create({
      userType,
      userId,
      postId,
      text,
    });
    return sendSuccess(res, responseMessages.success.common, { comment });
  } catch (err) {
    console.error(err);
    return sendError(
      res,
      responseMessages.error.common,
      "Could not add comment"
    );
  }
};

// 3.4 Get comments for a post
export const handleGetPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, responseMessages.error.common, "Invalid postId");
    }

    const comments = await commentModel
      .find({ postId })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, responseMessages.success.common, { comments });
  } catch (err) {
    console.error(err);
    return sendError(
      res,
      responseMessages.error.common,
      "Could not fetch comments"
    );
  }
};
