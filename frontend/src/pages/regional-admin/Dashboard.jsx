import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getStateAnalytics } from "../../api/analytics";
import { getInspectionRequests } from "../../api/inspections";
import { getSchools } from "../../api/schools";
import { getMediaList } from "../../api/media";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";
import {
  ArrowUpRight,
  Eye,
  School,
  ArrowRight,
  CheckCircle2,
  Upload,
  Film,
  ClipboardList,
  Video,
  Check,
  MapPin,
  Map,
  Plus,
  BarChart3,
  TrendingUp
} from "lucide-react";
const quickActions = [
  {
    label: "Add School",
    icon: Plus,
    page: "add-school",
    color: "#3B82F6",
    bg: "rgba(59,130,246,.08)",
  },
  {
    label: "Add District",
    icon: Map,
    page: "add-district",
    color: "#10B981",
    bg: "rgba(16,185,129,.08)",
  },
  {
    label: "View Reports",
    icon: ClipboardList,
    page: "inspections",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,.08)",
  },
  {
    label: "Rankings",
    icon: TrendingUp,
    page: "rankings",
    color: "#F59E0B",
    bg: "rgba(245,158,11,.08)",
  },
];

const activityIcons = {
  school: School,
  video: Video,
  check: Check,
  map: Map,
};

const activityColors = {
  school: "#3B82F6",
  video: "#8B5CF6",
  check: "#10B981",
  map: "#F59E0B",
};

const defaultHeatmapDistricts = [
  { name: "Ahmedabad", x: 52, y: 52, schools: 312, color: "#3B82F6" },
  { name: "Surat", x: 38, y: 75, schools: 248, color: "#8B5CF6" },
  { name: "Vadodara", x: 46, y: 63, schools: 198, color: "#10B981" },
  { name: "Rajkot", x: 24, y: 50, schools: 178, color: "#F59E0B" },
  { name: "Gandhinagar", x: 51, y: 46, schools: 156, color: "#6366F1" },
  { name: "Bhavnagar", x: 34, y: 70, schools: 134, color: "#EC4899" },
  { name: "Jamnagar", x: 18, y: 52, schools: 112, color: "#14B8A6" },
  { name: "Junagadh", x: 22, y: 72, schools: 98, color: "#F97316" },
  { name: "Kutch", x: 12, y: 32, schools: 87, color: "#EF4444" },
  { name: "Patan", x: 40, y: 36, schools: 76, color: "#84CC16" },
  { name: "Mehsana", x: 46, y: 38, schools: 72, color: "#06B6D4" },
  { name: "Anand", x: 50, y: 60, schools: 68, color: "#A855F7" },
  { name: "Navsari", x: 40, y: 82, schools: 54, color: "#F43F5E" },
  { name: "Valsad", x: 41, y: 88, schools: 48, color: "#22D3EE" },
];

const districtColors = [
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
  "#F43F5E",
  "#F97316",
  "#F59E0B",
];


// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 14 }
  }
};

