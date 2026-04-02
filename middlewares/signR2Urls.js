// // middleware/signR2Urls.js
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";                     // :contentReference[oaicite:0]{index=0}
// import { getSignedUrl }            from "@aws-sdk/s3-request-presigner";               // :contentReference[oaicite:1]{index=1}                             // small in-memory cache
// import { LRUCache } from "lru-cache";

// // 1. Configure a minimal S3 client for R2
// const r2 = new S3Client({
//   endpoint:    process.env.R2_ENDPOINT,
//   region:      "auto",
//   credentials: {
//     accessKeyId:     process.env.R2_ACCESS_KEY,
//     secretAccessKey: process.env.R2_SECRET_KEY,
//   },
// });

// // 2. In-memory cache: stores { [objectKey]: { url, expiresAt } }
// const cache = new LRUCache({
//   max:           1000,                   // hold up to 1000 URLs
//   ttl:           1000 * 60 * 60,         // auto-expire entries after 1h
//   updateAgeOnGet:true,
// });

// // 3. Helper: extract raw R2 key from your stored public URL
// function extractKey(publicUrl) {
//   const marker = `/${process.env.R2_BUCKET}/`;
//   const parts  = publicUrl.split(marker);
//   return parts.length === 2 ? parts[1] : null;
// }

// // 4. Obtain (and cache) a presigned URL for a given key
// async function getCachedSignedUrl(objectKey, expiresIn = 3600) {
//   const entry = cache.get(objectKey);
//   if (entry) return entry.url;

//   const cmd = new GetObjectCommand({
//     Bucket: process.env.R2_BUCKET,
//     Key:    objectKey,
//   });

//   const url = await getSignedUrl(r2, cmd, { expiresIn });
//   cache.set(objectKey, { url, expiresAt: Date.now() + expiresIn * 1000 });
//   return url;
// }

// // 5. Middleware: only signs known fields (e.g. profileImage, coverImage, fileUrl)
// export default function signR2UrlsMiddleware(req, res, next) {
//   const origJson = res.json.bind(res);

//   res.json = async (payload) => {
//     try {
//       // Only look inside `payload.data` for known URL fields
//       const data = payload?.data;
//       if (data && typeof data === "object") {
//         // If single object
//         const items = Array.isArray(data) ? data : [data];

//         await Promise.all(
//           items.flatMap(item => {
//             return ["profileImage", "coverImage", "fileUrl", "thumbnailUrl"]
//               .map(async field => {
//                 const publicUrl = item[field];
//                 if (typeof publicUrl === "string" && publicUrl.includes(`/${process.env.R2_BUCKET}/`)) {
//                   const key = extractKey(publicUrl);
//                   if (key) {
//                     item[field] = await getCachedSignedUrl(key);
//                   }
//                 }
//               });
//           })
//         );
//       }
//     } catch (e) {
//       console.error("signR2UrlsMiddleware error:", e);
//     }
//     return origJson(payload);
//   };

//   next();
// }

// middleware/signR2Urls.js
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import pMap from "p-map";
import { LRUCache } from "lru-cache";

// 1. R2 client (modular v3 SDK)
const r2 = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
  region: "auto",
});

// 2. Cache presigned URLs for their TTL
const cache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 60,
});

// 3. Extract object key from stored URL
function extractKey(url) {
  if (url.includes(`/${process.env.R2_BUCKET}/`)) {
    const marker = `/${process.env.R2_BUCKET}/`;
    const parts = url.split(marker);
    return parts.length === 2 ? parts[1] : null;
  }
  return null;
}

// 4. Get or generate-and-cache a presigned URL
async function getCachedSignedUrl(key, expiresIn = 3600) {
  const cached = cache.get(key);
  if (cached) return cached;
  const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key });
  const url = await getSignedUrl(r2, cmd, { expiresIn });
  cache.set(key, url);
  return url;
}

// 5. Middleware factory with optional overrides
export default function signR2UrlsMiddleware(opts = {}) {
  const {
    fields = [
      "profileImage",
      "coverImage",
      "fileUrl",
      "thumbnailUrl",
      "video",
      "image",
      "bannerImage",
      "trailerThumbnail",
    ],
    maxTotalUrls = 50,
    concurrency = 5,
    expiry = 3600,
  } = opts;

  return (req, res, next) => {
    const origJson = res.json.bind(res);

    res.json = async (payload) => {
      try {
        const data = payload?.data;
        if (data && typeof data === "object") {
          // Normalize to array
          const items = Array.isArray(data) ? data : [data];

          // Collect all [item, field] pairs that need signing
          const toSign = [];
          for (const item of items) {
            for (const field of fields) {
              const url = item[field];
              if (typeof url === "string") {
                // const key = extractKey(url);
                const key = url;
                if (key) toSign.push({ item, field, key });
              }
            }
          }

          // If too many URLs, skip signing to avoid overload
          if (toSign.length > maxTotalUrls) {
            console.warn(
              `signR2Urls: ${toSign.length} URLs to sign exceeds limit ${maxTotalUrls}, skipping.`
            );
          } else {
            // Throttled signing with concurrency cap
            await pMap(
              toSign,
              async ({ item, field, key }) => {
                try {
                  item[field] = await getCachedSignedUrl(key, expiry);
                } catch (e) {
                  console.error(`Failed to sign R2 URL for key=${key}:`, e);
                }
              },
              { concurrency }
            );
          }
        }
      } catch (e) {
        console.error("signR2UrlsMiddleware error:", e);
      }
      return origJson(payload);
    };

    next();
  };
}
