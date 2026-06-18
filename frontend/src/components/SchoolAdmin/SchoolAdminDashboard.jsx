import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getSchoolAnalytics } from "../../api/analytics";
import { getSchoolRankings, getRankings } from "../../api/rankings";
import { getMediaList } from "../../api/media";
import { useNavigate } from "react-router-dom";
import SchoolAdminStatCard from "./SchoolAdminStatCard.jsx";
import {
  TrendingUp,
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

const statusColor = {
  PUBLISHED: "#10B981",
  SUPER_APPROVED: "#10B981",
  APPROVED: "#10B981",
  PENDING: "#f59e0b",
  REGIONAL_REVIEWED: "#3b82f6",
  SUBMITTED: "#3b82f6",
  REJECTED: "#ef4444",
  DRAFT: "#6b7280",
};

export default function SchoolAdminDashboard({ darkMode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState(null);
  const [rankingData, setRankingData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [topRankedList, setTopRankedList] = useState([]);

  const schoolId = user?.scope?.schoolId || 1;

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode
    ? "1px solid rgba(255,255,255,0.07)"
    : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";
  const gridLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        const [analyticsRes, rankingRes, mediaRes, globalRankRes] = await Promise.all([
          getSchoolAnalytics(schoolId),
          getSchoolRankings(schoolId),
          getMediaList(),
          getRankings(),
        ]);

        if (analyticsRes.success) {
          setSchoolData(analyticsRes.data);
        }
        if (rankingRes.success) {
          setRankingData(rankingRes.data);
        }
        if (mediaRes.success) {
          setSubmissions(mediaRes.data || []);
        }
        if (globalRankRes.success) {
          setTopRankedList(globalRankRes.data.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load school admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user, schoolId]);

  // Construct performance breakdown data
  const performanceBreakdown = [
    { name: "Academic", score: schoolData?.scores?.academic || 0 },
    { name: "Media", score: schoolData?.scores?.media || 0 },
    { name: "Activity", score: schoolData?.scores?.achievements || 0 },
    { name: "Participation", score: schoolData?.scores?.participation || 0 },
  ];

  // Construct submission flow data (group submissions by month)
  const monthlyCounts = {};
  submissions.forEach((s) => {
    const d = new Date(s.submitted_at || s.createdAt);
    const monthName = d.toLocaleString("default", { month: "short" });
    if (!monthlyCounts[monthName]) {
      monthlyCounts[monthName] = { month: monthName, submitted: 0, approved: 0 };
    }
    monthlyCounts[monthName].submitted += 1;
    if (s.status === "SUPER_APPROVED" || s.status === "PUBLISHED" || s.status === "APPROVED") {
      monthlyCounts[monthName].approved += 1;
    }
  });

  const flowData = Object.values(monthlyCounts);
  const displayFlow = flowData.length > 0 ? flowData : [
    { month: "Dec", submitted: 0, approved: 0 },
    { month: "Jan", submitted: 0, approved: 0 },
    { month: "Feb", submitted: 0, approved: 0 },
  ];

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading School Performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SchoolAdminStatCard
          label="Overall Score"
          value={schoolData?.scores?.totalScore || 0}
          change="Calculated live"
          positive={true}
          color="#4f7fff"
          darkMode={darkMode}
        />
        <SchoolAdminStatCard
          label="State Rank"
          value={`#${rankingData?.current?.state_rank || "—"}`}
          change="Rank in State"
          positive={true}
          color="#34d399"
          darkMode={darkMode}
        />
        <SchoolAdminStatCard
          label="Pending Approvals"
          value={submissions.filter(s => s.status === "SUBMITTED" || s.status === "REGIONAL_REVIEWED").length}
          change="Needs review"
          positive={false}
          color="#f59e0b"
          darkMode={darkMode}
        />
        <SchoolAdminStatCard
          label="Uploaded Media"
          value={schoolData?.totalMediaUploads || 0}
          change="Total reels"
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
                Monthly submissions vs approvals
              </p>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: "rgba(79,127,255,0.12)", color: "#4f7fff" }}
            >
              Live Stats
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={displayFlow}>
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
                name="Submitted"
                stroke="#4f7fff"
                fill="url(#blueGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="approved"
                name="Approved"
                stroke="#34d399"
                fill="url(#greenGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Score components breakdown */}
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
              Score Breakdown
            </h3>
            <p className="text-xs" style={{ color: textMuted }}>
              Your school score by category
            </p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={performanceBreakdown} layout="vertical">
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
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: darkMode ? "#0f1631" : "#fff",
                  border: "1px solid rgba(79,127,255,0.2)",
                  borderRadius: "12px",
                  color: textPrimary,
                }}
              />
              <Bar dataKey="score" name="Category Score" fill="#4f7fff" radius={4} />
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
                Latest uploaded reels status
              </p>
            </div>
            <button
              onClick={() => navigate("/school-admin/media-approval")}
              className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70 bg-transparent border-0 cursor-pointer font-semibold"
              style={{ color: "#4f7fff" }}
            >
              View All <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {submissions.slice(0, 4).map((s) => (
              <div
                key={s.id}
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
                    background: "rgba(139,92,246,0.15)"
                  }}
                >
                  <Video size={14} style={{ color: "#8b5cf6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: textPrimary }}
                  >
                    {s.title}
                  </div>
                  <div className="text-xs font-mono" style={{ color: textMuted }}>
                    {s.submission_code} · {new Date(s.submitted_at || s.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold flex-shrink-0"
                  style={{
                    background: `${statusColor[s.status] || "#6b7280"}18`,
                    color: statusColor[s.status] || "#6b7280",
                  }}
                >
                  {s.status}
                </span>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-8 text-xs" style={{ color: textMuted }}>
                No submissions uploaded yet.
              </div>
            )}
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
              Top Ranked Schools
            </h3>
            <div className="space-y-2.5">
              {topRankedList.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-5 text-center font-bold text-[var(--text-muted)]"
                  >
                    #{s.global_rank}
                  </span>
                  <span
                    className="flex-1 truncate"
                    style={{ color: textPrimary }}
                  >
                    {s.School?.school_name}
                  </span>
                  <span
                    className="font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400"
                  >
                    {s.RankTier?.tier_name}
                  </span>
                </div>
              ))}
              {topRankedList.length === 0 && (
                <div className="text-center text-xs py-4" style={{ color: textMuted }}>
                  No active rankings.
                </div>
              )}
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
                  label: "Upload reels",
                  icon: Camera,
                  color: "#4f7fff",
                  page: "uploads",
                },
                {
                  label: "Reels Center",
                  icon: Video,
                  color: "#8b5cf6",
                  page: "uploads",
                },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/school-admin/${a.page}`)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all hover:scale-[1.04] border-0 cursor-pointer"
                  style={{
                    background: `${a.color}12`,
                    border: `1px solid ${a.color}25`,
                  }}
                >
                  <a.icon size={18} style={{ color: a.color }} />
                  <span
                    className="text-xs font-semibold leading-tight text-[var(--text-primary)]"
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
