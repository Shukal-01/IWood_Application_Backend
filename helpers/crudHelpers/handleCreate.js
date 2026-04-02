// import path, { dirname } from "path";
// import { fileURLToPath } from "url";
// import {
//   responseMessages,
//   sendError,
//   sendSuccess,
// } from "../other/Req_Res_Search_function.js";
// import getTypeFolder from "./getFileType.js";

// const __dirname = dirname(fileURLToPath(import.meta.url));

// const handleCreate = async (
//   req,
//   res,
//   Model,
//   skipArray,
//   extra,
//   filesPath,
//   randomNumber,
//   successCallback
// ) => {
//   const data = req.body;
//   const files = req.files;

//   if (Object.keys(data).length < 1 && !files) {
//     return sendError(
//       res,
//       responseMessages.error.common,
//       "No data or files provided"
//     );
//   }

//   try {
//     let updatableData = {};

//     for (const key in data) {
//       let isUpdatable = !skipArray.includes(key);
//       if (isUpdatable && data[key]) {
//         try {
//           if (data[key].trim() !== "") {
//             updatableData[key] = data[key];
//           }
//         } catch (error) {
//           updatableData[key] = data[key];
//         }
//       }
//     }

//     let promise_all;

//     if (files) {
//       promise_all = Promise.all(
//         Object.entries(files).map((value) => {
//           return new Promise((resolve) => {
//             const fileField = value[0];
//             const fileData = value[1];

//             let VideoOrImage = getTypeFolder(fileData);

//             if (!VideoOrImage) return resolve("error");

//             if (!randomNumber || (randomNumber + "").length <= 2) {
//               randomNumber = Math.floor(Math.random() * 10000);
//             }

//             let fileName = `${fileData.md5}${randomNumber}.${
//               fileData.mimetype.split("/")[1]
//             }`;

//             if (fileName.includes("octet-stream")) {
//               const replacement = VideoOrImage === "images" ? "png" : "mp4";
//               fileName = fileName.replace("octet-stream", replacement);
//             }

//             const movePath = path.join(
//               __dirname,
//               `../../assets/${filesPath}${VideoOrImage}/${fileName}`
//             );
//             const urlPath = `${process.env.LIVEURL}/${filesPath}${VideoOrImage}/${fileName}`;

//             fileData.mv(movePath, async (err) => {
//               if (err) {
//                 resolve("notOk");
//               } else {
//                 updatableData[fileField] = urlPath;
//                 resolve("ok");
//               }
//             });
//           });
//         })
//       );
//     } else {
//       promise_all = Promise.resolve("ok");
//     }

//     promise_all.then(async () => {
//       updatableData = { ...updatableData, ...extra, Date: new Date() };

//       try {
//         const isAdded = await Model.create(updatableData);

//         if (isAdded) {
//           if (successCallback) {
//             try {
//               return successCallback(isAdded);
//             } catch (callbackErr) {
//               return sendError(
//                 res,
//                 callbackErr.statusCode || responseMessages.error.common,
//                 callbackErr.message || "Callback error"
//               );
//             }
//           } else {
//             return sendSuccess(
//               res,
//               responseMessages.success.create,
//               isAdded,
//               "Created successfully"
//             );
//           }
//         } else {
//           return sendError(
//             res,
//             responseMessages.error.common,
//             "Creation failed"
//           );
//         }
//       } catch (error) {
//         return sendError(
//           res,
//           error.code === 11000
//             ? responseMessages.error.common
//             : responseMessages.error.common
//         );
//       }
//     });
//   } catch (err) {
//     return sendError(res, responseMessages.error.serverError);
//   }
// };

// export default handleCreate;


import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import AWS from 'aws-sdk';
import { responseMessages, sendError, sendSuccess } from '../other/Req_Res_Search_function.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: 'auto',
  s3ForcePathStyle: true,
});

const bucketName = process.env.R2_BUCKET;
// console.log(`R2 bucket set to: ${bucketName}`);

