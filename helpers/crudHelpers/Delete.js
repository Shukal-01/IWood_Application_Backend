// const handleDelete = async (req, res, Model, find, onSuccess) => {
//   try {
//     const isDeleted = await Model.deleteOne(find);

//     if (isDeleted?.deletedCount > 0) {
//       if (typeof onSuccess === "function") {
//         return onSuccess(isDeleted); // ✅ Call the success callback
//       }
//       return res.status(200).json({ message: "success", data: isDeleted });
//     } else {
//       return res.status(404).json({ message: "error", detail: "Document not found or already deleted" });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: "error", detail: "Failed to delete document" });
//   }
// };

// export default handleDelete;


import AWS from 'aws-sdk';
import { responseMessages, sendError, sendSuccess } from '../other/Req_Res_Search_function.js';

const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: 'auto',
  s3ForcePathStyle: true,
});

const bucketName = process.env.R2_BUCKET;

const handleDelete = async (req, res, Model, find, onSuccess, fileFields = []) => {
  try {
    // Fetch the document to get file paths before deleting
    const document = await Model.findOne(find);
    if (!document) {
      return res.status(404).json({ message: 'error', detail: 'Document not found' });
    }

    // Delete associated media files from Cloudflare R2
    const deletePromises = fileFields.map(async (field) => {
      const fileKey = document[field];
      if (fileKey) {
        try {
          await s3
            .deleteObject({
              Bucket: bucketName,
              Key: fileKey,
            })
            .promise();
        } catch (err) {
          console.error(`Failed to delete file from R2: ${fileKey}`, err);
        }
      }
    });

    await Promise.all(deletePromises);

    // Delete the document from DB
    const isDeleted = await Model.deleteOne(find);

    if (isDeleted?.deletedCount > 0) {
      if (typeof onSuccess === 'function') {
        return onSuccess(isDeleted);
      }
      return res.status(200).json({ message: 'success', data: isDeleted });
    } else {
      return res.status(404).json({ message: 'error', detail: 'Document not found or already deleted' });
    }
  } catch (error) {
    console.error('Error in handleDelete:', error);
    return res.status(500).json({ message: 'error', detail: 'Failed to delete document' });
  }
};

export default handleDelete;
