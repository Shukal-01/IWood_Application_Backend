import express from "express";
import multer from "multer";
import fs from "fs";
import { exec } from "child_process";
import { getSignedUrl, uploadFolderToR2 } from "../cloudflareUtils/index.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

export function convertToHLS(inputPath, outputDir) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });
    const command = `ffmpeg -i ${inputPath} -profile:v baseline -level 3.0 -start_number 0 -hls_time 4 -hls_list_size 0 -f hls ${outputDir}/output.m3u8`;
    exec(command, (err) => (err ? reject(err) : resolve()));
  });
}

export function extractThumbnail(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -ss 00:00:01 -i ${inputPath} -vframes 1 -q:v 2 ${outputPath}`;
    exec(command, (err) => (err ? reject(err) : resolve()));
  });
}

export const deleteFolderRecursive = async (folderPath) => {
  try {
    await fs.promises.rm(folderPath, { recursive: true, force: true });
    // console.log(`✅ Deleted folder: ${folderPath}`);
  } catch (err) {
    console.error(`❌ Failed to delete folder ${folderPath}`, err);
  }
};

router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const id = Date.now().toString();
    const outputDir = `output/${id}`;
    const thumbnailPath = `${outputDir}/thumbnail.jpg`;

    await convertToHLS(filePath, outputDir);
    await extractThumbnail(filePath, thumbnailPath);
    await uploadFolderToR2(outputDir, `videos/${id}`);

    // Cleanup temporary files
    await fs.promises.unlink(filePath);               // Delete uploaded file
    await fs.promises.unlink(thumbnailPath);          // Delete thumbnail
    await deleteFolderRecursive(outputDir);           // Delete output folder

    res.json({
      success: true,
      videoUrl: getSignedUrl(`videos/${id}/output.m3u8`),
      thumbnailUrl: getSignedUrl(`videos/${id}/thumbnail.jpg`),
    });
  } catch (err) {
    console.error("❌ Error in /upload:", err);
    res.status(500).send("Video processing failed");
  }
});

const cloudflareR2Routes = router;

export default cloudflareR2Routes;
