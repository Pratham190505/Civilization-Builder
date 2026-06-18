import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getSchoolAnalytics } from "../../api/analytics";
import { getSchoolRankings, getRankings } from "../../api/rankings";
import { Trophy, Star, TrendingUp, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const badgeColor = { Platinum: "#e2e8f0", Gold: "#f59e0b", Silver: "#94a3b8", Bronze: "#CD7F32" };

const badges = [
  { name: "100 Activities", icon: "🏃", earned: true, date: "20 May 2026" },
  { name: "Media Master", icon: "📸", earned: true, date: "15 Apr 2026" },
  { name: "Active Uploader", icon: "⬆️", earned: true, date: "01 Mar 2026" },
  { name: "Gold Achiever", icon: "🥇", earned: true, date: "20 May 2026" },
  { name: "Top 10 School", icon: "🔟", earned: false, date: "" },
  { name: "Platinum Club", icon: "💎", earned: false, date: "" },
];

export default function SchoolAdminRankings({ darkMode }) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState(null);
  const [rankingData, setRankingData] = useState(null);
  const [globalRankings, setGlobalRankings] = useState([]);

  const schoolId = user?.scope?.schoolId || 1;

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";
  const gridLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [analyticsRes, rankingRes, globalRes] = await Promise.all([
          getSchoolAnalytics(schoolId),
          getSchoolRankings(schoolId),
          getRankings()
        ]);

        if (analyticsRes.success) {
          setSchoolData(analyticsRes.data);
        }
        if (rankingRes.success) {
          setRankingData(rankingRes.data);
        }
        if (globalRes.success) {
          setGlobalRankings(globalRes.data || []);
        }
      } catch (err) {
        console.error("Failed to load school rankings page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, schoolId]);

  // Construct rankHistory chart data
  const historyChartData = (rankingData?.history || []).map(h => ({
    month: new Date(h.calculated_at || h.createdAt).toLocaleString("default", { month: "short" }),
    rank: h.state_rank || 1
  })).reverse();

  const displayHistory = historyChartData.length > 0 ? historyChartData : [
    { month: "Dec", rank: rankingData?.current?.state_rank || 1 },
    { month: "Jan", rank: rankingData?.current?.state_rank || 1 },
  ];

  // Construct score breakdown components
  const scoreBreakdown = [
    { category: "Academic Score", score: schoolData?.scores?.academic || 0, max: 100, color: "#4f7fff" },
    { category: "Media Uploads", score: schoolData?.scores?.media || 0, max: 100, color: "#8b5cf6" },
    { category: "Achievements & Activities", score: schoolData?.scores?.achievements || 0, max: 100, color: "#22d3ee" },
    { category: "Participation Scope", score: schoolData?.scores?.participation || 0, max: 100, color: "#f59e0b" },
  ];

  // Construct local leaderboard comparison list (find nearby ranked schools)
  const idx = globalRankings.findIndex(r => r.school_id === schoolId);
  let nearbyLeaderboard = [];
  if (idx !== -1) {
    const start = Math.max(0, idx - 2);
    const end = Math.min(globalRankings.length, idx + 3);
    nearbyLeaderboard = globalRankings.slice(start, end).map(r => ({
      rank: r.state_rank,
      name: r.School?.school_name,
      district: r.School?.District?.district_name || "N/A",
      score: r.total_score,
      badge: r.RankTier?.tier_name || "Silver",
      isMySchool: r.school_id === schoolId
    }));
  } else {
    nearbyLeaderboard = globalRankings.slice(0, 5).map(r => ({
      rank: r.state_rank,
      name: r.School?.school_name,
      district: r.School?.District?.district_name || "N/A",
      score: r.total_score,
      badge: r.RankTier?.tier_name || "Silver",
      isMySchool: false
    }));
  }

  const currentScore = rankingData?.current?.total_score || schoolData?.scores?.totalScore || 0;
  const currentTier = rankingData?.current?.RankTier?.tier_name || "Silver";

  const statsConfig = [
    { label: "Current Rank", value: `#${rankingData?.current?.state_rank || "—"}`, icon: Trophy, color: "#f59e0b", sub: "Rank in State" },
    { label: "Total Score", value: parseFloat(currentScore).toFixed(1), icon: Star, color: "#4f7fff", sub: "Out of 100 pts" },
    { label: "Rank Tier", value: currentTier, icon: Award, color: "#f59e0b", sub: "Calculated dynamically" },
    { label: "Global Rank", value: `#${rankingData?.current?.global_rank || "—"}`, icon: TrendingUp, color: "#34d399", sub: "Overall Rank position" },
  ];

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading School Standings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsConfig.map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div className="font-bold" style={{ color: s.color, fontSize: "1.5rem", lineHeight: 1 }}>{s.value}</div>
            <div className="text-sm mt-1 font-semibold" style={{ color: textPrimary }}>{s.label}</div>
            <div className="text-xs mt-1" style={{ color: textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rank Progress Chart */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Rank Progress Over Time</h3>
          <p className="text-xs mb-4" style={{ color: textMuted }}>State rank snapshot history</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={displayHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="month" stroke={textMuted} tick={{ fontSize: 11 }} />
              <YAxis stroke={textMuted} tick={{ fontSize: 11 }} reversed />
              <Tooltip contentStyle={{ background: darkMode ? "#0f1631" : "#fff", border: "1px solid rgba(79,127,255,0.2)", borderRadius: "12px", color: textPrimary }} formatter={(v) => [`#${v}`, "Rank"]} />
              <Line type="monotone" dataKey="rank" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: "#f59e0b", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Score Breakdown Radial Visual */}
        <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <h3 className="font-semibold mb-4" style={{ color: textPrimary }}>Score Breakdown</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke={darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 50 * (currentScore / 100)} ${2 * Math.PI * 50}`} strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <div className="font-bold" style={{ color: "#f59e0b", fontSize: "1.4rem", lineHeight: 1 }}>
                  {parseFloat(currentScore).toFixed(1)}
                </div>
                <div className="text-xs" style={{ color: textMuted }}>/ 100.0</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {scoreBreakdown.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-xs flex-1" style={{ color: textMuted }}>{s.category}</span>
                <span className="text-xs font-semibold" style={{ color: s.color }}>{parseFloat(s.score).toFixed(1)}/{s.max}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <h3 className="font-semibold mb-4" style={{ color: textPrimary }}>Rank Comparison — Standings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                {["Rank", "School Name", "District", "Total Score", "Tier"].map(h => (
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-medium" style={{ color: textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nearbyLeaderboard.map((s, i) => (
                <tr key={i} className="transition-all"
                  style={{
                    borderBottom: darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.03)",
                    background: s.isMySchool ? (darkMode ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.04)") : "transparent",
                  }}>
                  <td className="py-3 pr-4">
                    <span className="font-bold" style={{ color: s.rank <= 3 ? "#f59e0b" : textPrimary }}>#{s.rank}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold" style={{ color: s.isMySchool ? "#f59e0b" : textPrimary }}>
                      {s.name} {s.isMySchool && <span className="text-xs px-1.5 py-0.5 rounded-full ml-1" style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}>You</span>}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs" style={{ color: textMuted }}>{s.district}</td>
                  <td className="py-3 pr-4 font-semibold" style={{ color: textPrimary }}>{parseFloat(s.score).toFixed(1)}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-bold" style={{ color: badgeColor[s.badge] || "#8892a4" }}>{s.badge}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <h3 className="font-semibold mb-4" style={{ color: textPrimary }}>Badges & Achievements</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {badges.map((b, i) => (
            <div key={i} className="rounded-xl p-3 text-center transition-all"
              style={{
                background: b.earned ? (darkMode ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)") : (darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
                border: b.earned ? "1px solid rgba(245,158,11,0.25)" : (darkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)"),
                opacity: b.earned ? 1 : 0.4,
              }}>
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-xs font-semibold" style={{ color: textPrimary }}>{b.name}</div>
              {b.earned && <div className="text-[10px] mt-1" style={{ color: textMuted }}>{b.date}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
