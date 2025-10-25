import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

function getMonthRange(monthStr) {
  // must be YYYY-MM
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    return null;
  }

  const start = new Date(`${monthStr}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  return { start, end };
}

// GET /api/stats?month=2025-10
export async function getStats(req, res) {
  try {
    const { month } = req.query;

    const range = getMonthRange(month);
    if (!range) {
      return res
        .status(400)
        .json({ error: "month query param required as YYYY-MM, e.g. 2025-10" });
    }

    const { start, end } = range;

    // TEMP user (same as upload)
    let user = await User.findOne({ email: "testuser@example.com" });
    if (!user) {
      return res.json({
        categories: [],
        daily: [],
        totalSpent: 0,
      });
    }

    // spend by category
    const byCategory = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: 1 } },
    ]);

    // spend by day
    const byDay = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalSpent = byCategory.reduce((acc, row) => {
      const val = Math.abs(row.total || 0);
      return acc + val;
    }, 0);

    return res.json({
      categories: byCategory,
      daily: byDay,
      totalSpent,
    });
  } catch (err) {
    console.error("Error in getStats:", err);
    return res.status(500).json({ error: "Failed to compute stats" });
  }
}
