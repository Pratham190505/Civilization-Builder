import { Trophy, Star, TrendingUp, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const rankHistory = [
  { month: "Nov", rank: 18 },
  { month: "Dec", rank: 16 },
  { month: "Jan", rank: 15 },
  { month: "Feb", rank: 14 },
  { month: "Mar", rank: 13 },
  { month: "Apr", rank: 13 },
  { month: "May", rank: 12 },
];

const leaderboard = [
  { rank: 1, name: "GDS Excellence Academy", district: "Mumbai", score: 980, badge: "Platinum", change: "→" },
  { rank: 2, name: "National Model School", district: "Delhi", score: 962, badge: "Platinum", change: "↑" },
  { rank: 3, name: "Sunrise International", district: "Pune", score: 948, badge: "Platinum", change: "↓" },
  { rank: 11, name: "GDS Vadodara", district: "Vadodara", score: 895, badge: "Gold", change: "↑" },
  { rank: 12, name: "ABC International School", district: "Ahmedabad", score: 892, badge: "Gold", change: "↑", isMySchool: true },
  { rank: 13, name: "Bright School", district: "Surat", score: 878, badge: "Gold", change: "→" },
  { rank: 14, name: "Morning Star School", district: "Rajkot", score: 861, badge: "Gold", change: "↓" },
];

const scoreBreakdown = [
  { category: "Photos", score: 320, max: 400, color: "#4f7fff" },
  { category: "Videos", score: 280, max: 400, color: "#8b5cf6" },
  { category: "Activities", score: 180, max: 200, color: "#22d3ee" },
  { category: "Achievements", score: 72, max: 100, color: "#f59e0b" },
];

const badges = [
  { name: "100 Activities", icon: "🏃", earned: true, date: "20 May 2024" },
  { name: "Media Master", icon: "📸", earned: true, date: "15 Apr 2024" },
  { name: "Active Uploader", icon: "⬆️", earned: true, date: "01 Mar 2024" },
  { name: "Gold Achiever", icon: "🥇", earned: true, date: "20 May 2024" },
  { name: "Top 10 School", icon: "🔟", earned: false, date: "" },
  { name: "Platinum Club", icon: "💎", earned: false, date: "" },
];

const badgeColor = { Platinum: "#e2e8f0", Gold: "#f59e0b", Silver: "#94a3b8" };

export default function SchoolAdminRankings({ darkMode }) {
  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";
  const gridLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Current Rank", value: "#12", icon: Trophy, color: "#f59e0b", sub: "Top 1% of all schools" },
          { label: "Total Score", value: "892", icon: Star, color: "#4f7fff", sub: "Out of 1000 pts" },
          { label: "Rank Position", value: "Gold", icon: Award, color: "#f59e0b", sub: "Top 5% nationally" },
          { label: "Best Rank", value: "#10", icon: TrendingUp, color: "#34d399", sub: "Achieved in Apr 2024" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div className="font-bold" style={{ color: s.color, fontSize: "1.5rem", lineHeight: 1 }}>{s.value}</div>
            <div className="text-sm mt-1 font-medium" style={{ color: textPrimary }}>{s.label}</div>
            <div className="text-xs mt-1" style={{ color: textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rank Progress Chart */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Rank Progress Over Time</h3>
          <p className="text-xs mb-4" style={{ color: textMuted }}>Lower number = Better rank</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={rankHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="month" stroke={textMuted} tick={{ fontSize: 11 }} />
              <YAxis stroke={textMuted} tick={{ fontSize: 11 }} reversed domain={[10, 20]} />
              <Tooltip contentStyle={{ background: darkMode ? "#0f1631" : "#fff", border: "1px solid rgba(79,127,255,0.2)", borderRadius: "12px", color: textPrimary }} formatter={(v) => [`#${v}`, "Rank"]} />
              <Line type="monotone" dataKey="rank" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: "#f59e0b", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-center mt-2" style={{ color: "#34d399" }}>✓ Rank improved by 6 positions this month</p>
        </div>

        {/* Score Breakdown */}
        <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <h3 className="font-semibold mb-4" style={{ color: textPrimary }}>Score Breakdown</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke={darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 50 * 0.892} ${2 * Math.PI * 50}`} strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <div className="font-bold" style={{ color: "#f59e0b", fontSize: "1.4rem", lineHeight: 1 }}>850</div>
                <div className="text-xs" style={{ color: textMuted }}>/ 1000</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {scoreBreakdown.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-xs flex-1" style={{ color: textMuted }}>{s.category}</span>
                <span className="text-xs font-semibold" style={{ color: s.color }}>{s.score}/{s.max}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <h3 className="font-semibold mb-4" style={{ color: textPrimary }}>Rank Comparison — Nearby Schools</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                {["Rank", "School Name", "District", "Total Score", "Badge", "Change"].map(h => (
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-medium" style={{ color: textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((s, i) => (
                <tr key={i} className="transition-all"
                  style={{
                    borderBottom: darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.03)",
                    background: s.isMySchool ? (darkMode ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.04)") : "transparent",
                  }}>
                  <td className="py-3 pr-4">
                    <span className="font-bold" style={{ color: s.rank <= 3 ? "#f59e0b" : textPrimary }}>#{s.rank}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-medium" style={{ color: s.isMySchool ? "#f59e0b" : textPrimary }}>
                      {s.name} {s.isMySchool && <span className="text-xs px-1.5 py-0.5 rounded-full ml-1" style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}>You</span>}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs" style={{ color: textMuted }}>{s.district}</td>
                  <td className="py-3 pr-4 font-semibold" style={{ color: textPrimary }}>{s.score}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-semibold" style={{ color: badgeColor[s.badge] }}>{s.badge}</span>
                  </td>
                  <td className="py-3 text-lg" style={{ color: s.change === "↑" ? "#34d399" : s.change === "↓" ? "#ef4444" : textMuted }}>{s.change}</td>
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
              <div className="text-xs font-medium" style={{ color: textPrimary }}>{b.name}</div>
              {b.earned && <div className="text-xs mt-1" style={{ color: textMuted }}>{b.date}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
