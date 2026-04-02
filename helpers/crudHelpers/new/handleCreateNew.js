// import path, { dirname } from "path";
// import { fileURLToPath } from "url";
// import getTypeFolder from "../getFileType.js";

// const __dirname = dirname(fileURLToPath(import.meta.url));

// const handleCreateNew = async (
//   req,
//   Model,
//   skipArray = [],
//   extra = {},
//   filesPath = "",
//   randomNumber = null,
//   successCallback = null
// ) => {
//   const data = req.body;
//   const files = req.files || {};

//   if (Object.keys(data).length < 1 && Object.keys(files).length < 1)
//     return { message: "No data or files provided", data: [] };

//   try {
//     let updatableData = {};

//     // Process form data
//     for (const key in data) {
//       if (
//         !skipArray.includes(key) &&
//         typeof data[key] === "string" &&
//         data[key].trim() !== ""
//       ) {
//         updatableData[key] = data[key];
//       }
//     }

//     // Process file uploads
//     const filePromises = Object.entries(files).map(([key, file], index) => {
//       return new Promise((resolve) => {
//         const typeFolder = getTypeFolder(file);

//         if (!typeFolder) return resolve({ error: `${key}_fileTypeError` });

//         const uniqueNumber = randomNumber || Math.floor(Math.random() * 10000);
//         let extension = file.mimetype.split("/")[1] || "bin";
//         if (extension === "octet-stream")
//           extension = typeFolder === "images" ? "png" : "mp4";

//         const filename = `${file.md5}${uniqueNumber}.${extension}`;
//         const movePath = path.join(
//           __dirname,
//           `../../../assets/${filesPath}${typeFolder}/${filename}`
//         );

//         const urlPath = `${process.env.LIVEURL}/${filesPath}${typeFolder}/${filename}`;

//         try {
//           file.mv(movePath, (err) => {
//             if (err) return resolve({ error: `File upload error for ${key}` });
//             updatableData[key] = urlPath;
//             resolve({ success: true });
//           });
//         } catch (err) {
//           resolve({ error: `Unexpected error while saving ${key}` });
//         }
//       });
//     });

//     const fileResults = await Promise.all(filePromises);
//     const errors = fileResults.filter((r) => r.error);

//     if (errors.length) return { message: "File upload error", data: errors };

//     // Merge and save
//     updatableData = { ...updatableData, ...extra, Date: new Date() };
//     const created = await Model.create(updatableData);

//     return created
//       ? successCallback
//         ? successCallback(created)
//         : { message: "success", data: created }
//       : { message: "Database save error", data: [] };
//   } catch (error) {
//     return { message: "An error occurred", data: [], detail: error.message };
//   }
// };

// export default handleCreateNew;


import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import getTypeFolder from "../getFileType.js";
import AWS from "aws-sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));

const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: 'auto',
  s3ForcePathStyle: true,
  httpOptions: {
    timeout: 300000,
    connectTimeout: 10000,
  },
  maxRetries: 3,
});

const bucketName = process.env.R2_BUCKET;

const handleCreateNew = async (
  req,
  Model,
  skipArray = [],
  extra = {},
  filesPath = "",
  randomNumber = null,
  successCallback = null
) => {
  const data = req.body;
  const files = req.files || {};

  if (Object.keys(data).length < 1 && Object.keys(files).length < 1)
    return { message: "No data or files provided", data: [] };

  try {
    let updatableData = {};

    // Handle form data
    for (const key in data) {
      if (
        !skipArray.includes(key) &&
        typeof data[key] === "string" &&
        data[key].trim() !== ""
      ) {
        updatableData[key] = data[key].trim();
      }
    }

    // Handle file uploads to R2
    const filePromises = Object.entries(files).map(([key, file]) => {
      return new Promise(async (resolve) => {
        const typeFolder = getTypeFolder(file);
        if (!typeFolder) return resolve({ error: `${key}_fileTypeError` });

        const uniqueNumber = randomNumber || Math.floor(Math.random() * 10000);
        let extension = file.mimetype.split("/")[1] || "bin";
        if (extension === "octet-stream") {
          extension = typeFolder === "images" ? "png" : "mp4";
        }

        const fileName = `${file.md5}-${uniqueNumber}.${extension}`;
        const objectKey = `${filesPath}${typeFolder}/${fileName}`;

        const uploadParams = {
          Bucket: bucketName,
          Key: objectKey,
          Body: file.data,
          ContentType: file.mimetype,
          ACL: 'public-read',
        };

        try {
          await s3.upload(uploadParams).promise();
          updatableData[key] = objectKey; // Save key or use full URL if needed
          resolve({ success: true });
        } catch (err) {
          console.error(`R2 Upload Error [${key}]`, err);
          resolve({ error: `Upload failed for ${key}` });
        }
      });
    });

    const fileResults = await Promise.all(filePromises);
    const errors = fileResults.filter((r) => r.error);
    if (errors.length) return { message: "File upload error", data: errors };

    // Merge and save
    updatableData = { ...updatableData, ...extra, Date: new Date() };
    const created = await Model.create(updatableData);

    return created
      ? successCallback
        ? successCallback(created)
        : { message: "success", data: created }
      : { message: "Database save error", data: [] };
  } catch (error) {
    return { message: "An error occurred", data: [], detail: error.message };
  }
};

export default handleCreateNew;
