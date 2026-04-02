// import path, { dirname } from "path";
// import { fileURLToPath } from "url";
// import getTypeFolder from "../getFileType.js";

// const __dirname = dirname(fileURLToPath(import.meta.url));

// const handleUpdate = async (
//   req,
//   Model,
//   skipArray,
//   extra,
//   filesPath,
//   UpdateObject
// ) => {
//   const data = req.body;
//   const files = req.files;

//   // If there's no data or files, return early
//   if (Object.keys(data).length < 1 && !files)
//     return { message: "error", error: "No data or files to update" };

//   try {
//     let updatableData = {};

//     // Process text fields
//     for (const key in data) {
//       if (!skipArray.includes(key)) {
//         updatableData[key] = data[key];
//       }
//     }

//     // Handle file uploads
//     if (files) {
//       const fileProcessingPromises = Object.entries(files).flatMap(
//         ([key, value]) => {
//           const fileArray = Array.isArray(value) ? value : [value];
//           return fileArray.map((file) => {
//             return new Promise((resolve, reject) => {
//               let fileType = getTypeFolder(file);

//               if (!fileType) return resolve("unsupported");

//               const randomNumber = Math.floor(Math.random() * 10000);
//               let fileName = `${file.md5}${randomNumber}.${
//                 file.mimetype.split("/")[1]
//               }`;

//               if (fileName.includes("octet-stream")) {
//                 const replacement = fileType === "images" ? "png" : "mp4";
//                 fileName = fileName.replace("octet-stream", replacement);
//               }

//               const movePath = path.join(
//                 __dirname,
//                 `../../../assets/${filesPath}${fileType}/${fileName}`
//               );
//               const urlPath = `${process.env.LIVEURL}/${filesPath}${fileType}/${fileName}`;

//               file.mv(movePath, (err) => {
//                 if (err) {
//                   console.error("File move error:", err);
//                   resolve("notOk");
//                 } else {
//                   if (!updatableData[fileType]) updatableData[fileType] = [];
//                   updatableData[fileType].push(urlPath);
//                   resolve("ok");
//                 }
//               });
//             });
//           });
//         }
//       );

//       await Promise.all(fileProcessingPromises);
//     }

//     // Merge extra data with updatable data
//     updatableData = { ...updatableData, ...extra };

//     // Perform the update operation
//     const isUpdated = await Model.findOneAndUpdate(
//       UpdateObject,
//       updatableData,
//       { new: true }
//     );

//     if (isUpdated) {
//       return { data: isUpdated, message: "success" };
//     } else {
//       return { message: "error", error: "Update failed" };
//     }
//   } catch (err) {
//     console.error("Error during update:", err.message);
//     return { message: "error", error: err.message };
//   }
// };

// export default handleUpdate;


import AWS from "aws-sdk";
import mongoose from "mongoose";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import getTypeFolder from "../getFileType.js";
import { responseMessages, sendSuccess, sendError } from "../other/Req_Res_Search_function.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: "auto",
  s3ForcePathStyle: true,
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
    return sendError(res, responseMessages.error.common, "No data or files to update");
  }

  try {
    // Prepare updatable data
    const updatableData = Object.keys(data).reduce((acc, key) => {
      let value = data[key];

      if (typeof value === "object" && value !== null) {
        if (value._id) value = value._id;
        else return acc;
      }

      if (key.toLowerCase().includes("id") && !mongoose.Types.ObjectId.isValid(value)) {
        console.warn(`Skipping invalid ObjectId for field ${key}:`, value);
        return acc;
      }

      if (!skipArray.includes(key) && value !== undefined && value !== "undefined" && value !== null) {
        acc[key] = typeof value === "string" ? value.trim() : value;
      }

      return acc;
    }, {});

    const existingDoc = await Model.findOne(UpdateObject);

    // Handle file uploads
    if (files) {
      const uploadTasks = Object.entries(files).flatMap(([key, value]) => {
        const fileArray = Array.isArray(value) ? value : [value];

        return fileArray.map(async (file) => {
          const fileType = getTypeFolder(file);
          if (!fileType) return;

          const ext = file.mimetype.split("/")[1] || "bin";
          const fileName = `${file.md5}-${Date.now()}.${ext}`;
          const objectKey = `${filesPath}${fileType}/${fileName}`;
          const fileURL = `${process.env.LIVEURL}/${objectKey}`;

          // Delete existing image(s)
          const oldUrls = Array.isArray(existingDoc[fileType]) ? existingDoc[fileType] : [existingDoc[fileType]];
          const matchedOldUrl = oldUrls?.find((url) => url?.includes(`/${filesPath}${fileType}/`));
          if (matchedOldUrl) {
            const oldKey = matchedOldUrl.split(`${process.env.LIVEURL}/`)[1];
            try {
              await s3.deleteObject({ Bucket: bucketName, Key: oldKey }).promise();
            } catch (err) {
              console.error(`Failed to delete old file: ${oldKey}`, err);
            }
          }

          // Upload new file
          try {
            const uploadParams = {
              Bucket: bucketName,
              Key: objectKey,
              Body: file.data,
              ContentType: file.mimetype,
              ACL: "public-read",
            };

            await s3.upload(uploadParams).promise();

            if (!updatableData[fileType]) updatableData[fileType] = [];
            updatableData[fileType].push(fileURL);
          } catch (err) {
            console.error("Error uploading file:", err);
            throw err;
          }
        });
      });

      await Promise.all(uploadTasks);
    }

    const finalUpdate = { ...updatableData, ...extra };

    const isUpdated = await Model.findOneAndUpdate(UpdateObject, finalUpdate, { new: true });

    if (isUpdated) {
      return sendSuccess(res, responseMessages.success.common, isUpdated, "Updated successfully");
    } else {
      return sendError(res, responseMessages.error.common, "Update failed");
    }
  } catch (err) {
    console.error("Error during update:", err);
    return sendError(res, responseMessages.error.serverError, err.message);
  }
};

export default handleUpdate;
