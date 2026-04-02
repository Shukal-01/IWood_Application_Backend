// controllers/reviewController.js
import mongoose from 'mongoose';
import MovieReview from '../../models/productionhouse/movieReviewContentReview.model.js';
import ReviewReaction from '../../models/productionhouse/reviewReaction.model.js';
// Inline userType to model mapping
import Influencer from "../../models/influencer.model.js";
import User from "../../models/users.model.js";
import Store from "../../models/store.model.js";
import EventCompany from "../../models/eventCompany.model.js";
import ProductionHouse from "../../models/productionHouse.model.js";

function getUserModel(userType) {
    switch (userType) {
        case "user":
            return User;
        case "influencer":
            return Influencer;
        case "store":
            return Store;
        case "event":
        case "eventCompany":
            return EventCompany;
        case "productionHouse":
            return ProductionHouse;
        default:
            throw new Error(`Invalid userType: ${userType}`);
    }
}
export async function handleLikeReview(req, res) {
    const { reviewId, userType, userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reviewId) || !mongoose.Types.ObjectId.isValid(userId))
        return res.status(400).json({ error: 'Invalid IDs' });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const Review = MovieReview;
        const UserModel = getUserModel(userType);

        const [review, user] = await Promise.all([
            Review.findById(reviewId).session(session),
            UserModel.findById(userId).session(session),
        ]);

        if (!review || review.isDeleted) throw { status: 404, message: "Review not found" };

        const alreadyLiked = user.reviewLikesByMe.includes(reviewId);
        const alreadyDisliked = user.reviewDislikesByMe.includes(reviewId);

        if (alreadyLiked) throw { status: 400, message: "Already liked" };

        // Remove from dislikes if present
        if (alreadyDisliked) {
            user.reviewDislikesByMe.pull(reviewId);
            review.dislikeCount -= 1;
        }

        // Add to likes
        user.reviewLikesByMe.addToSet(reviewId);
        review.likeCount += 1;

        await Promise.all([user.save({ session }), review.save({ session })]);

        await session.commitTransaction();
        session.endSession();

        return res.json({ reviewId, likeCount: review.likeCount, dislikeCount: review.dislikeCount });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(err.status || 500).json({ error: err.message || 'Like failed' });
    }
}

export async function handleDislikeReview(req, res) {
    const { reviewId, userType, userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reviewId) || !mongoose.Types.ObjectId.isValid(userId))
        return res.status(400).json({ error: 'Invalid IDs' });

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const Review = MovieReview;
        const UserModel = getUserModel(userType);

        const [review, user] = await Promise.all([
            Review.findById(reviewId).session(session),
            UserModel.findById(userId).session(session),
        ]);

        if (!review || review.isDeleted) throw { status: 404, message: "Review not found" };

        const alreadyLiked = user.reviewLikesByMe.includes(reviewId);
        const alreadyDisliked = user.reviewDislikesByMe.includes(reviewId);

        if (alreadyDisliked) throw { status: 400, message: "Already disliked" };

        if (alreadyLiked) {
            user.reviewLikesByMe.pull(reviewId);
            review.likeCount -= 1;
        }

        user.reviewDislikesByMe.addToSet(reviewId);
        review.dislikeCount += 1;

        await Promise.all([
            user.save({ session }),
            review.save({ session }),
        ]);

        await session.commitTransaction();

        return res.json({ reviewId, likeCount: review.likeCount, dislikeCount: review.dislikeCount });
    } catch (err) {
        await session.abortTransaction();
        return res.status(err.status || 500).json({ error: err.message || 'Dislike failed' });
    } finally {
        session.endSession(); // ensure it's always closed safely
    }
}


export async function handleGetReviewReactions(req, res) {
    const { reviewId, userType, userId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(reviewId))
        return res.status(400).json({ error: 'Invalid reviewId' });

    try {
        const review = await MovieReview.findById(reviewId).lean();
        if (!review || review.isDeleted)
            return res.status(404).json({ error: 'Review not found' });

        let myReaction = null;

        if (userType && userId && mongoose.Types.ObjectId.isValid(userId)) {
            const UserModel = getUserModel(userType);
            const user = await UserModel.findById(userId).lean();

            if (user?.reviewLikesByMe?.includes(reviewId)) myReaction = 'like';
            else if (user?.reviewDislikesByMe?.includes(reviewId)) myReaction = 'dislike';
        }

        return res.json({
            reviewId,
            likeCount: review.likeCount || 0,
            dislikeCount: review.dislikeCount || 0,
            myReaction,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching review reaction' });
    }
}

export async function handleDeleteReview(req, res) {
    const { reviewId, userType, userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(reviewId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid IDs' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the review
        const review = await MovieReview.findById(reviewId).session(session);
        
        if (!review || review.isDeleted) {
            throw { status: 404, message: "Review not found" };
        }
        
        // Check if the user is the owner of the review
        const isOwner = review.userType === userType && review.userId.toString() === userId;
        
        if (!isOwner) {
            throw { status: 403, message: "You can only delete your own reviews" };
        }
        
        // Soft delete (mark as deleted)
        review.isDeleted = true;
        await review.save({ session });
        
        // Clean up review reactions - remove from users' like/dislike lists
        await handleReviewDeletionCleanup(reviewId, session);
        
        await session.commitTransaction();
        
        return res.status(200).json({ 
            success: true, 
            message: "Review deleted successfully",
            reviewId
        });
    } catch (err) {
        await session.abortTransaction();
        console.error('Delete review error:', err);
        return res.status(err.status || 500).json({ 
            success: false, 
            error: err.message || 'Failed to delete review' 
        });
    } finally {
        session.endSession();
    }
}

// Call this when a review is deleted to clean up references in user models
export async function handleReviewDeletionCleanup(reviewId, session) {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return;

    const updateOps = {
        $pull: {
            reviewLikesByMe: reviewId,
            reviewDislikesByMe: reviewId,
        },
    };

    const userModels = [User, Influencer, Store, EventCompany, ProductionHouse];
    
    await Promise.all(
        userModels.map((Model) => Model.updateMany({}, updateOps, { session }))
    );
}