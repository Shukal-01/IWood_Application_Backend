  // import sharp from "sharp";
  // import fs from "fs";
  // import path, { dirname } from "path";
  // import { fileURLToPath } from "url";
  // import getTypeFolder from "./getFileType.js";

  // const __dirname = dirname(fileURLToPath(import.meta.url));

  // const handleUpdate = async (
  //   req,
  //   res,
  //   Model,
  //   skipArray,
  //   extra,
  //   filesPath,
  //   UpdateObject
  // ) => {
  //   const data = req.body;
  //   const files = req.files;

  //   // Check if data or files are provided
  //   if (
  //     Object.keys(data).length < 1 &&
  //     (!files || Object.keys(files).length < 1)
  //   ) {
  //     return res.status(400).json({ message: "No data provided" });
  //   }

  //   try {
  //     // Filter out non-updatable fields
  //     const updatableData = Object.keys(data).reduce((acc, key) => {
  //       if (
  //         !skipArray.includes(key) &&
  //         data[key]?.trim() &&
  //         data[key] !== undefined &&
  //         data[key] !== "undefined" &&
  //         data[key] !== null
  //       ) {
  //         acc[key] = data[key].trim();
  //       }
  //       return acc;
  //     }, {});

  //     // Process file updates if files are provided
  //     let filePromises = files
  //       ? Promise.all(
  //           Object.entries(files).map(async ([key, file]) => {
  //             if (!file) {
  //               return "ok"; // Skip if no new file is provided
  //             }

  //             // Fetch the previous file information from the database
  //             const previousData = await Model.findOne(UpdateObject);
  //             const previousFilePath = previousData ? previousData[key] : null;

  //             // Check if the previous file is valid
  //             if (
  //               !previousFilePath ||
  //               previousFilePath.includes("undefined") ||
  //               !fs.existsSync(
  //                 path.join(
  //                   __dirname,
  //                   `../../assets/${previousFilePath.replace(
  //                     `${process.env.LIVEURL}/`,
  //                     ""
  //                   )}`
  //                 )
  //               )
  //             ) {
  //               // Skip old file deletion, and add the new file only
  //               const mimeType = getTypeFolder(file);

  //               if (!mimeType) {
  //                 return "error";
  //               }

  //               const isImage = mimeType.includes("image");

  //               const timestamp = Date.now(); // current timestamp
  //               const newFileName_old = `${file.md5}-${timestamp}`;
  //               const newFileName = newFileName_old.replace(/\s+/g, "_");

  //               const movePath = path.join(
  //                 __dirname,
  //                 `../../assets/${filesPath}${
  //                   isImage ? "images" : "files"
  //                 }/${newFileName}`
  //               );

  //               if (isImage) {
  //                 // Convert to WebP and save
  //                 const webpFileName =
  //                   newFileName.replace(/\.[^/.]+$/, "") + ".webp";
  //                 const webpMovePath = path.join(
  //                   __dirname,
  //                   `../../assets/${filesPath}images/${webpFileName}`
  //                 );
  //                 const urlPath = `${process.env.LIVEURL}/${filesPath}images/${webpFileName}`;

  //                 // Convert and save the image
  //                 await sharp(file.data)
  //                   .webp({ quality: 80 })
  //                   .toFile(webpMovePath);

  //                 updatableData[key] = urlPath;
  //                 return "ok";
  //               } else {
  //                 // Handle non-image files
  //                 const urlPath = `${process.env.LIVEURL}/${filesPath}files/${newFileName}`;
  //                 await file.mv(movePath);
  //                 updatableData[key] = urlPath;
  //                 return "ok";
  //               }
  //             }

  //             // If valid previous file exists, proceed with deletion and update
  //             const previousFileName = previousFilePath.split("/").pop();
  //             const fileToDelete = path.join(
  //               __dirname,
  //               `../../assets/${previousFilePath.replace(
  //                 `${process.env.LIVEURL}/`,
  //                 ""
  //               )}`
  //             );

  //             fs.unlink(fileToDelete, (err) => {
  //               if (err && err.code !== "ENOENT") {
  //                 console.error(`Failed to delete file: ${fileToDelete}`, err);
  //               }
  //             });

  //             // Process new file upload
  //             const mimeType = file.mimetype;
  //             const isImage = mimeType.includes("image");
  //             const movePath = path.join(
  //               __dirname,
  //               `../../assets/${filesPath}${
  //                 isImage ? "images" : "files"
  //               }/${previousFileName}`
  //             );

  //             if (isImage) {
  //               const webpFileName =
  //                 previousFileName.replace(/\.[^/.]+$/, "") + ".webp";
  //               const webpMovePath = path.join(
  //                 __dirname,
  //                 `../../assets/${filesPath}images/${webpFileName}`
  //               );
  //               const urlPath = `${process.env.LIVEURL}/${filesPath}images/${webpFileName}`;

  //               await sharp(file.data).webp({ quality: 80 }).toFile(webpMovePath);

  //               updatableData[key] = urlPath;
  //             } else {
  //               const urlPath = `${process.env.LIVEURL}/${filesPath}files/${previousFileName}`;
  //               await file.mv(movePath);
  //               updatableData[key] = urlPath;
  //             }

  //             return "ok";
  //           })
  //         )
  //       : Promise.resolve("ok");

  //     await filePromises;

  //     const updatedData = { ...updatableData, ...extra };

  //     try {
  //       const isUpdated = await Model.findOneAndUpdate(
  //         UpdateObject,
  //         updatedData,
  //         { new: true }
  //       );

  //       if (isUpdated) {
  //         return res.status(200).json({ message: "success", data: isUpdated });
  //       } else {
  //         return res.status(400).json({ message: "error", data: [] });
  //       }
  //     } catch (error) {
  //       return res.status(400).json({
  //         message: "error",
  //         data: [],
  //         detail:
  //           error.code === 11000
  //             ? "Country Code Already Taken!"
  //             : "Failed to update data",
  //       });
  //     }
  //   } catch (err) {
  //     return res
  //       .status(500)
  //       .json({ message: "error", data: [], detail: "Failed to update data" });
  //   }
  // };


