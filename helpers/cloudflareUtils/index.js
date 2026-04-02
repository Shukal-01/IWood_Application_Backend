import { s3, getMime } from './r2Config.js';
import { 
  getSignedUrl,
  uploadFolderToR2,
  updateObjectInR2,
  uploadFileToR2,
  deleteObjectFromR2,
  deleteMultipleObjectsFromR2,
  deleteFolderFromR2
} from './r2Operations.js';

/**
 * Cloudflare R2 utilities for managing object storage operations
 */
export {
  // R2 Configuration
  s3,
  getMime,
  
  // R2 Operations
  getSignedUrl,
  uploadFolderToR2,
  
  // R2 Update Operations
  updateObjectInR2,
  uploadFileToR2,
  
  // R2 Delete Operations
  deleteObjectFromR2,
  deleteMultipleObjectsFromR2,
  deleteFolderFromR2
}; 