const handleCreate = async (
  req,
  res,
  Model,
  skipArray,
  extra,
  filesPath,
  randomNumber,
  successCallback
) => {
  // console.log('handleCreate invoked');
  const data = req.body;
  const files = req.files;
  // console.log('Request body data:', data);
  // console.log('Request files:', files);

  if (Object.keys(data).length < 1 && !files) {
    // console.log('No data or files provided, sending error');
    return sendError(res, responseMessages.error.common, 'No data or files provided');
  }

  try {
    let updatableData = {};
    // console.log('Filtering updatable fields');
    for (const key in data) {
      // console.log(`Checking field: ${key}`);
      if (!skipArray.includes(key) && data[key] != null && String(data[key]).trim() !== '') {
        updatableData[key] = data[key];
        // console.log(`Added field to updatableData: ${key} = ${data[key]}`);
      } else {
        // console.log(`Skipped field: ${key}`);
      }
    }

    let promiseAll;
    if (files) {
      // console.log('Files detected, starting upload promises');
      promiseAll = Promise.all(
        Object.entries(files).map(([fieldName, fileData]) => {
          // console.log(`Preparing upload for field: ${fieldName}`);
          return new Promise((resolve, reject) => {
            let folder = '';
            if (fileData.mimetype && fileData.mimetype.startsWith('video/')) {
              folder = 'videos/';
            } else if (fileData.mimetype && fileData.mimetype.startsWith('image/')) {
              folder = 'images/';
            } else {
              folder = 'others/';
              console.warn(`Unsupported or missing mimetype: ${fileData.mimetype}`);
            }

            if (!randomNumber || String(randomNumber).length <= 2) {
              randomNumber = Math.floor(Math.random() * 10000);
              // console.log(`Generated new randomNumber: ${randomNumber}`);
            }

            const ext = fileData.mimetype.split('/')[1];
            const fileName = `${fileData.md5}${randomNumber}.${ext}`;
            const objectKey = `${folder}${fileName}`;
            // console.log(`Computed objectKey: ${objectKey}`);

            s3.upload(
              {
                Bucket: bucketName,
                Key: objectKey,
                Body: fileData.data,
                ContentType: fileData.mimetype,
                ACL: 'public-read',
              },
              (err, uploadResult) => {
                if (err) {
                  console.error('R2 upload error:', err);
                  return reject(sendError(res, responseMessages.error.common, 'R2UploadError'));
                }
                // console.log('R2 upload successful:', uploadResult.Location);
                const url = `${objectKey}`;
                updatableData[fieldName] = url;
                // console.log(`Set updatableData[${fieldName}] = ${url}`);
                resolve();
              }
            );
          });
        })
      );
    } else {
      // console.log('No files to upload, skipping upload step');
      promiseAll = Promise.resolve();
    }

    promiseAll
      .then(async () => {
        // console.log('All uploads resolved, merging extra and timestamp');
        updatableData = { ...updatableData, ...extra, Date: new Date() };
        // console.log('Final updatableData:', updatableData);
        try {
          // console.log('Creating model entry');
          const created = await Model.create(updatableData);
          // console.log('Model.create result:', created);
          if (created) {
            // console.log('Creation succeeded');
            if (successCallback) {
              // console.log('Invoking successCallback');
              try {
                return successCallback(created);
              } catch (cbErr) {
                console.error('Callback error:', cbErr);
                return sendError(
                  res,
                  cbErr.statusCode || responseMessages.error.common,
                  cbErr.message || 'Callback error'
                );
              }
            }
            // console.log('Sending success response');
            return sendSuccess(res, responseMessages.success.create, created, 'Created successfully');
          }
          // console.log('Creation failed without exception');
          return sendError(res, responseMessages.error.common, 'Creation failed');
        } catch (dbErr) {
          console.error('Database error during create:', dbErr);
          return sendError(
            res,
            dbErr.code === 11000 ? responseMessages.error.common : responseMessages.error.common
          );
        }
      })
      .catch((uploadErr) => {
        console.error('Error in upload promise:', uploadErr);
      });
  } catch (outerErr) {
    console.error('Unexpected error in handleCreate:', outerErr);
    return sendError(res, responseMessages.error.serverError);
  }
};

export default handleCreate;