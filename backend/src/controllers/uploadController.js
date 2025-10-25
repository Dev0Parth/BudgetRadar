import fs from "fs";
import csvParser from "csv-parser";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { categorizeTransaction } from "../services/categorizeService.js";

// helper: normalize various amount formats ("-28.90", "$45.20", "1,234.50")
function parseAmount(raw) {
  if (raw === undefined || raw === null || raw === "") return null;

  const cleaned = String(raw)
    .replace(/[, $AUD]/gi, "") // strip commas, currency symbols, 'AUD', etc.
    .trim();

  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

// POST /api/upload
export async function uploadCSV(req, res) {
  // multer already ran, so file should exist
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "CSV file is required (form-data field name must be 'file')" });
  }

  // TEMP user (until you build auth)
  let user = await User.findOne({ email: "testuser@example.com" });
  if (!user) {
    user = await User.create({
      email: "testuser@example.com",
      displayName: "Test User",
      authProvider: "local",
    });
  }

  const filePath = req.file.path;

  // rows that passed validation and will be categorized
  const cleanRows = [];

  // rows we rejected for being invalid
  const skipped = [];

  // a batch id for this upload session
  const sourceFileId = `upload_${Date.now()}`;

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      // normalize header variations from different banks
      const rawDate =
        row.date ||
        row.Date ||
        row.transactionDate ||
        row["Transaction Date"] ||
        row["Date"];

      const rawDesc =
        row.description ||
        row.Description ||
        row["Description"] ||
        row["Details"] ||
        row["Transaction Description"];

      const rawAmount =
        row.amount ||
        row.Amount ||
        row["Amount"] ||
        row["Debit"] ||
        row["Credit"];

      const amountParsed = parseAmount(rawAmount);
      const dateParsed = rawDate ? new Date(rawDate) : null;

      // basic validation for required fields
      if (!dateParsed || isNaN(dateParsed.getTime()) || !rawDesc || amountParsed === null) {
        skipped.push({
          rawDate,
          rawDesc,
          rawAmount,
          reason: "Missing or invalid required fields",
        });
        return; // skip this CSV row
      }

      cleanRows.push({
        userId: user._id,
        date: dateParsed,
        description: rawDesc.trim(),
        amount: amountParsed,
        sourceFileId,
      });
    })
    .on("end", async () => {
      try {
        // now that CSV is fully read, categorize + insert
        const withCategories = [];

        for (const row of cleanRows) {
          const category = await categorizeTransaction({
            description: row.description,
            userId: row.userId,
          });

          withCategories.push({
            ...row,
            category,
            isRecurring: false, // default for now
          });
        }

        if (withCategories.length > 0) {
          await Transaction.insertMany(withCategories);
        }

        // cleanup temp file
        fs.unlink(filePath, () => {});

        return res.json({
          importedCount: withCategories.length,
          skippedCount: skipped.length,
          skippedPreview: skipped.slice(0, 5), // first few bad rows for debugging
          sourceFileId,
        });
      } catch (err) {
        console.error("DB insert failed:", err);
        return res.status(500).json({ error: "Failed to save transactions" });
      }
    })
    .on("error", (err) => {
      console.error("CSV parse failed:", err);
      return res.status(400).json({ error: "Invalid CSV format" });
    });
}
