# Cloudflare R2 Setup Guide

This document explains how to set up Cloudflare R2 for both frontend and backend integration.

## What is Cloudflare R2?

Cloudflare R2 is an S3-compatible object storage service with no egress fees. It's ideal for storing and serving media files like videos, images, and other assets.

## Prerequisites

1. A Cloudflare account
2. Access to the Cloudflare dashboard
3. Admin rights to create API tokens

## Setup Steps

### 1. Create an R2 Bucket

1. Log in to the Cloudflare dashboard
2. Navigate to R2 from the sidebar
3. Click "Create bucket"
4. Name your bucket (e.g., `iwood-media`)
5. Choose a region close to your users
6. Click "Create bucket"

### 2. Create API Tokens

1. In the R2 dashboard, go to "Manage R2 API Tokens"
2. Click "Create API token"
3. Name your token (e.g., `iwood-media-access`)
4. Select permissions:
   - Object Read
   - Object Write
   - Bucket Read
   - Bucket Write
5. Click "Create API Token"
6. **Important**: Save both the Access Key ID and Secret Access Key securely. These will not be shown again.

### 3. Configure CORS (Cross-Origin Resource Sharing)

1. Select your bucket from the R2 dashboard
2. Go to "Settings" > "CORS"
3. Add a new CORS configuration:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```
   Note: For production, replace `"*"` with your specific frontend domain(s).

4. Click "Save"

### 4. Backend Configuration

1. Add the following environment variables to your `.env` file:

   ```
   R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
   R2_ACCESS_KEY=YOUR_ACCESS_KEY
   R2_SECRET_KEY=YOUR_SECRET_KEY
   R2_BUCKET=YOUR_BUCKET_NAME
   ```

   Replace:
   - `YOUR_ACCOUNT_ID` with your Cloudflare account ID (found in the dashboard URL)
   - `YOUR_ACCESS_KEY` with the Access Key ID from step 2
   - `YOUR_SECRET_KEY` with the Secret Access Key from step 2
   - `YOUR_BUCKET_NAME` with the bucket name you created in step 1

2. Ensure all required dependencies are installed:

   ```bash
   npm install aws-sdk dotenv express-fileupload
   ```

### 5. Frontend Configuration

The frontend doesn't need direct Cloudflare R2 credentials as it will interact with R2 through the backend API. However, you should:

1. Configure your API request URL:

   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
   
   // Then use:
   fetch(`${API_URL}/upload`, {
     method: 'POST',
     body: formData
   });
   ```

2. Implement proper video playback using HLS.js or a similar library:

   ```javascript
   import Hls from 'hls.js';
   
   // See the sample frontend code for implementation details
   ```

## Testing the Integration

### Backend Testing

After setting up the environment variables, you can test the connection to R2:

```javascript
// Test R2 connection
try {
  const result = await s3.listBuckets().promise();
  // console.log("Successfully connected to R2. Buckets:", result.Buckets);
} catch (error) {
  console.error("Failed to connect to R2:", error);
}
```

### Frontend Testing

1. Use the provided sample upload form
2. Upload a small video file
3. Check that both the video and thumbnail URLs are returned
4. Verify the video plays correctly using the HLS player

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**: Check your API credentials and bucket permissions
2. **CORS errors**: Ensure your CORS configuration includes all necessary origins and methods
3. **Upload failures**: Check your backend logs for specific error messages
4. **Missing environment variables**: Verify all required variables are set

### Debugging Tips

1. Enable verbose logging in the backend:

   ```javascript
   process.env.AWS_SDK_LOG_LEVEL = 'debug';
   ```

2. Check network requests in your browser's developer tools
3. Verify file permissions in the upload directories
4. Test with small files before attempting larger uploads

## Security Best Practices

1. **Never expose R2 credentials in frontend code**
2. Set appropriate CORS rules for production
3. Use signed URLs with short expiration times
4. Implement file size limits to prevent abuse
5. Consider adding authentication to upload endpoints

---

For additional help, refer to:
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)
- [HLS.js Documentation](https://github.com/video-dev/hls.js/) 