import { useEffect, useState } from "react";
import api from "./services/api";

export default function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const month = "2025-10"; // hardcoded for now

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get(`/stats?month=${month}`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen px-6 py-8 bg-zinc-950 text-zinc-100">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          BudgetRadar Dashboard
        </h1>
        <p className="text-sm text-zinc-400">
          Track where your money is going.
        </p>
      </header>

      {loading && (
        <div className="text-zinc-400 text-sm">Loading stats…</div>
      )}

      {!loading && !stats && (
        <div className="text-red-400 text-sm">
          Could not load data from API.
        </div>
      )}

      {!loading && stats && (
        <main className="grid gap-6 md:grid-cols-3">
          {/* Total Spent */}
          <InfoCard
            label="Total Spent"
            primary={`$${totalSpent(stats).toFixed(2)}`}
            secondary=""
          />

          <InfoCard
            label="Biggest Category"
            primary={topCategory(stats).name}
            secondary={`$${topCategory(stats).amount.toFixed(2)}`}
          />

          <InfoCard
            label="Categories Tracked"
            primary={categoryCount(stats).toString()}
            secondary="active this month"
          />

        </main>
      )}
    </div>
  );
}

function InfoCard({ label, primary, secondary }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-md">
      <div className="text-xs uppercase text-zinc-500 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-white">{primary}</div>
      {secondary && (
        <div className="text-zinc-400 text-sm mt-1">{secondary}</div>
      )}
    </div>
  );
}

// Helpers expect stats like: [ { _id: "Groceries", total: -188.22 }, ... ]

function totalSpent(statsObj) {
  return statsObj.totalSpent || 0;
}

function topCategory(statsObj) {
  if (!statsObj.categories || statsObj.categories.length === 0) {
    return { name: "N/A", amount: 0 };
  }
  const sorted = [...statsObj.categories].sort(
    (a, b) => Math.abs(b.total) - Math.abs(a.total)
  );
  return {
    name: sorted[0]._id,
    amount: Math.abs(sorted[0].total),
  };
}

function categoryCount(statsObj) {
  return statsObj.categories ? statsObj.categories.length : 0;
}