import AWS from 'aws-sdk';
import { responseMessages, sendError, sendSuccess } from '../other/Req_Res_Search_function.js';
import mongoose from 'mongoose';

const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: 'auto',
  s3ForcePathStyle: true,
  httpOptions: {
    timeout: 300000, // 5 minutes
    connectTimeout: 10000, // 10 seconds
  },
  maxRetries: 3,
});

const bucketName = process.env.R2_BUCKET;

const handleUpdate = async (
  req,
  res,
  Model,
  skipArray,
  extra,
  filesPath,
  UpdateObject
) => {
  const data = req.body;
  const files = req.files;

  if (Object.keys(data).length < 1 && (!files || Object.keys(files).length < 1)) {
    return sendError(res, responseMessages.error.common, 'No data or files provided');
  }

  try {
    // Filter out non-updatable fields
    // const updatableData = Object.keys(data).reduce((acc, key) => {
    //   if (
    //     !skipArray.includes(key) &&
    //     data[key]?.trim() &&
    //     data[key] !== undefined &&
    //     data[key] !== 'undefined' &&
    //     data[key] !== null
    //   ) {
    //     acc[key] = data[key].trim();
    //   }
    //   return acc;
    // }, {});
    const updatableData = Object.keys(data).reduce((acc, key) => {
  let value = data[key];

  // Handle nested object with _id field
  if (typeof value === "object" && value !== null) {
    if (value._id) {
      value = value._id;
    } else {
      // Skip objects without an _id to prevent [object Object] casting errors
      return acc;
    }
  }

  // If this is an ObjectId field, validate its format
  if (key.toLowerCase().includes("id")) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      console.warn(`Skipping invalid ObjectId for field ${key}:`, value);
      return acc;
    }
  }

  // Add to update only if value is not empty/null/undefined
  if (
    !skipArray.includes(key) &&
    value !== undefined &&
    value !== 'undefined' &&
    value !== null &&
    (typeof value === 'string' ? value.trim() : true)
  ) {
    acc[key] = typeof value === 'string' ? value.trim() : value;
  }

  return acc;
}, {});


    // Process file updates if files are provided
    if (files) {
      const previousData = await Model.findOne(UpdateObject);

      await Promise.all(
        Object.entries(files).map(async ([fieldName, fileData]) => {
          if (!fileData) return;

          // Determine folder based on MIME type
          let folder = '';
          if (fileData.mimetype && fileData.mimetype.startsWith('video/')) {
            folder = 'videos/';
          } else if (fileData.mimetype && fileData.mimetype.startsWith('image/')) {
            folder = 'images/';
          } else {
            folder = 'others/';
          }

          // Generate new file name
          const ext = fileData.mimetype.split('/')[1];
          const fileName = `${fileData.md5}-${Date.now()}.${ext}`;
          const objectKey = `${folder}${fileName}`;

          // Delete previous file if it exists
          if (previousData && previousData[fieldName]) {
            const oldObjectKey = previousData[fieldName];
            try {
              await s3
                .deleteObject({
                  Bucket: bucketName,
                  Key: oldObjectKey,
                })
                .promise();
            } catch (err) {
              console.error(`Failed to delete old file: ${oldObjectKey}`, err);
            }
          }

          // Upload new file using multipart upload
          try {
            const uploadParams = {
              Bucket: bucketName,
              Key: objectKey,
              Body: fileData.data,
              ContentType: fileData.mimetype,
              ACL: 'public-read',
            };

            const uploadResult = await s3.upload(uploadParams).promise();

            updatableData[fieldName] = objectKey;
          } catch (err) {
            console.error('Error uploading file:', err);
            throw err;
          }
        })
      );
    }

    const updatedData = { ...updatableData, ...extra };

    try {
      const isUpdated = await Model.findOneAndUpdate(UpdateObject, updatedData, {
        new: true,
      });

      if (isUpdated) {
        return sendSuccess(res, responseMessages.success.common, isUpdated, 'Updated successfully');
      } else {
        return sendError(res, responseMessages.error.common, 'Update failed');
      }
    } catch (error) {
      console.error('Database update error:', error);
      return sendError(
        res,
        error.code === 11000 ? responseMessages.error.common : responseMessages.error.common,
        error.message || 'Failed to update data'
      );
    }
  } catch (err) {
    console.error('Unexpected error in handleUpdate:', err);
    return sendError(res, responseMessages.error.serverError);
  }
};

export default handleUpdate;
