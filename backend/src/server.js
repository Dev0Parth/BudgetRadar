import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import uploadRouter from "./routes/uploadRoute.js";
import statsRouter from "./routes/statsRoute.js";

// Load environment variables
dotenv.config();

// Create app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌  MONGO_URI not found in .env");
  process.exit(1);
}

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Health check route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "BudgetRadar API running" });
});

// mount routers
app.use("/api", uploadRouter);
app.use("/api", statsRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
