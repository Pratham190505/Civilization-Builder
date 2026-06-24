import { useState, useEffect } from "react";
import { getRankings } from "../../api/rankings";

export default function RankingsList() {
  const [tiersSummary, setTiersSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await getRankings();
      if (res.success && Array.isArray(res.data)) {
        const data = res.data;
        const total = data.length || 1;

        const counts = {
          "Platinum": { count: 0, color: "#8b5cf6" },
          "Gold": { count: 0, color: "#f59e0b" },
          "Silver": { count: 0, color: "#94a3b8" },
          "Bronze": { count: 0, color: "#f97316" },
          "No Rank": { count: 0, color: "#808080" },
        };

        data.forEach((snapshot) => {
          const tierName = snapshot.RankTier?.tier_name || snapshot.RankTier?.name || "No Rank";
          if (counts[tierName]) {
            counts[tierName].count += 1;
            if (snapshot.RankTier?.color) {
              counts[tierName].color = snapshot.RankTier.color;
            }
          } else {
            // Handle dynamically defined tiers
            counts[tierName] = { count: 1, color: snapshot.RankTier?.color || "#808080" };
          }
        });

        const summary = Object.keys(counts).map((tier) => {
          const item = counts[tier];
          const pct = parseFloat(((item.count / total) * 100).toFixed(1));
          return {
            tier,
            count: item.count,
            pct,
            color: item.color,
          };
        });

        setTiersSummary(summary);
      }
    } catch (err) {
      console.error("Failed to load rankings summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="text-xs text-muted-foreground">Loading rankings summary...</div>;
  }

  return (
    <div className="space-y-3">
      {tiersSummary.map((r) => (
        <div key={r.tier}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-foreground">{r.tier}</span>
            <span className="text-sm font-semibold text-foreground">
              {r.count} <span className="ml-1 text-xs font-medium text-muted-foreground">{r.pct}%</span>
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: `${r.pct}%`, background: r.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
