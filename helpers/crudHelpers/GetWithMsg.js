// const handleGetWithMsg = async (
//   req,
//   res,
//   Model,
//   find,
//   populateOptionsOrCallbackFn
// ) => {
//   try {
//     const page = parseInt(req.query.page);
//     const limit = parseInt(req.query.limit);

//     let query = Model.find(find);

//     // Populate if not a function
//     if (
//       populateOptionsOrCallbackFn &&
//       typeof populateOptionsOrCallbackFn !== "function"
//     ) {
//       if (Array.isArray(populateOptionsOrCallbackFn)) {
//         for (const pop of populateOptionsOrCallbackFn) {
//           query = query.populate(pop);
//         }
//       } else if (
//         typeof populateOptionsOrCallbackFn === "string" ||
//         typeof populateOptionsOrCallbackFn === "object"
//       ) {
//         query = query.populate(populateOptionsOrCallbackFn);
//       } else {
//         console.warn(
//           "Invalid populateOptions type:",
//           typeof populateOptionsOrCallbackFn
//         );
//       }
//     }

//     // Apply pagination only if page and limit are valid
//     let pagination = null;
//     if (!isNaN(page) && !isNaN(limit)) {
//       const skip = (page - 1) * limit;
//       query = query.skip(skip).limit(limit);

//       const totalCount = await Model.countDocuments(find);
//       pagination = {
//         totalRecords: totalCount,
//         page,
//         limit,
//         totalPages: Math.ceil(totalCount / limit),
//       };
//     }

//     const data = await query;

//     // If a callback is provided, delegate response responsibility
//     if (typeof populateOptionsOrCallbackFn === "function") {
//       return populateOptionsOrCallbackFn(data, pagination);
//     }

//     // Default response if no callback
//     return res.status(200).json({
//       message: "success",
//       data,
//       ...(pagination && { pagination }), // Add only if exists
//     });
//   } catch (error) {
//     console.error("Error in handleGetWithMsg:", error.message);
//     return res.status(500).json({
//       message: "error",
//       detail: error.message,
//     });
//   }
// };

// export default handleGetWithMsg;

import AWS from 'aws-sdk';
import { responseMessages, sendError, sendSuccess } from '../other/Req_Res_Search_function.js';

const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: 'auto',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const bucketName = process.env.R2_BUCKET;

const generateSignedUrl = (key, expiresIn = 60 * 60) => {
  return s3.getSignedUrl('getObject', {
    Bucket: bucketName,
    Key: key,
    Expires: expiresIn, // URL expires in 1 hour
  });
};

const handleGetWithMsg = async (
  req,
  res,
  Model,
  find,
  populateOptionsOrCallbackFn,
  signedFields = []
) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    let query = Model.find(find);

    // Populate if not a function
    if (
      populateOptionsOrCallbackFn &&
      typeof populateOptionsOrCallbackFn !== "function"
    ) {
      if (Array.isArray(populateOptionsOrCallbackFn)) {
        for (const pop of populateOptionsOrCallbackFn) {
          query = query.populate(pop);
        }
      } else if (
        typeof populateOptionsOrCallbackFn === "string" ||
        typeof populateOptionsOrCallbackFn === "object"
      ) {
        query = query.populate(populateOptionsOrCallbackFn);
      } else {
        console.warn(
          "Invalid populateOptions type:",
          typeof populateOptionsOrCallbackFn
        );
      }
    }

    // Apply pagination
    let pagination = null;
    if (!isNaN(page) && !isNaN(limit)) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);

      const totalCount = await Model.countDocuments(find);
      pagination = {
        totalRecords: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    }

    let data = await query;

    // Generate signed URLs
    data = data.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      signedFields.forEach((field) => {
        if (obj[field]) {
          obj[field] = generateSignedUrl(obj[field]);
        }
      });
      return obj;
    });

    // Callback if provided
    if (typeof populateOptionsOrCallbackFn === "function") {
      return populateOptionsOrCallbackFn(data, pagination);
    }

    // Default response
    return res.status(200).json({
      message: "success",
      data,
      ...(pagination && { pagination }),
    });
  } catch (error) {
    console.error("Error in handleGetWithMsg:", error.message);
    return res.status(500).json({
      message: "error",
      detail: error.message,
    });
  }
};

export default handleGetWithMsg;
