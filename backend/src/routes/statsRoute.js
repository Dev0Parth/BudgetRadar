import express from "express";
import { getStats } from "../controllers/statsController.js";

const router = express.Router();

// GET /api/stats?month=2025-10
router.get("/stats", getStats);

export default router;
