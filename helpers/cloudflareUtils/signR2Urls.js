import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { LRUCache } from "lru-cache";

// Setup R2 client
const r2 = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
  region: "auto",
});

// Cache for presigned URLs
const cache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
});

// Extract R2 key from URL
function extractKey(url) {
  const marker = `/${process.env.R2_BUCKET}/`;
  const parts = url.split(marker);
  return parts.length === 2 ? parts[1] : null;
}

// Get or cache presigned URL
async function getCachedSignedUrl(key, expiry = 3600) {
  const cached = cache.get(key);
  if (cached) return cached;
  const cmd = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  });
  const url = await getSignedUrl(r2, cmd, { expiresIn: expiry });
  cache.set(key, url);
  return url;
}

// Main helper
export async function signUrlsInPayload(data, fields, expiry = 3600) {
  const items = Array.isArray(data) ? data : [data];
  for (const item of items) {
    for (const field of fields) {
      const url = item[field];
      if (typeof url === "string") {
        const key = url;
        if (key) {
          try {
            item[field] = await getCachedSignedUrl(key, expiry);
          } catch (err) {
            console.error(`Failed to sign URL for key: ${key}`, err);
          }
        }
      }
    }
  }
}

const signR2UrlsController = {
  signUrlsInPayload,
};

export default signR2UrlsController;
