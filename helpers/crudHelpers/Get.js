// import { sendSuccess } from "../other/Req_Res_Search_function.js";

// const handleGet = async (req, res, Model, find, populateOptions) => {
//   try {
//     const page = parseInt(req.query.page) || null;
//     const limit = parseInt(req.query.limit) || null;

//     let query = Model.find(find);

//     // ✅ Handle single or multiple populate fields
//     if (populateOptions && populateOptions.length > 0) {
//       if (Array.isArray(populateOptions)) {
//         populateOptions.forEach((pop) => {
//           query = query.populate(pop);
//         });
//       } else {
//         query = query.populate(populateOptions);
//       }
//     }

//     if (page && limit) {
//       const skip = (page - 1) * limit;
//       query = query.skip(skip).limit(limit);
//     }

//     const storyData = await query;

//     // If pagination is used, optionally return total count and current page
//     if (page && limit) {
//       const totalCount = await Model.countDocuments(find);
//       return res.status(200).json({
//         data: storyData,
//         pagination: {
//           totalRecords: totalCount,
//           page,
//           limit,
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       });
//     } else {
//       // Return full data when no pagination is passed
//       // return res.status(200).json({message: "success", data: storyData});
//       return sendSuccess(res, 200, storyData);
//     }
//   } catch (error) {
//     console.error("Error in handleGet:", error.message);
//     return res.status(500).json({
//       message: "error",
//       error: "something went wrong",
//     });
//   }
// };

// export default handleGet;


import AWS from 'aws-sdk';
import { sendSuccess } from "../other/Req_Res_Search_function.js";

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
    Expires: expiresIn,
  });
};

const handleGet = async (req, res, Model, find, populateOptions, signedFields = []) => {
  try {
    const page = parseInt(req.query.page) || null;
    const limit = parseInt(req.query.limit) || null;

    let query = Model.find(find);

    // ✅ Handle single or multiple populate fields
    if (populateOptions && populateOptions.length > 0) {
      if (Array.isArray(populateOptions)) {
        populateOptions.forEach((pop) => {
          query = query.populate(pop);
        });
      } else {
        query = query.populate(populateOptions);
      }
    }

    // Pagination
    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    let storyData = await query;

    // Add signed URLs to fields
    storyData = storyData.map(doc => {
      const obj = doc.toObject ? doc.toObject() : doc;
      signedFields.forEach(field => {
        if (obj[field]) {
          obj[field] = generateSignedUrl(obj[field]);
        }
      });
      return obj;
    });

    // Response
    if (page && limit) {
      const totalCount = await Model.countDocuments(find);
      return res.status(200).json({
        data: storyData,
        pagination: {
          totalRecords: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } else {
      return sendSuccess(res, 200, storyData);
    }
  } catch (error) {
    console.error("Error in handleGet:", error.message);
    return res.status(500).json({
      message: "error",
      error: "something went wrong",
    });
  }
};

export default handleGet;
