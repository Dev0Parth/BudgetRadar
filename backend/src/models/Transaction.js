import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      index: true, // we will search by merchant text later
    },
    amount: {
      type: Number,
      required: true,
      // Negative means money spent, positive means money in.
    },
    category: {
      type: String,
      default: "Uncategorized",
      trim: true,
      index: true,
    },
    sourceFileId: {
      type: String,
      trim: true,
      // this lets us group which upload/import this row came from
    },
    isRecurring: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful compound index for "all my spending this month by category"
transactionSchema.index({ userId: 1, date: 1, category: 1 });

export default mongoose.model("Transaction", transactionSchema);
