import {
  responseMessages,
  sendError,
  sendSuccess,
} from "../../helpers/other/Req_Res_Search_function.js";
import {
  uploadFolderToR2,
  getSignedUrl,
  uploadFileToR2,
} from "../../helpers/cloudflareUtils/index.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import staticData from "../../data/static_data.js";
import influencerMiddleware from "../../middlewares/influencerMiddleware.js";
import productionHouseMiddleware from "../../middlewares/productionHouseMiddleware.js";
import storeMiddleware from "../../middlewares/storeMiddleware.js";
import eventCompanyMiddleware from "../../middlewares/eventCompanyMiddleware.js";
import userMiddleware from "../../middlewares/userMiddleware.js";
import postUploadModel from "../../models/postUpload.model.js";
import Influencer from "../../models/influencer.model.js";
import ProductionHouse from "../../models/productionHouse.model.js";
import EventCompany from "../../models/eventCompany.model.js";
import Store from "../../models/store.model.js";
import User from "../../models/users.model.js";
import handleCreateNew from "../../helpers/crudHelpers/new/handleCreateNew.js";
import MovieReviewContent from "../../models/productionhouse/movieReviewContent.model.js";
import MovieReviewContentModel from "../../models/productionhouse/movieReviewContent.model.js";
import userDifferentRoleManagementController from "../user/userDifferentRoleManagementController.js";
import handleUpdateNew2 from "../../helpers/crudHelpers/new/UpdateNew2.js";

// Helper function to convert video to HLS format
const convertToHLS = (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });
    const command = `ffmpeg -i ${inputPath} -profile:v baseline -level 3.0 -start_number 0 -hls_time 4 -hls_list_size 0 -f hls ${outputDir}/output.m3u8`;
    exec(command, (err) => (err ? reject(err) : resolve()));
  });
};

