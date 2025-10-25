import express from "express";
import { uploadSingleCSV } from "../middleware/uploadMiddleware.js";
import { uploadCSV } from "../controllers/uploadController.js";

const router = express.Router();

// POST /api/upload
router.post("/upload", (req, res, next) => {
  uploadSingleCSV(req, res, function (err) {
    if (err) {
      // multer or file type error
      return res.status(400).json({ error: err.message || "File upload error" });
    }
    // go to controller
    next();
  });
}, uploadCSV);

export default router;
