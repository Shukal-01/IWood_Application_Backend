import path from "path";

function getTypeFolder(file) {
  if (!file || !file.name) return null;

  const ext = path.extname(file.name).toLowerCase();

  // First check by file extension
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
    return "images";
  } else if ([".mp4", ".avi", ".mov", ".mkv", ".webm"].includes(ext)) {
    return "videos";
  }

  // Fallback to MIME type if extension fails
  if (file.mimetype) {
    if (file.mimetype.includes("video")) {
      return "videos";
    } else if (file.mimetype.includes("image")) {
      return "images";
    }
  }

  return "files";
}

export default getTypeFolder;