// Helper function to extract thumbnail from video
const extractThumbnail = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -ss 00:00:01 -i ${inputPath} -vframes 1 -q:v 2 ${outputPath}`;
    exec(command, (err) => (err ? reject(err) : resolve()));
  });
};

// Helper function to delete folder recursively
const deleteFolderRecursive = async (folderPath) => {
  try {
    await fs.promises.rm(folderPath, { recursive: true, force: true });
  } catch (err) {}
};

const newUpload = async (req, res) => {
  try {
    const userData = req.user.userData;

    const skipArr = [];
    const extraObj = {
      productionHouseId: userData._id,
    };
    const { genres, castings, crews, contentTypes } = req.body;
    if (genres) {
      skipArr.push("genres");
      extraObj["genres"] = JSON.parse(genres);
    }
    if (castings) {
      skipArr.push("castings");
      extraObj["castings"] = JSON.parse(castings);
    }
    if (crews) {
      skipArr.push("crews");
      extraObj["crews"] = JSON.parse(crews);
    }
    if (contentTypes) {
      skipArr.push("contentTypes");
      extraObj["contentTypes"] = JSON.parse(contentTypes);
    }

    const isUploaded = await handleCreateNew(
      req,
      MovieReviewContentModel,
      skipArr,
      extraObj,
      ""
    );
    if (isUploaded.message === "success") {
      return sendSuccess(res, 200, isUploaded.data);
    }

    return sendError(res, 200, "Something went wrong! Please try again.");
  } catch (error) {
    // console.log("catch  : ", error.message);

    return sendError(res, 200, "Something went wrong! Please try again.");
  }
};

const updateUpload = async (req, res) => {
  try {
    const { contentId } = req.params;

    const skipArr = [];
    const extraObj = {};
    const { genres, castings, crews, contentTypes } = req.body;
    if (genres) {
      skipArr.push("genres");
      extraObj["genres"] = JSON.parse(genres);
    }
    if (castings) {
      skipArr.push("castings");
      extraObj["castings"] = JSON.parse(castings);
    }
    if (crews) {
      skipArr.push("crews");
      extraObj["crews"] = JSON.parse(crews);
    }
    if (contentTypes) {
      skipArr.push("contentTypes");
      extraObj["contentTypes"] = JSON.parse(contentTypes);
    }

    const isUpdated = await handleUpdateNew2(
      req,
      MovieReviewContentModel,
      skipArr,
      extraObj,
      "",
      {
        _id: contentId,
      }
    );
    if (isUpdated.message === "success") {
      return sendSuccess(res, 200, isUpdated.data);
    }

    return sendError(res, 200, "Something went wrong! Please try again.");
  } catch (error) {
    // console.log("catch  : ", error.message);

    return sendError(res, 200, "Something went wrong! Please try again.");
  }
};

// Main upload handler function
const handleUpload = async (req, res) => {
  try {
    // Check if there are files in the request
    if (!req.files || Object.keys(req.files).length === 0) {
      //   return res
      //     .status(400)
      //     .json({ success: false, message: "No files uploaded" });
      return sendError(res, responseMessages.error.common, "No files uploaded");
    }

    // Get the uploaded file (first file if multiple)
    const uploadedFile = req.files.file || Object.values(req.files)[0];
    const originalFilename = uploadedFile.name;
    const fileExtension = path.extname(originalFilename).toLowerCase();

    // Create a unique ID and filename with timestamp
    const uniqueId = Date.now().toString();
    const filename = `${uniqueId}${fileExtension}`;

    // Create temporary directory if it doesn't exist
    const tempDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save file temporarily
    const tempFilePath = path.join(tempDir, filename);

    await new Promise((resolve, reject) => {
      uploadedFile.mv(tempFilePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Check if the file is a video (based on common video extensions)
    const videoExtensions = [
      ".mp4",
      ".mov",
      ".avi",
      ".mkv",
      ".webm",
      ".flv",
      ".wmv",
      ".m4v",
    ];
    const isVideo = videoExtensions.includes(fileExtension);

    // Different handling based on file type
    if (isVideo) {
      // Process video files (convert to HLS and extract thumbnail)
      const outputDir = `output/${uniqueId}`;
      const thumbnailPath = `${outputDir}/thumbnail.jpg`;

      // Convert video to HLS format
      await convertToHLS(tempFilePath, outputDir);

      // Extract thumbnail from video
      await extractThumbnail(tempFilePath, thumbnailPath);

      // Upload processed files to R2 in chunks
      await uploadFolderToR2(outputDir, `videos/${uniqueId}`);

      // Cleanup temporary files
      await fs.promises.unlink(tempFilePath);
      await fs.promises.unlink(thumbnailPath);
      await deleteFolderRecursive(outputDir);

      //   // Return success response with video information
      //   return res.status(200).json({
      //     success: true,
      //     message: "Video uploaded and processed successfully",
      //     fileInfo: {
      //       originalName: originalFilename,
      //       videoUrl: getSignedUrl(`videos/${uniqueId}/output.m3u8`),
      //       thumbnailUrl: getSignedUrl(`videos/${uniqueId}/thumbnail.jpg`),
      //       type: "video",
      //     },
      //   });

      const { currentUser, currentUserToken, title } = req.body;

      const _userTokenData =
        await userDifferentRoleManagementController.getTokenUserData(
          currentUser,
          currentUserToken
        );
      let profileId = _userTokenData.userData._id;

      const rawHashTags = req.body.hashTags || "";
      const caption = req.body.caption || "";

      // Step 1: Extract hashtags from rawHashTags field (comma or space separated)
      const parsedFromHashTagsField = rawHashTags
        .split(/[\s,]+/) // split by space or comma
        .map((tag) => tag.trim())
        .filter((tag) => tag.startsWith("#") && tag.length > 1);

      // Step 2: Extract hashtags from caption using regex
      const parsedFromCaption = (caption.match(/#\w+/g) || []).map((tag) =>
        tag.trim()
      );

      // Step 3: Combine and get unique hashtags
      const combinedHashTags = [
        ...new Set([...parsedFromHashTagsField, ...parsedFromCaption]),
      ];

      const isAdded = await postUploadModel.create({
        postType: req.body.postType,
        userType: currentUser, // staticData.userProfiles
        postUserCategories: [],
        userId: _userTokenData.userData._id,
        //---------- post related
        fileUrl: `videos/${uniqueId}/output.m3u8`,
        thumbnailUrl: `videos/${uniqueId}/thumbnail.jpg`,
        fileType: "chunk",
        type: "video",
        // - post extra fileds
        postTitle: title,
        caption: caption,
        hashTags: combinedHashTags,
        //---------- post related
      });

      // console.log(isAdded);
      // 2) If created, increment postCount
      if (isAdded) {
        const modelMap = {
          user: User,
          influencer: Influencer,
          productionHouse: ProductionHouse,
          eventCompany: EventCompany,
          store: Store,
        };
        const ProfileModel = modelMap[currentUser];
        // bump the counter
        await ProfileModel.findByIdAndUpdate(profileId, {
          $inc: { postCount: 1 },
        });
      }

      if (isAdded) {
        return sendSuccess(res, responseMessages.success.common, {
          fileInfo: {
            originalName: originalFilename,
            videoUrl: getSignedUrl(`videos/${uniqueId}/output.m3u8`),
            thumbnailUrl: getSignedUrl(`videos/${uniqueId}/thumbnail.jpg`),
            type: "video",
          },
        });
      } else {
        return sendError(
          res,
          responseMessages.error.common,
          "Failed saving uploaded file"
        );
      }
    } else {
      // For non-video files, upload directly to R2
      const r2FilePath = `files/${uniqueId}${fileExtension}`;

      // Upload file to Cloudflare R2
      const uploadResult = await uploadFileToR2(
        tempFilePath,
        r2FilePath,
        uploadedFile.mimetype
      );
      // console.log(uploadResult);

      // console.log("File uploaded to R2:", uploadResult);

      // Generate a signed URL for accessing the file
      const fileUrl = getSignedUrl(r2FilePath);

      // Delete the temporary file
      fs.unlinkSync(tempFilePath);

      //   // Return success response with file information
      //   return res.status(200).json({
      //     success: true,
      //     message: "File uploaded successfully",
      //     fileInfo: {
      //       originalName: originalFilename,
      //       filename: filename,
      //       fileUrl: fileUrl,
      //       size: uploadedFile.size,
      //       mimetype: uploadedFile.mimetype,
      //       type: 'document'
      //     }
      //   });

      return sendSuccess(res, responseMessages.success.common, {
        fileInfo: {
          originalName: originalFilename,
          filename: filename,
          fileUrl: fileUrl,
          size: uploadedFile.size,
          mimetype: uploadedFile.mimetype,
          type: "document",
        },
      });
    }
  } catch (err) {
    // console.error("❌ Error in /upload:", err);
    // return res.status(500).json({
    //   success: false,
    //   message: "File upload failed",
    //   error: err.message,
    // });
    return sendError(res, responseMessages.error.common, "File upload failed");
  }
};

const getUploadPosts = async (req, res, next) => {
  try {
    // 1. Parse pagination params
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    // 2. Fetch active posts, newest first
    const posts = await postUploadModel
      .find({ status: "active" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 3. Regenerate signed URLs
    const refreshed = posts.map((post) => ({
      ...post,
      fileUrl: getSignedUrl(post.fileUrl),
      thumbnailUrl: post.thumbnailUrl ? getSignedUrl(post.thumbnailUrl) : null,
    }));

    // 4. Send response
    res.json({ success: true, data: refreshed });
  } catch (err) {
    next(err);
  }
};

// router.post("/upload", upload.single("video"), );

// async (req, res) => {
//     try {
//       const filePath = req.file.path;
//       const id = Date.now().toString();
//       const outputDir = `output/${id}`;
//       const thumbnailPath = `${outputDir}/thumbnail.jpg`;

//       await convertToHLS(filePath, outputDir);
//       await extractThumbnail(filePath, thumbnailPath);
//       await uploadFolderToR2(outputDir, `videos/${id}`);

//       // Cleanup temporary files
//       await fs.promises.unlink(filePath);               // Delete uploaded file
//       await fs.promises.unlink(thumbnailPath);          // Delete thumbnail
//       await deleteFolderRecursive(outputDir);           // Delete output folder

//       res.json({
//         success: true,
//         videoUrl: getSignedUrl(`videos/${id}/output.m3u8`),
//         thumbnailUrl: getSignedUrl(`videos/${id}/thumbnail.jpg`),
//       });
//     } catch (err) {
//       console.error("❌ Error in /upload:", err);
//       res.status(500).send("Video processing failed");
//     }
//   }

const productionHouseContentRatingController = {
  handleUpload,
  getUploadPosts,
  newUpload,
  updateUpload,
};

export default productionHouseContentRatingController;
