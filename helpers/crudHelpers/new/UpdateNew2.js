// import path, { dirname } from "path";
// import { fileURLToPath } from "url";
// import getTypeFolder from "../getFileType.js";

// const __dirname = dirname(fileURLToPath(import.meta.url));

// const handleUpdateNew2 = async (
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
//   if (Object.keys(data).length < 1 && !files) {
//     // console.log("No data or files to update");
//     return { message: "error", error: "No data or files to update" };
//   }

//   try {
//     let updatableData = {};

//     // Process text fields
//     for (const key in data) {
//       if (!skipArray.includes(key)) {
//         updatableData[key] = data[key];
//       }
//     }

//     let promimse_all;
//     if (files) {
//       promimse_all = Promise.all(
//         Object.entries(files).map((value, index) => {
//           return new Promise((resolve, reject) => {
//             let FilesArray = Object.keys(files);
//             // console.log(FilesArray);
//             if (FilesArray.length > 0) {
//               const file = value[1];
//               let VideoOrImage = getTypeFolder(file);

//               if (!VideoOrImage) return resolve("unsupported");

//               const randomNumber = Math.floor(Math.random() * 10000);
//               let fileName = `${file.md5}${randomNumber}.${
//                 file.mimetype.split("/")[1]
//               }`;

//               if (fileName.includes("octet-stream")) {
//                 const replacement = VideoOrImage === "images" ? "png" : "mp4";
//                 fileName = fileName.replace("octet-stream", replacement);
//               }

//               const movePath = path.join(
//                 __dirname,
//                 `../../../assets/${filesPath}${VideoOrImage}/${fileName}`
//               );
//               let urlPath =
//                 process.env.LIVEURL +
//                 `/${filesPath}/${VideoOrImage}/${fileName}`;

//               value[1].mv(movePath, async (err) => {
//                 if (err) {
//                   // console.log("File move failed:", err);
//                   reject("notOk");
//                 } else {
//                   updatableData[value[0]] = urlPath;
//                   // console.log("File moved successfully:", urlPath);
//                   resolve("ok");
//                 }
//               });
//             }
//           });
//         })
//       );
//     } else {
//       promimse_all = Promise.resolve("ok");
//     }

//     // Wait for file upload promises to resolve before proceeding
//     await promimse_all;

//     // Add extra data to the updatableData object
//     updatableData = { ...updatableData, ...extra };

//     try {
//       const isUpdated = await Model.findOneAndUpdate(
//         UpdateObject,
//         updatableData,
//         { new: true }
//       );

//       if (isUpdated) {
//         return { data: isUpdated, message: "success" };
//       } else {
//         // console.log("Update failed: No data found to update");
//         return { message: "error", error: "Update failed" };
//       }
//     } catch (error) {
//       console.error("Error during update:", error.message);
//       return { message: "error", error: error.message };
//     }
//   } catch (err) {
//     console.error("Error during update:", err.message);
//     return { message: "error", error: err.message };
//   }
// };

// export default handleUpdateNew2;


import AWS from "aws-sdk";
import { fileURLToPath } from "url";
import { dirname } from "path";
import getTypeFolder from "../getFileType.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Setup Cloudflare R2 S3-compatible client
const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: "auto",
  s3ForcePathStyle: true,
});

const bucketName = process.env.R2_BUCKET;

const handleUpdateNew2 = async (
  req,
  Model,
  skipArray,
  extra,
  filesPath,
  UpdateObject
) => {
  const data = req.body;
  const files = req.files;

  if (Object.keys(data).length < 1 && !files) {
    return { message: "error", error: "No data or files to update" };
  }

  try {
    let updatableData = {};

    // Extract updatable text fields
    for (const key in data) {
      if (!skipArray.includes(key)) {
        updatableData[key] = data[key];
      }
    }

    let filePromises;

    if (files) {
      filePromises = Promise.all(
        Object.entries(files).map(([field, file]) => {
          return new Promise(async (resolve, reject) => {
            try {
              const fileObj = Array.isArray(file) ? file[0] : file;
              const fileType = getTypeFolder(fileObj);
              if (!fileType) return resolve("unsupported");

              const randomNumber = Math.floor(Math.random() * 10000);
              let ext = fileObj.mimetype.split("/")[1];
              let fileName = `${fileObj.md5}${randomNumber}.${ext}`;

              if (fileName.includes("octet-stream")) {
                const replacement = fileType === "images" ? "png" : "mp4";
                fileName = fileName.replace("octet-stream", replacement);
              }

              const objectKey = `${filesPath}${fileType}/${fileName}`;
              const fileURL = `${process.env.LIVEURL}/${objectKey}`;

              // Upload to Cloudflare R2
              const uploadParams = {
                Bucket: bucketName,
                Key: objectKey,
                Body: fileObj.data,
                ContentType: fileObj.mimetype,
                ACL: "public-read",
              };

              await s3.upload(uploadParams).promise();

              updatableData[field] = fileURL;
              resolve("ok");
            } catch (err) {
              console.error("Upload failed:", err);
              reject("upload failed");
            }
          });
        })
      );
    } else {
      filePromises = Promise.resolve("ok");
    }

    await filePromises;

    // Merge with extra fields
    updatableData = { ...updatableData, ...extra };

    const isUpdated = await Model.findOneAndUpdate(
      UpdateObject,
      updatableData,
      { new: true }
    );

    if (isUpdated) {
      return { data: isUpdated, message: "success" };
    } else {
      return { message: "error", error: "Update failed" };
    }
  } catch (err) {
    console.error("Error during update:", err.message);
    return { message: "error", error: err.message };
  }
};

export default handleUpdateNew2;
