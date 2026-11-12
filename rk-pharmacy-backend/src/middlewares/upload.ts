import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed mime types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Map mime → extension (DO NOT trust original filename)
const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = MIME_EXTENSION_MAP[file.mimetype];
    const safeName = crypto.randomUUID();
    cb(null, `${safeName}${ext}`);
  },
});

// Multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // ✅ 1MB max
    files: 5, // ✅ max 5 files
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, false); // silently reject
    }
    cb(null, true);
  },
});
