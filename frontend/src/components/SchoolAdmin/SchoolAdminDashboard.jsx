import {
  TrendingUp,
  TrendingDown,
  Camera,
  Video,
  Activity,
  Award,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import SchoolAdminStatCard from "./SchoolAdminStatCard.jsx";
import {
  submissionFlow,
  districtPerf,
  recentSubmissions,
  topSchools,
  statusColor,
  badgeColor,
} from "../../data/schoolAdminMockData.js";

export default function SchoolAdminDashboard({ darkMode }) {
  const navigate = useNavigate();
  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode
    ? "1px solid rgba(255,255,255,0.07)"
    : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";
  const gridLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SchoolAdminStatCard
          label="Total Schools"
          value="1"
          change="+0"
          positive={true}
          color="#4f7fff"
          darkMode={darkMode}
        />
        <SchoolAdminStatCard
          label="Active Schools"
          value="1"
          change="+2.4%"
          positive={true}
          color="#34d399"
          darkMode={darkMode}
        />
        <SchoolAdminStatCard
          label="Pending Approvals"
          value="8"
          change="-3"
          positive={false}
          color="#f59e0b"
          darkMode={darkMode}
        />
        <SchoolAdminStatCard
          label="Top Rank"
          value="#12"
          change="+3"
          positive={true}
          color="#8b5cf6"
          darkMode={darkMode}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Submission Flow */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: textPrimary }}>
                Submission Flow
              </h3>
              <p className="text-xs" style={{ color: textMuted }}>
                Last 6 months activity
              </p>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: "rgba(79,127,255,0.12)", color: "#4f7fff" }}
            >
              Monthly
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={submissionFlow}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f7fff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f7fff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="month" stroke={textMuted} tick={{ fontSize: 11 }} />
              <YAxis stroke={textMuted} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: darkMode ? "#0f1631" : "#fff",
                  border: "1px solid rgba(79,127,255,0.2)",
                  borderRadius: "12px",
                  color: textPrimary,
                }}
              />
              <Area
                type="monotone"
                dataKey="submitted"
                stroke="#4f7fff"
                fill="url(#blueGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="approved"
                stroke="#34d399"
                fill="url(#greenGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* District Performance */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow,
          }}
        >
          <div className="mb-4">
            <h3 className="font-semibold" style={{ color: textPrimary }}>
              District Performance
            </h3>
            <p className="text-xs" style={{ color: textMuted }}>
              Score by district
            </p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={districtPerf} layout="vertical">
              <XAxis
                type="number"
                stroke={textMuted}
                tick={{ fontSize: 10 }}
                domain={[0, 100]}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke={textMuted}
                tick={{ fontSize: 10 }}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  background: darkMode ? "#0f1631" : "#fff",
                  border: "1px solid rgba(79,127,255,0.2)",
                  borderRadius: "12px",
                  color: textPrimary,
                }}
              />
              <Bar dataKey="score" fill="#4f7fff" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent submissions */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: textPrimary }}>
                My Recent Submissions
              </h3>
              <p className="text-xs" style={{ color: textMuted }}>
                Latest uploaded content
              </p>
            </div>
            <button
              onClick={() => navigate("/school-admin/media-approval")}
              className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: "#4f7fff" }}
            >
              View All <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentSubmissions.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                style={{
                  background: darkMode
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(0,0,0,0.02)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      s.type === "Photos"
                        ? "rgba(79,127,255,0.15)"
                        : s.type === "Videos"
                          ? "rgba(139,92,246,0.15)"
                          : s.type === "Activity"
                            ? "rgba(34,211,238,0.15)"
                            : "rgba(245,158,11,0.15)",
                  }}
                >
                  {s.type === "Photos" ? (
                    <Camera size={14} style={{ color: "#4f7fff" }} />
                  ) : s.type === "Videos" ? (
                    <Video size={14} style={{ color: "#8b5cf6" }} />
                  ) : s.type === "Activity" ? (
                    <Activity size={14} style={{ color: "#22d3ee" }} />
                  ) : (
                    <Award size={14} style={{ color: "#f59e0b" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: textPrimary }}
                  >
                    {s.title}
                  </div>
                  <div className="text-xs" style={{ color: textMuted }}>
                    {s.date} · {s.type}
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
                  style={{
                    background: `${statusColor[s.status]}18`,
                    color: statusColor[s.status],
                  }}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Top Schools */}
          <div
            className="rounded-2xl p-5 flex-1"
            style={{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow,
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: textPrimary }}>
              Top Schools
            </h3>
            <div className="space-y-2">
              {topSchools.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-5 text-center font-bold"
                    style={{ color: textMuted }}
                  >
                    #{s.rank}
                  </span>
                  <span
                    className="flex-1 truncate"
                    style={{ color: textPrimary }}
                  >
                    {s.name}
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: badgeColor[s.badge] }}
                  >
                    {s.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow,
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: textPrimary }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Upload Photos",
                  icon: Camera,
                  color: "#4f7fff",
                  page: "uploads",
                },
                {
                  label: "Upload Videos",
                  icon: Video,
                  color: "#8b5cf6",
                  page: "uploads",
                },
                {
                  label: "Create Activity",
                  icon: Activity,
                  color: "#22d3ee",
                  page: "uploads",
                },
                {
                  label: "Add Achievement",
                  icon: Award,
                  color: "#f59e0b",
                  page: "uploads",
                },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/school-admin/${a.page}`)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all hover:scale-[1.04]"
                  style={{
                    background: `${a.color}12`,
                    border: `1px solid ${a.color}25`,
                  }}
                >
                  <a.icon size={18} style={{ color: a.color }} />
                  <span
                    className="text-xs font-medium leading-tight"
                    style={{ color: textPrimary }}
                  >
                    {a.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
