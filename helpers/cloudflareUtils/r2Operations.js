import fs from 'fs';
import { s3, getMime } from './r2Config.js';

/**
 * Get a signed URL for retrieving an object from R2
 * @param {string} key - Object key in R2 bucket
 * @returns {string} Signed URL
 */
function getSignedUrl(key) {
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Expires: 60 * 60, // 1 hour
  });
}

/**
 * Upload a folder of files to R2
 * @param {string} localDir - Local directory path
 * @param {string} remoteDir - Remote directory path in R2
 * @returns {Promise<void>}
 */
async function uploadFolderToR2(localDir, remoteDir) {
  const files = fs.readdirSync(localDir);
  for (const file of files) {
    const fileStream = fs.createReadStream(`${localDir}/${file}`);
    await s3
      .upload({
        Bucket: process.env.R2_BUCKET,
        Key: `${remoteDir}/${file}`,
        Body: fileStream,
        ContentType: getMime(file),
      })
      .promise();
  }
}

/**
 * Update an existing object in R2 with new content
 * @param {string} key - Object key in R2 bucket
 * @param {Buffer|Uint8Array|Blob|string|ReadableStream} content - New content for the object
 * @param {string} contentType - MIME type of the content (optional)
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Promise<Object>} - Response from S3 API
 */
async function updateObjectInR2(key, content, contentType = null, metadata = null) {
  // Check if object exists first
  try {
    await s3.headObject({
      Bucket: process.env.R2_BUCKET,
      Key: key
    }).promise();
  } catch (error) {
    if (error.code === 'NotFound') {
      throw new Error(`Object with key '${key}' does not exist in bucket`);
    }
    throw error;
  }

  // Prepare upload parameters
  const uploadParams = {
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: content,
  };

  // Add content type if provided
  if (contentType) {
    uploadParams.ContentType = contentType;
  }

  // Add metadata if provided
  if (metadata) {
    uploadParams.Metadata = metadata;
  }

  // Update the object
  return s3.putObject(uploadParams).promise();
}

/**
 * Upload a local file to R2 - can be used for both new files and updates
 * @param {string} filePath - Path to the local file
 * @param {string} key - Object key in R2 bucket
 * @param {string} contentType - Content type (optional, will be guessed from file extension if not provided)
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Promise<Object>} - Response from S3 API
 */
async function uploadFileToR2(filePath, key, contentType = null, metadata = null) {
  const fileStream = fs.createReadStream(filePath);
  
  // Determine content type if not provided
  const effectiveContentType = contentType || getMime(filePath);
  
  const uploadParams = {
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: fileStream,
    ContentType: effectiveContentType
  };
  
  // Add metadata if provided
  if (metadata) {
    uploadParams.Metadata = metadata;
  }
  
  return s3.upload(uploadParams).promise();
}

/**
 * Delete a single object from R2
 * @param {string} key - Object key in R2 bucket
 * @returns {Promise<void>}
 */
async function deleteObjectFromR2(key) {
  await s3
    .deleteObject({
      Bucket: process.env.R2_BUCKET,
      Key: key,
    })
    .promise();
}

/**
 * Delete multiple objects from R2 in a single request
 * @param {string[]} keys - Array of object keys to delete
 * @returns {Promise<{Deleted: Array, Errors: Array}>} - Result with deleted objects and errors
 */
async function deleteMultipleObjectsFromR2(keys) {
  const deleteParams = {
    Bucket: process.env.R2_BUCKET,
    Delete: {
      Objects: keys.map(key => ({ Key: key })),
      Quiet: false
    }
  };

  const result = await s3.deleteObjects(deleteParams).promise();
  return {
    Deleted: result.Deleted || [],
    Errors: result.Errors || []
  };
}

/**
 * Delete all objects with a common prefix (folder) from R2
 * @param {string} prefix - Prefix/folder path in R2
 * @returns {Promise<{DeletedCount: number, Errors: Array}>}
 */
async function deleteFolderFromR2(prefix) {
  // Ensure the prefix ends with a trailing slash
  const folderPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
  
  // List all objects with the prefix
  const listParams = {
    Bucket: process.env.R2_BUCKET,
    Prefix: folderPrefix
  };
  
  try {
    const listedObjects = await s3.listObjectsV2(listParams).promise();
    
    if (listedObjects.Contents.length === 0) {
      return { DeletedCount: 0, Errors: [] };
    }
    
    // Create delete parameters
    const deleteParams = {
      Bucket: process.env.R2_BUCKET,
      Delete: {
        Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
        Quiet: false
      }
    };
    
    const result = await s3.deleteObjects(deleteParams).promise();
    return {
      DeletedCount: result.Deleted.length,
      Errors: result.Errors || []
    };
  } catch (error) {
    console.error(`❌ Error deleting folder ${folderPrefix}:`, error);
    throw error;
  }
}

export {
  getSignedUrl,
  uploadFolderToR2,
  updateObjectInR2,
  uploadFileToR2,
  deleteObjectFromR2,
  deleteMultipleObjectsFromR2,
  deleteFolderFromR2
}; 