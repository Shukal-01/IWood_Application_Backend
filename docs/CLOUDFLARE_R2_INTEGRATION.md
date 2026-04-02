# Cloudflare R2 Integration Guide for Frontend Developers

This document provides frontend developers with the necessary information to integrate with the Cloudflare R2 storage system implemented in our backend.

## Overview

The backend uses Cloudflare R2, an S3-compatible object storage service, for storing and serving media files such as videos and images. The implementation allows for:

- Video uploads with HLS (HTTP Live Streaming) conversion
- File uploads with signed URLs for secure access
- Thumbnail generation for videos
- Efficient storage and retrieval of media assets

## API Endpoints

### Video Upload

**Endpoint:** `POST /upload`  
**Content-Type:** `multipart/form-data`

#### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| video | File | The video file to upload |

#### Response

```json
{
  "success": true,
  "videoUrl": "https://example.com/signed-url-to-m3u8-file",
  "thumbnailUrl": "https://example.com/signed-url-to-thumbnail"
}
```

The `videoUrl` points to an HLS manifest file (`.m3u8`) which can be played using HLS-compatible video players like hls.js, Video.js, or native players on iOS/Safari.

## Integration Guide for Frontend

### 1. Uploading Videos

Use a form with a file input to upload videos:

```html
<form id="videoUploadForm">
  <input type="file" name="video" accept="video/*" required />
  <button type="submit">Upload Video</button>
</form>
```

```javascript
// JavaScript for handling the upload
document.getElementById('videoUploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  const fileInput = document.querySelector('input[name="video"]');
  
  if (fileInput.files.length === 0) {
    alert('Please select a video file');
    return;
  }
  
  formData.append('video', fileInput.files[0]);
  
  try {
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Processing video, please wait...';
    document.body.appendChild(loadingIndicator);
    
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Hide loading indicator
    document.body.removeChild(loadingIndicator);
    
    if (result.success) {
      // Use the returned URLs for video player and thumbnail
      displayVideo(result.videoUrl, result.thumbnailUrl);
    } else {
      alert('Upload failed');
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    alert(`Error: ${error.message}`);
  }
});

function displayVideo(videoUrl, thumbnailUrl) {
  // Create video player with the HLS source
  const videoContainer = document.createElement('div');
  videoContainer.innerHTML = `
    <img src="${thumbnailUrl}" alt="Video thumbnail" />
    <div id="videoPlayer"></div>
  `;
  document.body.appendChild(videoContainer);
  
  // Initialize HLS.js video player
  if (Hls.isSupported()) {
    const video = document.createElement('video');
    video.controls = true;
    video.poster = thumbnailUrl;
    document.getElementById('videoPlayer').appendChild(video);
    
    const hls = new Hls();
    hls.loadSource(videoUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // For Safari, which has native HLS support
    const video = document.createElement('video');
    video.src = videoUrl;
    video.poster = thumbnailUrl;
    video.controls = true;
    document.getElementById('videoPlayer').appendChild(video);
  } else {
    alert('Your browser does not support HLS video playback');
  }
}
```

### 2. Playing HLS Videos

To play HLS videos, you'll need an HLS-compatible player. We recommend using [hls.js](https://github.com/video-dev/hls.js/) for browsers that don't support HLS natively:

```html
<!-- Include hls.js -->
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>

<!-- Video element -->
<video id="video" controls></video>

<script>
  const video = document.getElementById('video');
  const videoUrl = 'URL_FROM_BACKEND_RESPONSE';
  
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari)
    video.src = videoUrl;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
  } else {
    console.error('Your browser does not support HLS');
  }
</script>
```

### 3. Displaying Images

The thumbnail URLs returned by the API are also signed URLs. You can use them directly in `<img>` tags:

```html
<img src="THUMBNAIL_URL_FROM_BACKEND" alt="Video thumbnail" />
```

### 4. Important Notes

1. **URL Expiration**: The signed URLs returned by the backend expire after 1 hour. If you need to display the content after this period, you'll need to request a new signed URL from the backend.

2. **CORS Configuration**: The backend has CORS configured to allow requests from any origin (`*`). If you're encountering CORS issues, verify your request headers.

3. **Content Types**: The backend supports various content types, with specific handling for:
   - `.m3u8` files (HLS manifests)
   - `.ts` files (HLS segments)
   - `.jpg` images

4. **Error Handling**: Always implement proper error handling for upload operations, as video processing can be resource-intensive and may occasionally fail.

## Troubleshooting

### Common Issues

1. **Upload timeout**: Large video files might take longer to process. Consider implementing a progress indicator or chunked uploads for large files.

2. **Playback issues**: If videos don't play correctly, check:
   - Browser compatibility with HLS
   - Whether the URL has expired
   - Network connectivity issues

3. **CORS errors**: Ensure your frontend application is making requests with the proper headers.

### Testing

You can test video uploads with small MP4 files first to verify the system is working correctly before implementing the full frontend integration.

## Security Considerations

1. The backend uses signed URLs to prevent unauthorized access to media files.
2. Implement proper validation on the frontend to ensure only appropriate files are uploaded.
3. Consider adding file size limits in your frontend code to prevent excessively large uploads.

---

For any questions or issues regarding this integration, please contact the backend development team. 