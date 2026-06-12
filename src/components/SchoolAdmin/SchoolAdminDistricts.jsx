import { Building2, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const districtTable = [
  { name: "Central District", schools: 34, students: 12450, avgRank: "Silver", points: 4637, trend: "+1.2%" },
  { name: "North District", schools: 28, students: 9800, avgRank: "Gold", points: 4192, trend: "+0.8%" },
  { name: "South District", schools: 42, students: 15200, avgRank: "Silver", points: 4831, trend: "-0.5%" },
  { name: "East District", schools: 19, students: 6400, avgRank: "Bronze", points: 3721, trend: "+2.1%" },
  { name: "West District", schools: 31, students: 10800, avgRank: "Gold", points: 4523, trend: "+1.5%" },
  { name: "Gandhinagar", schools: 22, students: 7900, avgRank: "Silver", points: 4130, trend: "+0.3%" },
  { name: "Bhavnagar", schools: 16, students: 5600, avgRank: "Bronze", points: 3892, trend: "-0.2%" },
];

const trendData = [
  { month: "Dec", Central: 72, North: 68, South: 80 },
  { month: "Jan", Central: 75, North: 70, South: 82 },
  { month: "Feb", Central: 74, North: 73, South: 85 },
  { month: "Mar", Central: 78, North: 75, South: 83 },
  { month: "Apr", Central: 80, North: 77, South: 88 },
  { month: "May", Central: 82, North: 79, South: 91 },
];

const activitySummary = [
  { month: "Jan", Activities: 180, Approved: 150, Pending: 30 },
  { month: "Feb", Activities: 220, Approved: 190, Pending: 30 },
  { month: "Mar", Activities: 195, Approved: 162, Pending: 33 },
  { month: "Apr", Activities: 240, Approved: 210, Pending: 30 },
  { month: "May", Activities: 280, Approved: 248, Pending: 32 },
];

const badgeColor = { Gold: "#f59e0b", Silver: "#94a3b8", Bronze: "#cd7c2f", Platinum: "#e2e8f0" };

export default function SchoolAdminDistricts({ darkMode }) {
  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";
  const gridLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Districts", value: "25", color: "#4f7fff", icon: Building2 },
          { label: "Total Schools", value: "625", color: "#34d399", sub: "+12 from last month" },
          { label: "Active Schools", value: "542", color: "#22d3ee", sub: "86% Active" },
          { label: "District Avg. Rank", value: "Silver", color: "#94a3b8", sub: "+Rank improved" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
              <Building2 size={18} style={{ color: s.color }} />
            </div>
            <div className="font-bold" style={{ color: textPrimary, fontSize: "1.5rem", lineHeight: 1 }}>{s.value}</div>
            <div className="text-sm mt-1" style={{ color: textMuted }}>{s.label}</div>
            {s.sub && <div className="text-xs mt-1" style={{ color: "#34d399" }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Performance Trend</h3>
          <p className="text-xs mb-4" style={{ color: textMuted }}>Last 6 months — Top Districts</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="month" stroke={textMuted} tick={{ fontSize: 11 }} />
              <YAxis stroke={textMuted} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: darkMode ? "#0f1631" : "#fff", border: "1px solid rgba(79,127,255,0.2)", borderRadius: "12px", color: textPrimary }} />
              <Legend />
              <Line type="monotone" dataKey="Central" stroke="#4f7fff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="North" stroke="#22d3ee" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="South" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Activity Summary</h3>
          <p className="text-xs mb-4" style={{ color: textMuted }}>Submissions vs Approvals</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activitySummary}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="month" stroke={textMuted} tick={{ fontSize: 11 }} />
              <YAxis stroke={textMuted} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: darkMode ? "#0f1631" : "#fff", border: "1px solid rgba(79,127,255,0.2)", borderRadius: "12px", color: textPrimary }} />
              <Legend />
              <Bar dataKey="Activities" fill="#4f7fff" radius={[4,4,0,0]} />
              <Bar dataKey="Approved" fill="#34d399" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Performance Table */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: textPrimary }}>District Performance Overview</h3>
          <button className="text-xs flex items-center gap-1" style={{ color: "#4f7fff" }}>View All <ArrowUpRight size={12} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                {["District Name", "Schools", "Students", "Avg. Rank", "Total Points", "Trend"].map(h => (
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-medium" style={{ color: textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {districtTable.map((d, i) => (
                <tr key={i} style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.03)" }}>
                  <td className="py-3 pr-4 font-medium" style={{ color: textPrimary }}>{d.name}</td>
                  <td className="py-3 pr-4" style={{ color: textMuted }}>{d.schools}</td>
                  <td className="py-3 pr-4" style={{ color: textMuted }}>{d.students.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: badgeColor[d.avgRank], background: `${badgeColor[d.avgRank]}18` }}>{d.avgRank}</span>
                  </td>
                  <td className="py-3 pr-4 font-medium" style={{ color: textPrimary }}>{d.points.toLocaleString()}</td>
                  <td className="py-3">
                    <span className="text-xs flex items-center gap-1" style={{ color: d.trend.startsWith("+") ? "#34d399" : "#ef4444" }}>
                      {d.trend.startsWith("+") ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {d.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