function formatTimeAgo(dateStr) {
  if (!dateStr) return "Just now";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [growthTrend, setGrowthTrend] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        const stateId = user?.scope?.stateId || (user?.scope?.stateIds && user.scope.stateIds[0]) || 1;
        const [analyticsRes, schoolsRes, inspectionsRes, mediaRes] = await Promise.all([
          getStateAnalytics(stateId),
          getSchools(),
          getInspectionRequests(),
          getMediaList()
        ]);

        let totalSchoolsCount = 0;
        let activeSchoolsCount = 0;
        let pendingUploadsCount = 0;
        let uploadedMediaCount = 0;
        let inspectionRequestsCount = 0;
        let districtPerf = [];

        if (analyticsRes.success && analyticsRes.data) {
          const m = analyticsRes.data.metrics;
          totalSchoolsCount = m.totalSchools || 0;
          activeSchoolsCount = m.activeSchools || 0;
          uploadedMediaCount = m.mediaUploads || 0;
          districtPerf = analyticsRes.data.districtPerformance || [];
        }

        if (inspectionsRes.success && inspectionsRes.data) {
          inspectionRequestsCount = inspectionsRes.data.filter(r => r.status === "PENDING").length;
        }

        if (mediaRes.success && mediaRes.data) {
          pendingUploadsCount = mediaRes.data.filter(m => m.status === "SUBMITTED").length;
        }

        const statsData = [
          {
            title: "Total Schools",
            value: totalSchoolsCount.toLocaleString(),
            sub: "IN YOUR STATE",
            icon: School,
            color: "#3B82F6",
            bg: "rgba(59,130,246,.1)",
            trend: "+0.0%",
          },
          {
            title: "Active Schools",
            value: activeSchoolsCount.toLocaleString(),
            sub: `${totalSchoolsCount ? Math.round((activeSchoolsCount / totalSchoolsCount) * 100) : 0}% active rate`,
            icon: CheckCircle2,
            color: "#10B981",
            bg: "rgba(16,185,129,.1)",
            trend: "+0.0%",
          },
          {
            title: "Pending Reviews",
            value: pendingUploadsCount.toLocaleString(),
            sub: "Awaiting regional review",
            icon: Upload,
            color: "#F59E0B",
            bg: "rgba(245,158,11,.1)",
            trend: "+0.0%",
          },
          {
            title: "Uploaded Media",
            value: uploadedMediaCount.toLocaleString(),
            sub: "Total media uploads",
            icon: Film,
            color: "#8B5CF6",
            bg: "rgba(139,92,246,.1)",
            trend: "+0.0%",
          },
          {
            title: "Pending Inspections",
            value: inspectionRequestsCount.toLocaleString(),
            sub: "Needs scheduling",
            icon: ClipboardList,
            color: "#EF4444",
            bg: "rgba(239,68,68,.1)",
            trend: "+0.0%",
          },
        ];
        setStats(statsData);

        const mappedDistricts = districtPerf.map((dp, idx) => {
          return {
            id: dp.District?.id || idx,
            name: dp.District?.district_name || "Unknown",
            schools: dp.total_schools || 0,
            platinum: dp.platinum || 0,
            gold: dp.gold || 0,
            silver: dp.silver || 0,
            bronze: dp.bronze || 0
          };
        }).sort((a, b) => b.schools - a.schools);
        
        setDistrictsList(mappedDistricts.length > 0 ? mappedDistricts : [
          { id: 1, name: "No Districts", schools: 0, platinum: 0, gold: 0, silver: 0, bronze: 0 }
        ]);

        const updatedHeatmap = districtPerf.length > 0 ? districtPerf.map((dp, idx) => {
          const count = districtPerf.length;
          const cols = Math.ceil(Math.sqrt(count));
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          
          const jitterX = (Math.sin(idx * 1.5) * 4);
          const jitterY = (Math.cos(idx * 2.3) * 4);
          
          const x = 15 + (cols > 1 ? (col / (cols - 1)) * 70 : 35) + jitterX;
          const y = 15 + (Math.ceil(count / cols) > 1 ? (row / (Math.ceil(count / cols) - 1)) * 70 : 35) + jitterY;
          
          const color = districtColors[idx % districtColors.length];
          return {
            name: dp.District?.district_name || "Unknown",
            x: Math.max(10, Math.min(90, x)),
            y: Math.max(10, Math.min(90, y)),
            schools: dp.total_schools || 0,
            color
          };
        }) : [];
        setHeatmapData(updatedHeatmap);

        let growthData = [];
        if (analyticsRes.success && analyticsRes.data && analyticsRes.data.monthlyGrowth) {
          growthData = analyticsRes.data.monthlyGrowth;
        } else {
          const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
          growthData = months.map((m, index) => ({
            month: m,
            schools: Math.max(0, totalSchoolsCount - (5 - index)),
            media: Math.max(0, uploadedMediaCount - (5 - index) * 2),
          }));
        }
        setGrowthTrend(growthData);

        const list = [];
        if (schoolsRes.success && schoolsRes.data) {
          schoolsRes.data.slice(0, 5).forEach(s => {
            list.push({
              id: `school-${s.id}`,
              type: "school_added",
              text: `School registered: ${s.school_name}`,
              time: formatTimeAgo(s.created_at || s.createdAt),
              timestamp: new Date(s.created_at || s.createdAt),
              icon: "school"
            });
          });
        }

        if (mediaRes.success && mediaRes.data) {
          mediaRes.data.slice(0, 5).forEach(m => {
            list.push({
              id: `media-${m.id}`,
              type: "video_uploaded",
              text: `Media uploaded: ${m.title}`,
              time: formatTimeAgo(m.submitted_at || m.createdAt),
              timestamp: new Date(m.submitted_at || m.createdAt),
              icon: "video"
            });
          });
        }

        if (inspectionsRes.success && inspectionsRes.data) {
          inspectionsRes.data.slice(0, 5).forEach(i => {
            list.push({
              id: `ins-${i.id}`,
              type: "inspection_completed",
              text: `Inspection requested by: ${i.School?.school_name || "School"}`,
              time: formatTimeAgo(i.requested_at || i.createdAt),
              timestamp: new Date(i.requested_at || i.createdAt),
              icon: "check"
            });
          });
        }

        const sortedActivities = list
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);

        setActivityFeed(sortedActivities);

      } catch (err) {
        console.error("Failed to load regional admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Regional Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 regional-admin-theme pb-8 text-left"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {user?.scope?.stateName || "Regional"} Admin Dashboard
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Real-time performance analytics, school rankings, and content approvals for the state of {user?.scope?.stateName || "your assigned region"}.
          </p>
        </div>
        <div 
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs" 
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-secondary)"
          }}
        >
          <MapPin className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} />
          <span className="font-semibold">{user?.scope?.stateName || "Assigned State"}</span>
        </div>
      </div>

      {/* 1. Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((card, idx) => {
          const Icon = card.icon;
          const isNegative = card.trend.startsWith("-");

          return (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: `0 8px 30px ${card.color}18` }}
              className="rounded-2xl p-4 cursor-default transition-shadow duration-200"
              style={{
                background: "var(--glass-card)",
                border: "1px solid var(--glass-border)",
                backdropFilter: "blur(20px)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: card.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-lg flex items-center gap-0.5 font-semibold"
                  style={{
                    background: isNegative ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)",
                    color: isNegative ? "#EF4444" : "#10B981",
                  }}
                >
                  <ArrowUpRight
                    className="w-3 h-3"
                    style={{ transform: isNegative ? "rotate(90deg)" : "none" }}
                  />
                  {card.trend}
                </span>
              </div>
              <div
                className="text-2xl mb-0.5"
                style={{ color: "var(--text-primary)", fontWeight: 700 }}
              >
                {card.value}
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {card.title}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: card.color, fontWeight: 500 }}
              >
                {card.sub}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Heatmap & Growth Chart Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Gujarat Heatmap Card */}
        <motion.div
          variants={cardVariants}
          className="xl:col-span-2 rounded-2xl p-5 flex flex-col"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {user?.scope?.stateName || user?.scope?.stateCode || "Gujarat"} District Heatmap
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                School density by district
              </p>
            </div>
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {[
                ["High", "#3B82F6"],
                ["Medium", "#10B981"],
                ["Low", "#F59E0B"],
              ].map(([level, color]) => (
                <span key={level} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {level}
                </span>
              ))}
            </div>
          </div>

          {/* Heatmap Graphics SVG */}
          <div
            className="relative w-full rounded-xl overflow-hidden flex-1"
            style={{
              height: 250,
              background: "var(--heatmap-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {/* Background Grid Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.05 }}>
              {Array.from({ length: 12 }).map((_, r) => (
                <line
                  key={`h${r}`}
                  x1="0"
                  y1={`${(r * 100) / 11}%`}
                  x2="100%"
                  y2={`${(r * 100) / 11}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: 12 }).map((_, r) => (
                <line
                  key={`v${r}`}
                  x1={`${(r * 100) / 11}%`}
                  y1="0"
                  x2={`${(r * 100) / 11}%`}
                  y2="100%"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Glowing Map Background Overlay */}
            <div
              className="absolute inset-3 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(99, 102, 241, 0.06))",
                border: "1.5px dashed rgba(99, 102, 241, 0.2)",
                borderRadius: "45% 55% 50% 50% / 48% 52% 48% 52%",
              }}
            />

            {heatmapData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-muted)] font-semibold">
                No district schools registered in this state yet.
              </div>
            )}

            {/* Pulsing District Points */}
            {heatmapData.map((dist, idx) => {
              const size = Math.max(26, Math.min(54, dist.schools / 6));
              return (
                <motion.div
                  key={dist.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.3 + idx * 0.04,
                    type: "spring",
                    stiffness: 180,
                  }}
                  whileHover={{ scale: 1.18, zIndex: 10 }}
                  className="absolute flex items-center justify-center rounded-full cursor-pointer"
                  style={{
                    left: `${dist.x}%`,
                    top: `${dist.y}%`,
                    width: size,
                    height: size,
                    transform: "translate(-50%, -50%)",
                    background: `${dist.color}16`,
                    border: `1.5px solid ${dist.color}88`,
                    boxShadow: `0 0 12px ${dist.color}33`,
                  }}
                  onClick={() => navigate("/regional-admin/schools")}
                  title={`${dist.name}: ${dist.schools} schools`}
                >
                  <span
                    style={{
                      color: dist.color,
                      fontSize: 8,
                      fontWeight: 700,
                    }}
                  >
                    {dist.schools}
                  </span>
                </motion.div>
              );
            })}

            {/* District Labels */}
            {heatmapData.slice(0, 5).map((dist) => (
              <div
                key={`lbl-${dist.name}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${dist.x + 3}%`,
                  top: `${dist.y - 6}%`,
                  color: dist.color,
                  fontWeight: 700,
                  fontSize: 9,
                  textShadow: "0 1px 4px rgba(0, 0, 0, 0.7)",
                }}
              >
                {dist.name}
              </div>
            ))}
          </div>

          {/* Growth Chart */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Monthly Growth Metrics
              </p>
              <span className="text-[11px]" style={{ color: "#10B981", fontWeight: 600 }}>
                ↑ Trending up
              </span>
            </div>
            <div className="w-full h-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthTrend} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--dropdown-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 10,
                      fontSize: 11,
                      color: "var(--text-primary)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="schools"
                    name="Schools"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#sg)"
                  />
                  <Area
                    type="monotone"
                    dataKey="media"
                    name="Media Uploaded"
                    stroke="#8B5CF6"
                    strokeWidth={1.5}
                    fill="url(#mg)"
                    strokeDasharray="4 3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Right Side Column (Top Districts & Recent Activity) */}
        <div className="flex flex-col gap-4">
          {/* Top Districts Card */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl p-5"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Top Districts
              </h3>
              <button
                onClick={() => navigate("/regional-admin/districts")}
                className="text-xs flex items-center gap-1 font-semibold"
                style={{ color: "#3B82F6" }}
              >
                <Eye className="w-3.5 h-3.5" /> View All
              </button>
            </div>

            <div className="space-y-3">
              {districtsList.slice(0, 5).map((dist, idx) => (
                <div key={dist.id || idx}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{
                          background:
                            idx === 0
                              ? "#F59E0B"
                              : idx === 1
                                ? "#94A3B8"
                                : idx === 2
                                  ? "#CD7F32"
                                  : "rgba(99, 102, 241, 0.6)",
                          fontSize: 9,
                          fontWeight: 700,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {dist.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        {dist.schools} Schools
                      </span>
                      <span
                        className="text-[9px] px-1 py-0.5 rounded font-bold"
                        style={{
                          background: "rgba(139, 92, 246, 0.1)",
                          color: "#8B5CF6",
                        }}
                      >
                        {dist.platinum}P
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--glass-hover)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dist.schools > 0 ? Math.min(100, (dist.schools / 20) * 100) : 0}%` }}
                      transition={{ delay: 0.4 + idx * 0.1, duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${districtColors[idx % districtColors.length]}, ${
                          districtColors[(idx + 1) % districtColors.length]
                        })`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity Feed Card */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl p-5 flex-1"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {activityFeed.map((act, idx) => {
                const ActivityIcon = activityIcons[act.icon] || School;
                const activityColor = activityColors[act.icon] || "#3B82F6";

                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.08 }}
                    className="flex gap-3 items-start"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${activityColor}15` }}
                    >
                      <ActivityIcon className="w-3.5 h-3.5" style={{ color: activityColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ellipsis overflow-hidden whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                        {act.text}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {act.time}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. District School Distribution Chart & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* District School Distribution Bar Chart */}
        <motion.div
          variants={cardVariants}
          className="xl:col-span-2 rounded-2xl p-5"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              District School Distribution
            </h3>
            <button
              onClick={() => navigate("/regional-admin/districts")}
              className="text-xs flex items-center gap-1 font-semibold"
              style={{ color: "#3B82F6" }}
            >
              <Eye className="w-3.5 h-3.5" /> Details
            </button>
          </div>

          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={districtsList.slice(0, 8)}
                barSize={12}
                barGap={4}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--dropdown-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 10,
                    fontSize: 11,
                    color: "var(--text-primary)",
                  }}
                />
                <Bar dataKey="platinum" name="Platinum" radius={[3, 3, 0, 0]}>
                  {districtsList.slice(0, 8).map((_, idx) => (
                    <Cell key={idx} fill="#8B5CF6" />
                  ))}
                </Bar>
                <Bar dataKey="gold" name="Gold" radius={[3, 3, 0, 0]}>
                  {districtsList.slice(0, 8).map((_, idx) => (
                    <Cell key={idx} fill="#F59E0B" />
                  ))}
                </Bar>
                <Bar dataKey="silver" name="Silver" radius={[3, 3, 0, 0]}>
                  {districtsList.slice(0, 8).map((_, idx) => (
                    <Cell key={idx} fill="#94A3B8" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legends */}
          <div className="flex items-center gap-4 mt-3">
            {[
              ["Platinum", "#8B5CF6"],
              ["Gold", "#F59E0B"],
              ["Silver", "#94A3B8"],
            ].map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions & Category Summary */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl p-5 flex flex-col gap-5"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {/* Quick Actions Grid */}
          <div>
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((act) => {
                const ActionIcon = act.icon;

                return (
                  <motion.button
                    key={act.label}
                    onClick={() => navigate(`/regional-admin/${act.page === "dashboard" ? "" : act.page}`)}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-2 p-3.5 rounded-xl text-center cursor-pointer transition-shadow animate-none"
                    style={{
                      background: act.bg,
                      border: `1px solid ${act.color}20`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${act.color}18` }}
                    >
                      <ActionIcon className="w-4.5 h-4.5" style={{ color: act.color }} />
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {act.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Category Summary progress list */}
          <div
            style={{
              borderTop: "1px solid var(--glass-border)",
              paddingTop: "1rem",
            }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
              Category Summary
            </p>
            {[
              { label: "Platinum", count: districtsList.reduce((acc, d) => acc + (d.platinum || 0), 0), color: "#8B5CF6" },
              { label: "Gold", count: districtsList.reduce((acc, d) => acc + (d.gold || 0), 0), color: "#F59E0B" },
              { label: "Silver", count: districtsList.reduce((acc, d) => acc + (d.silver || 0), 0), color: "#94A3B8" },
            ].map((cat, idx, arr) => {
              const total = arr.reduce((acc, item) => acc + item.count, 0);
              const pct = total > 0 ? (cat.count / total) * 100 : 0;
              return (
                <div key={cat.label} className="mb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                      <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                        {cat.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: cat.color }}>
                      {cat.count}
                    </span>
                  </div>
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: "var(--glass-hover)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
