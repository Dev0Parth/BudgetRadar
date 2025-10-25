import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // what to match in the transaction description (e.g. "UBER EATS")
    matchText: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    // category we should auto-assign in future
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Each user should not have duplicate rule for same matchText
ruleSchema.index({ userId: 1, matchText: 1 }, { unique: true });

export default mongoose.model("Rule", ruleSchema);
