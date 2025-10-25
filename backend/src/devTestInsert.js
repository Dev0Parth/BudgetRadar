import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Transaction from "./models/Transaction.js";
import Rule from "./models/Rule.js";

dotenv.config();

async function run() {
  try {
    // connect to Mongo
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to Mongo for test insert");

    // 1. create a test user (or find if already exists)
    let user = await User.findOne({ email: "testuser@example.com" });
    if (!user) {
      user = await User.create({
        email: "testuser@example.com",
        displayName: "Test User",
        authProvider: "local",
      });
      console.log("Created user:", user._id.toString());
    } else {
      console.log("User already exists:", user._id.toString());
    }

    // 2. create a rule for that user
    const rule = await Rule.findOneAndUpdate(
      {
        userId: user._id,
        matchText: "uber eats",
      },
      {
        userId: user._id,
        matchText: "uber eats",
        category: "Food Delivery",
      },
      { upsert: true, new: true }
    );
    console.log("Upserted rule:", rule.matchText, "=>", rule.category);

    // 3. insert a fake transaction for that user
    const tx = await Transaction.create({
      userId: user._id,
      date: new Date("2025-10-25T12:00:00Z"),
      description: "UBER EATS ORDER #1234",
      amount: -28.9,
      category: "Food Delivery",
      sourceFileId: "seed_demo",
      isRecurring: false,
    });
    console.log("Inserted transaction:", tx.description, tx.amount);

    // 4. fetch transactions for that user for October 2025
    const start = new Date("2025-10-01T00:00:00Z");
    const end = new Date("2025-11-01T00:00:00Z");

    const octoberTx = await Transaction.find({
      userId: user._id,
      date: { $gte: start, $lt: end },
    }).lean();

    console.log("Found", octoberTx.length, "transactions in Oct 2025");
    octoberTx.forEach(t => {
      console.log("-", t.description, t.amount, t.category);
    });

    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Error in devTestInsert:", err);
    process.exit(1);
  }
}

run();
