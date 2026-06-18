import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { HiOutlineBookmark, HiOutlineArrowPath } from "react-icons/hi2";
import { Card, CardHeader, Tier } from "../../components/common/Page.jsx";
import { getRankings, recalculateRankings } from "../../api/rankings";
import { toast } from "sonner";

const tierTone = {
  Platinum: "text-slate-200 border-slate-400",
  Gold: "text-amber-400 border-amber-500",
  Silver: "text-slate-300 border-slate-400",
  Bronze: "text-orange-400 border-orange-500",
  "Not Ranked": "text-muted-foreground border-border",
};

export default function Rankings() {
  const [rankingsList, setRankingsList] = useState([]);
  const [tiers, setTiers] = useState([
    { label: "Platinum", count: 0, color: "#cbd5e1" },
    { label: "Gold", count: 0, color: "#f59e0b" },
    { label: "Silver", count: 0, color: "#94a3b8" },
    { label: "Bronze", count: 0, color: "#f97316" },
    { label: "Not Ranked", count: 0, color: "#475569" },
  ]);
  const [loading, setLoading] = useState(true);

  const fetchRankingsData = async () => {
    try {
      const res = await getRankings();
      if (res.success && Array.isArray(res.data)) {
        setRankingsList(res.data);
        
        // Aggregate tiers
        const counts = {
          "Platinum": 0,
          "Gold": 0,
          "Silver": 0,
          "Bronze": 0,
          "Not Ranked": 0,
        };

        res.data.forEach((r) => {
          const tierName = r.RankTier?.name || "Not Ranked";
          if (counts[tierName] !== undefined) {
            counts[tierName] += 1;
          } else {
            counts["Not Ranked"] += 1;
          }
        });

        setTiers([
          { label: "Platinum", count: counts["Platinum"], color: "#8b5cf6" },
          { label: "Gold", count: counts["Gold"], color: "#f59e0b" },
          { label: "Silver", count: counts["Silver"], color: "#94a3b8" },
          { label: "Bronze", count: counts["Bronze"], color: "#f97316" },
          { label: "Not Ranked", count: counts["Not Ranked"], color: "#808080" },
        ]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load rankings list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankingsData();
  }, []);

  const handleRecalculate = async () => {
    try {
      toast.loading("Recalculating school scores & tiers...", { id: "recalc" });
      const res = await recalculateRankings();
      if (res.success) {
        toast.success("Rankings recalculated successfully!", { id: "recalc" });
        fetchRankingsData();
      }
    } catch (err) {
      toast.error(err.message || "Recalculation failed", { id: "recalc" });
    }
  };

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading School Rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {tiers.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-surface p-5 text-center">
            <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full border-2 text-sm font-bold ${tierTone[t.label] || "text-muted-foreground border-border"}`}>
              {t.count}
            </div>
            <p className="mt-3 font-semibold text-foreground">{t.label}</p>
            <p className="text-[11px] text-muted-foreground">schools</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader title="Ranking Distribution" />
          <div className="h-64 px-5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tiers} dataKey="count" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {tiers.map((t, i) => <Cell key={i} fill={t.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 p-5 pt-3 text-xs">
            {tiers.map((t) => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  {t.label}
                </span>
                <span className="font-semibold text-foreground">{t.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader 
            title="Global Rankings Table" 
            subtitle="Calculated live based on academics, achievements, media, and participation scores"
            action={
              <button 
                onClick={handleRecalculate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg cursor-pointer hover:opacity-90 animate-pulse"
              >
                <HiOutlineArrowPath className="h-3.5 w-3.5 animate-spin-slow" /> Recalculate Tiers
              </button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3 text-left">Global Rank</th>
                  <th className="px-5 py-3 text-left">State Rank</th>
                  <th className="px-5 py-3 text-left">School Name</th>
                  <th className="px-5 py-3 text-left">State</th>
                  <th className="px-5 py-3 text-left">District</th>
                  <th className="px-5 py-3 text-left">Performance Score</th>
                  <th className="px-5 py-3 text-left">Current Tier</th>
                </tr>
              </thead>
              <tbody>
                {rankingsList.map((r, index) => (
                  <tr key={r.id} className="border-t border-border hover:bg-white/5 transition">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-foreground">
                      #{r.global_rank || index + 1}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      #{r.state_rank || "-"}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">{r.School?.school_name || "Unknown School"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.School?.District?.State?.state_name || "N/A"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.School?.District?.district_name || "N/A"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min((r.total_score || 0) / 10, 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-foreground">{r.total_score || 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><Tier value={r.RankTier?.name || "Not Ranked"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
