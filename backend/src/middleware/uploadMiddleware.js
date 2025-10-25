import multer from "multer";
import path from "path";
import os from "os";
import crypto from "crypto";

// We'll store the uploaded CSV temporarily in OS temp dir
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    // randomize filename so parallel uploads don't collide
    const unique = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname) || ".csv";
    cb(null, `upload_${unique}${ext}`);
  },
});

// only allow .csv
function fileFilter(req, file, cb) {
  if (
    file.mimetype === "text/csv" ||
    file.originalname.toLowerCase().endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"));
  }
}

export const uploadSingleCSV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB safety
  },
}).single("file"); // frontend must send field name "file"
