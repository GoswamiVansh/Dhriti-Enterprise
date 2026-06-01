import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import config from "../config/env.js";
import { AppError } from "../utils/AppError.js";

// Ensure upload directory exists
const uploadDir = path.resolve(config.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage — use memory storage for sharp processing
const storage = multer.memoryStorage();

// File filter — allow images and videos
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedMimes = [
    "image/jpeg", 
    "image/png", 
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime"
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only Images (JPEG, PNG, WebP) and Videos (MP4, WebM, MOV) are allowed", 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // Increased to 50MB for videos
  },
});

/**
 * Process and save an uploaded file (use sharp for images, direct save for videos)
 * Returns the relative path to the saved file
 */
async function processAndSaveFile(
  file: Express.Multer.File,
  subDir: string = "products"
): Promise<string> {
  const targetDir = path.join(uploadDir, subDir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const isVideo = file.mimetype.startsWith("video/");
  
  if (isVideo) {
    const outputName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const outputPath = path.join(targetDir, outputName);
    await fs.promises.writeFile(outputPath, file.buffer);
    return `/${config.UPLOAD_DIR}/${subDir}/${outputName}`;
  } else {
    // Process image with sharp
    const outputName = `${Date.now()}-${file.originalname.replace(path.extname(file.originalname), "")}.webp`;
    const outputPath = path.join(targetDir, outputName);

    await sharp(file.buffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    return `/${config.UPLOAD_DIR}/${subDir}/${outputName}`;
  }
}

export { upload, processAndSaveFile as processAndSaveImage };
