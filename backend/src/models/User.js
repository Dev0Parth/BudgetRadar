import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    // In the future you can store password hash or external provider ID
    authProvider: {
      type: String,
      default: "local",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
